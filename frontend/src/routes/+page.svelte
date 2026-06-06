<script lang="ts">
    import { resolve } from "$app/paths";
    import Button from "$lib/components/button.svelte";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
</script>

<div class="m-4 p-4 bg-mantle text-txt">
    {#if data.user}
        <h1>you are logged in</h1>
        <Button href={resolve("/logout")} variant="destructive">Logout</Button>
    {:else}
        <Button href={resolve("/login")}>Login</Button>
    {/if}
</div>
