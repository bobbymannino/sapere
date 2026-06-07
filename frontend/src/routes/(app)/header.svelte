<script lang="ts">
    import { resolve } from "$app/paths";
    import { navigating } from "$app/state";
    import Button from "$lib/components/button.svelte";
    import Logo from "$lib/components/logo.svelte";
    import MenuIcon from "$lib/icons/menu-icon.svelte";
    import XIcon from "$lib/icons/x-icon.svelte";

    let menuOpen = $state(true);

    const links = [
        { href: "#dashboard", label: "Dashboard" },
        { href: "#workspaces", label: "Workspaces" },
        { href: "#settings", label: "Settings" },
    ];

    $effect(() => {
        if (navigating.to) menuOpen = false;
    });
</script>

{#if menuOpen}
    <div
        aria-hidden="true"
        class="md:hidden bg-overlay-0/50 fixed inset-0 z-20 backdrop-blur-xs touch-none"
        aria-label="Close menu"
        onclick={() => (menuOpen = false)}
    ></div>
{/if}

<header
    class="bg-mantle border-crust shadow-primary/10 sticky top-0 border-b z-30 shadow-lg"
>
    <div class="flex items-center justify-between p-3">
        <Logo />

        <Button
            variant="ghost"
            size="icon"
            aria-label={menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"}
            aria-expanded={menuOpen}
            onclick={() => (menuOpen = !menuOpen)}
        >
            {#if menuOpen}
                <XIcon />
            {:else}
                <MenuIcon />
            {/if}
        </Button>
    </div>

    <nav class={menuOpen ? "stack-2 p-3 border-t border-crust grow" : "hidden"}>
        {#each links as link}
            <Button href={link.href} variant="ghost">
                {link.label}
            </Button>
        {/each}
    </nav>

    <div class={menuOpen ? "stack-2 p-3 border-t border-crust" : "hidden"}>
        <Button
            href={resolve("/logout")}
            variant="destructive"
            data-sveltekit-preload-data="off">Logout</Button
        >
    </div>
</header>
