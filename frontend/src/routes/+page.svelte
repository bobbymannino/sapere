<script lang="ts">
    import { resolve } from "$app/paths";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
</script>

<div class="m-4 p-4 bg-mantle text-txt">
    {#if data.user}
        <h1>you are logged in</h1>
        <a href={resolve("/logout")}>Logout</a>
    {:else}
        <a href={resolve("/login")}>Login</a>
    {/if}
</div>
