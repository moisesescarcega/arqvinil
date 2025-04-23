<script lang="ts">
	import '../app.css';
	import Header from '$lib/Header.svelte';
	import { P } from 'flowbite-svelte';

	let { children } = $props();
</script>
<div>
	<Header />
	<main class="mx-auto w-full h-full">
		{@render children()}
	</main>
	<footer class="bg-gray-800 text-white fixed bottom-0 w-full h-[22px]">
		<P size="sm" align="center">&copy; 2025 arqvinil.vercel.app | hecho por <a href="https://mescarcega.vercel.app/">mescarcega</a></P>
	</footer>
</div>
