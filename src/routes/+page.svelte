<script>
    import { onDestroy, onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { Vibrant } from 'node-vibrant/browser';

    // External spotify helpers (kept grouped)
    import {
        getCurrentlyPlaying,
        getTrack,
        hasToken,
        logout,
        redirectToAuthCodeFlow
    , api } from '$lib/spotify.js';

    // Keep the tab title stable so the browser never falls back to showing the callback URL
    const APP_TITLE = 'Sonora 🎧';
    function setAppTitle() {
        if (!browser) return;
        try {
            document.title = APP_TITLE;
        } catch (e) {
            /* ignore */
        }
    }

    /* -------------------------
       Constants / configuration
    ------------------------- */

    const SWATCH_ORDER_DEFAULT = ['Vibrant', 'DarkVibrant', 'DarkMuted', 'Muted'];

    /* -------------------------
       Runtime-configurable state
    ------------------------- */
    let swatchOrder = SWATCH_ORDER_DEFAULT;

    if (browser) {
        try {
            const p = new URL(location.href).searchParams.get('swatch');
            if (p)
                swatchOrder = p
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
        } catch (e) {
            /* ignore */
        }

        // expose for quick dev toggles in console
        window.__VIBRANT_SWATCH_ORDER = swatchOrder;
    }

    /* -------------------------
       Component state
    ------------------------- */
    let authorized = false;
    let nowPlaying = null;
    let trackExtra = null;
    let lastTrackId = null;
    let error = null;
    let timer;
    let glow = null; 
    let glowSoft = null; 

    /* -------------------------
       Utility helpers
    ------------------------- */
    function formatTime(ms) {
        const s = Math.floor((ms || 0) / 1000);
        const m = Math.floor(s / 60);
        const ss = String(s % 60).padStart(2, '0');
        return `${m}:${ss}`;
    }

    /* -------------------------
       Spotify / API interactions
    ------------------------- */
    async function updateNowPlaying() {
        try {
            const np = await getCurrentlyPlaying();
            nowPlaying = np || null;
            error = null;

            const id = np?.item?.id || null;
            if (id && id !== lastTrackId) {
                lastTrackId = id;
                trackExtra = np?.item?.popularity == null ? await getTrack(id) : null;
            }
        } catch (e) {
            error = String(e);
        }
    }

    // --- Player control helpers (use existing api helper) ---
    async function play() {
        if (!browser) return;
        try {
            await api('/me/player/play', { method: 'PUT' });
            await updateNowPlaying();
        } catch (e) {
            error = String(e);
        }
    }

    async function pause() {
        if (!browser) return;
        try {
            await api('/me/player/pause', { method: 'PUT' });
            await updateNowPlaying();
        } catch (e) {
            error = String(e);
        }
    }

    async function nextTrack() {
        if (!browser) return;
        try {
            await api('/me/player/next', { method: 'POST' });
            setTimeout(updateNowPlaying, 250);
        } catch (e) {
            error = String(e);
        }
    }

    async function previousTrack() {
        if (!browser) return;
        try {
            await api('/me/player/previous', { method: 'POST' });
            setTimeout(updateNowPlaying, 250);
        } catch (e) {
            error = String(e);
        }
    }

    function togglePlayPause() {
        if (nowPlaying?.is_playing) pause();
        else play();
    }

    // (shuffle/repeat controls removed - simplified player controls only)

    // Seek to a position when the progress bar is clicked
    async function seek(e) {
        if (!browser || !track || !track.duration_ms) return;
        try {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const pct = Math.max(0, Math.min(1, x / rect.width));
            const position = Math.floor(pct * track.duration_ms);
            await api(`/me/player/seek?position_ms=${position}`, { method: 'PUT' });
            // refresh UI after a short delay
            setTimeout(updateNowPlaying, 200);
        } catch (e) {
            error = String(e);
        }
    }

    // Keyboard support for the progress bar: ArrowLeft/Right seek, Home/End, Space/Enter toggle play
    function handleProgressKeydown(e) {
        if (!browser || !track || !nowPlaying) return;
        const step = 5000; // 5s
        let pos = nowPlaying?.progress_ms || 0;
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            pos = Math.max(0, pos - step);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            pos = Math.min(track.duration_ms, pos + step);
        } else if (e.key === 'Home') {
            e.preventDefault();
            pos = 0;
        } else if (e.key === 'End') {
            e.preventDefault();
            pos = track.duration_ms;
        } else if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            togglePlayPause();
            return;
        } else {
            return;
        }
        api(`/me/player/seek?position_ms=${Math.floor(pos)}`, { method: 'PUT' })
            .then(() => setTimeout(updateNowPlaying, 150))
            .catch((err) => (error = String(err)));
    }

    function signout() {
        logout();
        authorized = false;
        nowPlaying = null;
        trackExtra = null;
        lastTrackId = null;
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        // ensure title stays correct when signing out
        setAppTitle();
    }

    /* -------------------------
       Color extraction (Vibrant)
    ------------------------- */
    async function computeGlow(url) {
        try {
            if (!url) {
                glow = null;
                glowSoft = null;
                return;
            }
            const palette = await Vibrant.from(url).getPalette();

            // pick the first available swatch from swatchOrder
            let sw = null;
            for (const name of swatchOrder) {
                if (palette?.[name]) {
                    sw = palette[name];
                    break;
                }
            }
            if (!sw) {
                sw = Object.values(palette).find(Boolean) || null;
            }

            if (sw?.rgb) {
                const [r, g, b] = sw.rgb;
                glow = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 1)`;
                // softer, larger halo used by CSS (lower alpha)
                glowSoft = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 1)`;
            } else if (sw?.hex) {
                glow = sw.hex;
                // fallback semi-transparent hex is not perfect; use rgba fallback above if possible
                glowSoft = sw.hex;
            } else {
                glow = null;
                glowSoft = null;
            }
        } catch {
            glow = null;
            glowSoft = null;
        }
    }

    /* -------------------------
       Lifecycle
    ------------------------- */
    onMount(async () => {
        if (!browser) return;
        authorized = hasToken();
        if (authorized) {
            await updateNowPlaying();
            timer = setInterval(updateNowPlaying, 1000);
        }
        // enforce a stable tab title when the page mounts / after redirect
        setAppTitle();
    });

    onDestroy(() => {
        if (timer) clearInterval(timer);
    });

    /* -------------------------
       Reactive declarations
    ------------------------- */
    $: track = nowPlaying?.item;
    $: coverUrl = track?.album?.images?.[0]?.url || '';
    $: popularity = track?.popularity ?? trackExtra?.popularity ?? null;

    // Recompute glow when album art changes (only in browser)
    $: if (browser && coverUrl) {
        computeGlow(coverUrl);
    }

    // Reactive guard: ensure the app title remains set in the browser environment
    $: if (browser) {
        setAppTitle();
    }
