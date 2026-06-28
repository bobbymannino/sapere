<script lang="ts">
    import Card from "$lib/components/ui/card/card.svelte";
    import Logo from "$lib/components/logo.svelte";

    let { children } = $props();
</script>

<main class="flex-center p-5 flex-col gap-5">
    <Logo class="text-primary w-20" />
    <Card class="max-w-lg w-full">
        {@render children()}
    </Card>
</main>
