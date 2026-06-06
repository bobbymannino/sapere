<script lang="ts">
  import { resolve } from "$app/paths";
  import Button from "$lib/components/button.svelte";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<div class="bg-mantle text-txt stack m-6 p-4">
  {#if data.user}
    <h1>Welcome, {data.user.username}</h1>
    <Button href={resolve("/logout")} variant="destructive" data-sveltekit-preload-data="off">Logout</Button>
  {:else}
    <Button href={resolve("/login")}>Login</Button>
  {/if}
</div>
