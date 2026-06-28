<script lang="ts">
    import { resolve } from "$app/paths";
    import OptimizedImage from "$lib/components/optimized-image.svelte";
    import { formatDateTime, toIsoDate } from "$lib/date-format";
    import type { PageProps } from "./$types";
    import Button from "$lib/components/ui/button/button.svelte";

    let { data }: PageProps = $props();
    let formattedUpdatedAt = $derived(formatDateTime(data.workspace.updatedAt));
    let updatedAtIso = $derived(toIsoDate(data.workspace.updatedAt));
    let imageUrl = $derived(
        `${resolve("/(app)/workspaces/[slug]/image", { slug: data.workspace.slug })}?v=${data.workspace.updatedAt.getTime()}`,
    );
</script>

<div class="p-5">
    {#if data.workspace.image}
        <OptimizedImage src={imageUrl} alt="" class="mb-5 aspect-video w-full max-w-4xl rounded-3xl" />
    {/if}
    <h1>{data.workspace.title}</h1>
    {#if data.workspace.description}
        <p class="whitespace-pre-wrap text-muted-foreground">{data.workspace.description}</p>
    {/if}
    <p>Updated <time datetime={updatedAtIso}>{formattedUpdatedAt}</time></p>
    <Button href="/workspaces/{data.workspace.slug}/edit">Edit</Button>
</div>