</script>

<!-- Status bar -->
<div class="status" class:connected={authorized} class:disconnected={!authorized}>
    <span class="dot {authorized ? 'green' : 'red'}"></span>
    <span>Status: {authorized ? 'Connected' : 'Disconnected'}</span>
    {#if authorized}
        <button on:click={signout}>Sign Out</button>
    {:else}
        <button on:click={redirectToAuthCodeFlow}>Sign In</button>
    {/if}
</div>

{#if authorized}
    {#if error}<p class="err">{error}</p>{/if}

    {#if track}
        <div class="layout" style={`--label:url(${coverUrl}); --glow:${glow ?? ''}; --glow-soft:${glowSoft ?? ''};`}>
            <!-- Left: track details -->
            <div class="left">
                <h1 class="title">
                    {track.name}
                </h1>

                <div class="sub">
                    {track.artists?.map((a) => a.name).join(', ')} • {track.album?.name}
                </div>

                <div
                    class="progress"
                    role="slider"
                    tabindex="0"
                    aria-label="Playback position"
                    aria-valuemin="0"
                    aria-valuemax={track?.duration_ms}
                    aria-valuenow={nowPlaying?.progress_ms ?? 0}
                    on:click={seek}
                    on:keydown={handleProgressKeydown}
                >
                    {#if track.duration_ms}
                        <div
                            style={`width:${Math.min(100, (100 * (nowPlaying?.progress_ms || 0)) / track.duration_ms)}%`}
                        ></div>
                    {/if}
                </div>
                <div class="times">
                    {formatTime(nowPlaying?.progress_ms)} / {formatTime(track.duration_ms)}
                    {nowPlaying?.is_playing ? '• Playing' : '• Paused'}
                </div>

                <!-- Player controls -->
                <div class="controls" role="group" aria-label="Playback controls">
                    <button class="ctrl" on:click={previousTrack} aria-label="Previous" disabled={!authorized}>⏮</button>
                    <button class="ctrl big" on:click={togglePlayPause} aria-label={nowPlaying?.is_playing ? 'Pause' : 'Play'} disabled={!authorized}>
                        {nowPlaying?.is_playing ? '⏸' : '▶'}
                    </button>
                    <button class="ctrl" on:click={nextTrack} aria-label="Next" disabled={!authorized}>⏭</button>
                </div>

                <section class="info">
                    <h3>General Track Information</h3>
                    <div class="kv">
                        <div>⏳ Duur: {formatTime(track.duration_ms)}</div>
                        <div>🔥 Populariteit: {popularity ?? '–'}</div>
                    </div>
                </section>
            </div>

            <!-- Right: album cover + vinyl (only shown when track exists) -->
            <div class="right">
                <div class="artwrap">
                    {#if coverUrl}
                        <img class="cover" src={coverUrl} alt="album art" width="520" height="520" />
                    {/if}
                    <div class="vinyl {nowPlaying?.is_playing ? 'spinning' : ''}" aria-hidden="true"></div>
                </div>
            </div>
        </div>
    {:else}
        <div class="playing-zero" role="region" aria-label="Nothing is playing">
            <div class="zero-card">
                <h2>Nothing is playing</h2>
                <p class="lead">
                    Start playback on any Spotify device to show album art and the vinyl visualizer.
                </p>
                <p class="hint">Tip: open Spotify on your phone, laptop or web player and press play.</p>
            </div>
        </div>
    {/if}
{:else}
    {#if error}
        <p class="err">{error}</p>
    {/if}

    <div class="zero-state" role="region" aria-label="Sign in to Sonora">
        <div class="zero-card">
            <h2>You’re signed out</h2>
            <p class="lead">
                Sign in with Spotify to show currently playing tracks, album art and the vinyl visualizer.
            </p>
            <button class="btn" on:click={redirectToAuthCodeFlow}>Sign in with Spotify</button>
            <p class="hint">
                No account? Visit <a href="https://spotify.com" target="_blank" rel="noopener noreferrer"
                    >spotify.com</a
                >.
            </p>
        </div>
    </div>
{/if}

<style>
    /* ---------- layout / centering ---------- */
    .layout {
        min-height: calc(100vh - 160px);
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 200px;
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
    }

    .left {
        flex: 1 1 520px;
        max-width: 520px;
        color: #cfd4dc;
    }

    .title {
        font-size: 64px;
        margin: 8px 0 4px;
        line-height: 1;
        color: white;
    }

    .sub {
        color: #9aa5b1;
        margin-top: 16px;
        margin-bottom: 16px;
        font-size: 18px;
    }

    .progress {
        width: 360px;
        height: 8px;
        background: #1a1c20;
        border-radius: 4px;
        overflow: hidden;
        cursor: pointer;
    }
    .progress > div {
        height: 100%;
        background: var(--glow, #1db954); 
    }
    .times {
        font-size: 12px;
        color: #9aa5b1;
        margin-top: 6px;
    }

    /* playback controls (sleek buttons) */
    .controls {
        display: flex;
        gap: 14px;
        align-items: center;
        margin: 14px 0 22px;
    }

    .controls .ctrl {
        position: relative;
        overflow: hidden;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.04);
        color: #e6f0ef;
        font-size: 18px;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 6px;
        transition: transform 160ms cubic-bezier(.2,.9,.2,1), box-shadow 160ms ease, background-color 160ms ease;
        box-shadow: 0 6px 18px rgba(0,0,0,0.45);
        }
        /* smooth pure-scale hover using transform + transition */
        .controls .ctrl:hover {
            transform: scale(1.1);
            box-shadow: 0 18px 46px rgba(0,0,0,0.5);
        }
    .controls .ctrl:focus {
        outline: none;
        box-shadow: 0 0 0 6px rgba(29,185,84,0.10);
    }
    .controls .ctrl::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: 10px;
        height: 10px;
        background: rgba(255,255,255,0.18);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
        pointer-events: none;
    }
    .controls .ctrl:active::after {
        animation: bubble 520ms ease-out forwards;
    }
    @keyframes bubble {
        from { transform: translate(-50%, -50%) scale(0); opacity: .6; }
        to   { transform: translate(-50%, -50%) scale(3.5); opacity: 0; }
    }
    .controls .ctrl:disabled {
        opacity: 0.35;
        cursor: default;
        transform: none;
        box-shadow: none;
    }

    .controls .ctrl.big {
        font-size: 22px;
        padding: 10px 16px;
        background: linear-gradient(180deg, #1db954 0%, #16a34a 100%);
        color: #fff;
        box-shadow: 0 12px 36px rgba(29,185,84,0.18);
        border: none;
        border-radius: 6px;
        }
        .controls .ctrl.big {
            background: linear-gradient(180deg, var(--glow, #1db954) 0%, var(--glow-soft, #16a34a) 100%);
            color: #fff;
            box-shadow: 0 12px 36px rgba(0,0,0,0.35), 0 0 36px var(--glow-soft, rgba(29,185,84,0.12));
            border: none;
        }
    .controls .ctrl.big:hover { transform: scale(1.1); }

    .info {
        margin-top: 18px;
    }
    .info h3 {
        margin: 0 0 8px;
        font-size: 12px;
        color: #9aa5b1;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }
    .kv {
        display: flex;
        gap: 24px;
        color: #cfd4dc;
        font-size: 14px;
    }

    .right {
        flex: 0 0 560px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .artwrap {
        /* default (desktop) sizes */
        --cover-size: 520px; /* cover is the reference */
        --vinyl-ratio: 0.75; /* vinyl = cover * ratio */
        --label-ratio: 0.5; /* <-- increased so label image is bigger */
        --vinyl-size: calc(var(--cover-size) * var(--vinyl-ratio));

        position: relative;
        width: var(--cover-size);
        height: var(--cover-size);
        filter: drop-shadow(0 40px 80px rgba(0, 0, 0, 0.35));
        box-sizing: border-box;
        overflow: visible;
    }

    .cover {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-60%, -50%); /* overlap the vinyl */
        width: var(--cover-size);
        height: var(--cover-size);
        object-fit: cover;
        border-radius: 4px;
        z-index: 2;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }

    .vinyl {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) translateX(40%);
        width: var(--vinyl-size);
        height: var(--vinyl-size);
        border-radius: 50%;
        background:
            /* center hole shadow */
            radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.85) 0 25px, transparent 26px),
            /* grooves */ repeating-radial-gradient(circle at 50% 50%, #0a0a0a 0 2px, #111 2px 4px);
        background-color: #0b0b0b;
        box-shadow:
            inset 0 0 90px rgba(255, 255, 255, 0.06),
            0 0 240px var(--glow, rgba(255, 70, 70, 12));
        animation: spin 14s linear infinite;
        animation-play-state: paused;
        z-index: 1;
    }

    .vinyl::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: calc(var(--vinyl-size) * var(--label-ratio));
        height: calc(var(--vinyl-size) * var(--label-ratio));
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: var(--label) center / cover no-repeat;
        box-shadow:
            inset 0 0 0 10px #111,
            0 0 0 1px #000;
    }
    .vinyl.spinning {
        animation-play-state: running;
    }
    @keyframes spin {
        from {
            transform: translate(-50%, -50%) translateX(40%) rotate(0deg);
        }
        to {
            transform: translate(-50%, -50%) translateX(40%) rotate(360deg);
        }
    }

    /* status / misc */
    .status {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #cfd4dc;
        margin: 20px 0 0 20px;
    }
    .status .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        box-shadow: 0 0 10px currentColor;
    }
    .status .dot.green {
        background: #1db954;
        color: #1db954;
    }
    .status .dot.red {
        background: #d33;
        color: #d33;
    }

    .status button {
        margin-left: 8px;
        background: none;
        border: none;
        cursor: pointer;
        text-decoration: underline;
        font-weight: 600;
        padding: 2px 4px;
        font-family: inherit;
    }

    .status.connected button {
        color: #d33;
    }
    .status.disconnected button {
        color: #1db954;
    }

    .zero-state,
    .zero-card,
    .zero-card * {
        font-family: inherit;
    }

    .err {
        color: #f55;
    }

    /* ----------- breakpoint: tablet/phone (below 1392px) ---------- */
    @media (max-width: 1392px) {
        .layout {
            flex-direction: column;
            gap: 40px;
            min-height: auto;
        }
        .right {
            order: -1;
        }
        .artwrap {
            --cover-size: 320px;
            --vinyl-ratio: 0.75;
            --label-ratio: 0.5; 
            width: var(--cover-size);
            height: var(--cover-size);
            margin: 0 auto;
        }
        .cover {
            transform: translate(-60%, -50%);
            width: var(--cover-size);
            height: var(--cover-size);
        }
        .vinyl {
            transform: translate(-50%, -50%) translateX(40%);
            width: var(--vinyl-size);
            height: var(--vinyl-size);
        }
        /* center and enlarge controls on tablet */
        .controls {
            justify-content: center;
            gap: 16px;
        }
        .controls .ctrl {
            font-size: 20px;
            padding: 10px 14px;
            border-radius: 14px;
        }
        .controls .ctrl.big {
            font-size: 26px;
            padding: 12px 18px;
            border-radius: 16px;
        }
        /* center left column content (text, progress, controls, info) */
        .left {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        /* make the progress bar fluid */
        .progress {
            width: min(360px, 92%);
        }
        .kv {
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }
    }
    @media (max-width: 595px) {
        .right {
            flex: 0 0 360px;
        }
        .left {
            scale: 85%;
        }
        .title {
            font-size: 3em;
        }
        .artwrap {
            --cover-size: 250px;
            --vinyl-ratio: 0.8;
            --label-ratio: 0.5; 
            width: var(--cover-size);
            height: var(--cover-size);
        }
        .cover {
            transform: translate(-60%, -50%);
            width: var(--cover-size);
            height: var(--cover-size);
        }
        .vinyl {
            transform: translate(-50%, -50%) translateX(48%);
            width: var(--vinyl-size);
            height: var(--vinyl-size);
        }
        /* center and increase control sizes on small screens */
        .controls {
            justify-content: center;
            gap: 14px;
        }
        .controls .ctrl {
            font-size: 22px;
            padding: 12px 16px;
            border-radius: 14px;
        }
        .controls .ctrl.big {
            font-size: 28px;
            padding: 14px 20px;
        }
        /* center left column content and make progress responsive */
        .left {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        .progress {
            width: min(360px, 96%);
        }
        .kv {
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }
    }

    .playing-zero,
    .zero-state {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 160px);
        padding: 20px;
        box-sizing: border-box;
    }

    .zero-card {
        width: 100%;
        max-width: 480px; 
        width: min(95%, 480px); 
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01));
        border: 1px solid rgba(255, 255, 255, 0.04);
        padding: 18px;
        border-radius: 10px;
        text-align: center;
        color: #cfd4dc;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
    }

    /* zero-state primary button */
    .zero-card .btn {
        display: inline-block;
        background: linear-gradient(180deg, #1db954 0%, #16a34a 100%);
        color: #fff;
        border: none;
        padding: 10px 18px;
        font-weight: 700;
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(29, 185, 84, 0.18);
        transition: transform .12s ease, box-shadow .12s ease, opacity .12s ease;
        text-decoration: none;
        font-size: 14px;
    }
    .zero-card .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 34px rgba(29, 185, 84, 0.22);
    }
    .zero-card .btn:active {
        transform: translateY(0);
        opacity: .95;
    }
    .zero-card .btn:focus {
        outline: 3px solid rgba(29, 185, 84, 0.14);
        outline-offset: 3px;
    }

    @media (max-width: 720px) {
        .zero-card {
            padding: 14px;
            border-radius: 8px;
            max-width: 420px;
        }
        .zero-card h2 {
            font-size: 18px;
        }
        .zero-card .lead {
            font-size: 13px;
        }
    }

    @media (max-width: 420px) {
        .zero-card {
            max-width: 320px;
            padding: 12px;
        }
        .zero-card h2 {
            font-size: 16px;
        }
        .zero-card .lead {
            font-size: 12px;
        }
    }
    /* extra small screens: slightly reduce from 595 sizing but keep centered */
    @media (max-width: 420px) {
        .controls {
            justify-content: center;
            gap: 10px;
        }
        .controls .ctrl {
            font-size: 20px;
            padding: 10px 12px;
        }
        .controls .ctrl.big {
            font-size: 24px;
            padding: 12px 16px;
        }
        .left {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        .progress { width: 94%; }
        .kv { flex-direction: column; align-items: center; gap: 10px; }
    }
    /* extra small screens: slightly reduce from 595 sizing but keep centered */
    @media (max-width: 420px) {
        .controls {
            justify-content: center;
            gap: 10px;
        }
        .controls .ctrl {
            font-size: 20px;
            padding: 10px 12px;
        }
        .controls .ctrl.big {
            font-size: 24px;
            padding: 12px 16px;
        }
    }
</style>
