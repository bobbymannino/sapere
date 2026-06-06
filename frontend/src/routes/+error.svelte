<script lang="ts">
    import { resolve } from "$app/paths";
    import { page } from "$app/state";
    import Button from "$lib/components/button.svelte";
    import Logo from "$lib/components/logo.svelte";
</script>

<div class="min-h-svh flex-center">
    <div class="stack items-center text-center">
        <Logo />

        <h1 class="text-primary text-6xl">{page.status}</h1>

        {#if page.error?.message}
            <h3>{page.error.message}</h3>
        {/if}

        <p>
            We couldn't load this page. It may have moved, or something went
            wrong on our end.
        </p>

        {#if page.data.user}
            <Button href={resolve("/")}>Workspaces</Button>
        {:else}
            <Button href={resolve("/login")}>Login</Button>
        {/if}
    </div>
</div>
