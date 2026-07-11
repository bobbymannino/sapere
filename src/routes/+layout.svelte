<script lang="ts">
  import { ModeWatcher } from "mode-watcher";

  import "./layout.css";
  import Analytics from "./analytics.svelte";
  import Meta from "./meta.svelte";

  let { children } = $props();
</script>

<Meta />
<Analytics />
<ModeWatcher />

{@render children()}
