<script lang="ts">
    import Card from "$lib/components/ui/card/card.svelte";
    import Logo from "$lib/components/logo.svelte";
    import SiteFooter from "../site-footer.svelte";

    let { children } = $props();
</script>

<main class="grid min-h-svh grid-rows-[1fr_auto]">
    <div class="flex-col flex-center gap-5 p-5">
        <Logo class="text-primary w-20" />
        <Card class="max-w-lg w-full">
            {@render children()}
        </Card>
    </div>
    <SiteFooter />
</main>
