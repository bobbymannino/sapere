<script lang="ts">
	import './layout.css';
	import Meta from './meta.svelte';

	let { children } = $props();
</script>

<Meta />
{@render children()}
