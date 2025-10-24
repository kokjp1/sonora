<script>
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	  <title>Sonora 🎧</title>
  		<meta name="description" content="SPA For showing your Music Status via the spotify web API" />

  		<!-- Open Graph -->
		<meta property="og:title" content="Sonora 🎧" />
		<meta property="og:description" content="SPA For showing your Music Status via the spotify web API" />
		<meta property="og:image" content="https://sonora.stream/og-image.png" />
		<meta property="og:url" content="https://sonora.stream/" />
		<meta property="og:type" content="website" />

		<!-- Twitter -->
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content="Sonora 🎧" />
		<meta name="twitter:description" content="SPA For showing your Music Status via the spotify web API" />
		<meta name="twitter:image" content="https://sonora.stream/og-image.png" />
</svelte:head>

{@render children?.()}
