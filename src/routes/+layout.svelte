<script lang="ts">
  import * as Sentry from "@sentry/sveltekit";
  import { ModeWatcher } from "mode-watcher";

  import "./layout.css";
  import type { LayoutProps } from "./$types";
  import Analytics from "./analytics.svelte";
  import Meta from "./meta.svelte";

  let { children, data }: LayoutProps & { data: App.PageData } = $props();

  $effect(() => {
    Sentry.setUser(data.session ? { id: data.session.user.id } : null);
  });
</script>

<Meta />
<Analytics />
<ModeWatcher />

{@render children()}
