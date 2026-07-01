<script lang="ts">
    import Analytics from "./analytics.svelte";
    import "./layout.css";
    import Meta from "./meta.svelte";
    import { ModeWatcher } from "mode-watcher";

    let { children } = $props();
</script>

<Meta />
<Analytics />
<ModeWatcher />

{@render children()}
