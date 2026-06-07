<script lang="ts">
  import { resolve } from "$app/paths";
  import { navigating } from "$app/state";
  import type { ResolvedPathname } from "$app/types";
  import Button from "$lib/components/button.svelte";
  import Logo from "$lib/components/logo.svelte";
  import MenuIcon from "$lib/icons/menu-icon.svelte";
  import XIcon from "$lib/icons/x-icon.svelte";

  let menuOpen = $state(true);

  type Link = {
    href: ResolvedPathname;
    label: string;
  };

  const links: Link[] = [{ href: resolve("/"), label: "Workspaces" }];

  $effect(() => {
    if (navigating.to) menuOpen = false;
  });
</script>

{#if menuOpen}
  <div
    aria-hidden="true"
    class="bg-overlay-0/50 fixed inset-0 z-20 touch-none backdrop-blur-xs md:hidden"
    aria-label="Close menu"
    onclick={() => (menuOpen = false)}
  ></div>
{/if}

<header
  class="bg-mantle border-crust shadow-primary/10 sticky top-0 z-30 grid-rows-[auto_1fr_auto] border-b shadow-lg md:grid md:h-dvh md:border-r md:border-b-0"
>
  <div class="flex items-center justify-between p-3">
    <Logo />

    <Button
      variant="ghost"
      size="icon"
      aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={menuOpen}
      onclick={() => (menuOpen = !menuOpen)}
      class="md:hidden"
    >
      {#if menuOpen}
        <XIcon />
      {:else}
        <MenuIcon />
      {/if}
    </Button>
  </div>

  <nav class={["stack-2 border-crust border-t p-3", !menuOpen && "hidden md:flex"]}>
    {#each links as link}
      <Button href={link.href} variant="ghost" class="md:justify-start">
        {link.label}
      </Button>
    {/each}
  </nav>

  <div class={["stack-2 border-crust border-t p-3", !menuOpen && "hidden md:flex"]}>
    <Button href={resolve("/logout")} variant="destructive" class="md:justify-start" data-sveltekit-preload-data="off"
      >Logout</Button
    >
  </div>
</header>
