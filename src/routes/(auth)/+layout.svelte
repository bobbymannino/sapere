<script lang="ts">
    import Card from "$lib/components/ui/card/card.svelte";

    let { children } = $props();
</script>

<main class="flex-center p-5">
    <Card class="max-w-lg w-full">
        {@render children()}
    </Card>
</main>
