<script lang="ts">
    import { resolve } from "$app/paths";
    import { page } from "$app/state";
    import Meta from "$lib/components/meta.svelte";
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
    let description = $derived(data.workspace.description ?? "View workspace details.");
    let metaImageUrl = $derived(new URL(imageUrl, page.url.origin).toString());
    let metaImage = $derived(
        data.workspace.image
            ? {
                  url: metaImageUrl,
                  alt: `${data.workspace.title} workspace thumbnail`,
              }
            : null,
    );
</script>

<Meta
    title={data.workspace.title}
    {description}
    image={metaImage}
    tags={["workspace", data.workspace.slug]}
    modifiedTime={data.workspace.updatedAt}
    robots="noindex,nofollow"
/>

<section>
    <header class="p-5 flex flex-wrap gap-5">
        {#if data.workspace.image}
            <OptimizedImage src={imageUrl} alt="" class="aspect-video w-full max-w-lg rounded-3xl" />
        {/if}

        <div class="space-y-2">
            <h1>{data.workspace.title}</h1>
            {#if data.workspace.description}
                <p class="whitespace-pre-wrap text-muted-foreground">{data.workspace.description}</p>
            {/if}
            <p>Updated <time datetime={updatedAtIso}>{formattedUpdatedAt}</time></p>
            <Button href={resolve("/(app)/workspaces/[slug]/documents", { slug: data.workspace.slug })}>
                Documents
            </Button>
            <Button variant="ghost" href={resolve("/(app)/workspaces/[slug]/edit", { slug: data.workspace.slug })}>
                Edit
            </Button>
        </div>
    </header>
</section>
