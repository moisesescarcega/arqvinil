<script lang="ts">
	import '../app.css';
	import Header from '$lib/Header.svelte';

	let { children } = $props();
</script>
<div>
	<Header />
	<main class="mx-auto w-full h-full">
		{@render children()}
	</main>
	<footer class="bg-gray-800 text-white text-center fixed bottom-0 w-full h-[22px]">
		<p>&copy; 2025 maquetas.xyz</p>
	</footer>
</div>
