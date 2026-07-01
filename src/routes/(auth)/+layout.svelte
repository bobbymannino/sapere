<script lang="ts">
    import Card from "$lib/components/ui/card/card.svelte";
    import Logo from "$lib/components/logo.svelte";

    let { children } = $props();
</script>

<main class="flex-center flex-col min-h-svh p-5 gap-5">
    <Logo class="text-primary w-20" />
    <Card class="max-w-lg w-full">
        {@render children()}
    </Card>
</main>
