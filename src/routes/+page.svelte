<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { redirectToAuthCodeFlow, hasToken, getCurrentlyPlaying, logout } from '$lib/spotify.js';

  let authorized = false;
  let nowPlaying = null;
  let error = null;
  let nowPlayingUpdateInterval;

  function formatTime(ms) {
    const s = Math.floor((ms || 0) / 1000);
    const m = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, '0');
    return `${m}:${ss}`;
  }

  async function updateNowPlaying() {
    try {
      nowPlaying = await getCurrentlyPlaying();
      error = null;
    } catch (e) {
      error = String(e);
    }
  }

  onMount(async () => {
    if (!browser) return;
    authorized = hasToken();
    if (authorized) {
      await updateNowPlaying();
      nowPlayingUpdateInterval = setInterval(updateNowPlaying, 1000);
    }
  });

  onDestroy(() => { if (nowPlayingUpdateInterval) clearInterval(nowPlayingUpdateInterval); });
  
  function signout() {
    logout();
    authorized = false;
    nowPlaying = null;
    if (nowPlayingUpdateInterval) { clearInterval(nowPlayingUpdateInterval); nowPlayingUpdateInterval = null; }
  }
</script>

<h1>Now Playing on Spotify</h1>

{#if authorized}
  {#if error}<p style="color:#f55">{error}</p>{/if}

  {#if nowPlaying?.item}
    {#key nowPlaying.item.id}
      <div style="display:flex; gap:16px; align-items:center;">
        {#if nowPlaying.item.album?.images?.[0]}
          <img src={nowPlaying.item.album.images[0].url} alt="album art" width="396" height="396" />
        {/if}
        <div>
          <h2 style="margin:0">{nowPlaying.item.name}</h2>
          <div style="color:#889;">
            {nowPlaying.item.artists?.map(a => a.name).join(', ')} • {nowPlaying.item.album?.name}
          </div>

          <div style="margin-top:8px; width:360px; background:#222; height:6px; border-radius:3px; overflow:hidden;">
            {#if nowPlaying.item.duration_ms}
              <div style={`height:100%; width:${Math.min(100, 100*(nowPlaying.progress_ms || 0)/nowPlaying.item.duration_ms)}%; background:#1db954;`}></div>
            {/if}
          </div>
          <div style="font-size:12px; color:#889; margin-top:4px;">
            {formatTime(nowPlaying.progress_ms)} / {formatTime(nowPlaying.item.duration_ms)} {nowPlaying.is_playing ? '• Playing' : '• Paused'}
          </div>
        </div>
      </div>
    {/key}
    <button on:click={signout} style="margin-top:12px;">Logout</button>
  {:else}
    <p>Nothing is playing right now. Start playback on any Spotify device.</p>
    <button on:click={signout} style="margin-top:12px;">Logout</button>
  {/if}
{:else}
  {#if error}<p style="color:#f55">{error}</p>{/if}
  <button on:click={redirectToAuthCodeFlow}>Connect Spotify</button>
{/if}