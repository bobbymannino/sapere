<script lang="ts">
  import { APP_NAME } from "$app/env/public";
  import { resolve } from "$app/paths";
  import Logo from "$lib/components/logo.svelte";
  import * as Button from "$lib/components/ui/button";
  import * as Sidebar from "$lib/components/ui/sidebar";
</script>

<Sidebar.Header class="p-3">
  <Button.Root variant="ghost" href={resolve("/(app)")} class="justify-start">
    <Logo class="size-4 text-primary" aria-hidden="true" />
    {APP_NAME}
  </Button.Root>
</Sidebar.Header>
