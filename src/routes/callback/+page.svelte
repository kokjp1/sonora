<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { handleCallback } from '$lib/spotify.js';
  import { goto } from '$app/navigation';

  onMount(async () => {
    if (!browser) return;
    await handleCallback();
    const dest = localStorage.getItem('spotify_post_login_redirect') || '/';
    localStorage.removeItem('spotify_post_login_redirect');
    goto(dest);
  });
</script>

<p>Signing you in via Spotify OAuth…</p>