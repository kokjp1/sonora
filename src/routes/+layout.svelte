<script>
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	  <title>Sonora — Discover and Share Music</title>
  		<meta name="description" content="Your personal music insight platform powered by Spotify." />

  		<!-- Open Graph -->
		<meta property="og:title" content="Sonora — Discover and Share Music" />
		<meta property="og:description" content="Your personal music insight platform powered by Spotify." />
		<meta property="og:image" content="https://sonora.stream/og-image.png" />
		<meta property="og:url" content="https://sonora.stream/" />
		<meta property="og:type" content="website" />

		<!-- Twitter -->
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content="Sonora — Discover and Share Music" />
		<meta name="twitter:description" content="Your personal music insight platform powered by Spotify." />
		<meta name="twitter:image" content="https://sonora.stream/og-image.png" />
</svelte:head>

{@render children?.()}
