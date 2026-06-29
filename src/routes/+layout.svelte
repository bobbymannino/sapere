<script lang="ts">
    import Analytics from "./analytics.svelte";
    import "./layout.css";
    import Meta from "./meta.svelte";

    let { children } = $props();
</script>

<Meta />
<Analytics />

{@render children()}
