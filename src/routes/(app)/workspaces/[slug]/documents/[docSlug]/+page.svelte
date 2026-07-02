<script lang="ts">
    import Meta from "$lib/components/meta.svelte";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
</script>

<Meta
    title={data.document.title}
    description={`View ${data.document.title} in ${data.workspace.title}.`}
    tags={["documents", data.workspace.slug, data.document.slug]}
    robots="noindex,nofollow"
/>

<section class="@container flex flex-col gap-5 p-5">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex flex-col gap-1">
            <p class="text-muted-foreground">
                <small>{data.workspace.title}</small>
            </p>
            <h1>{data.document.title}</h1>
        </div>
    </header>
</section>
