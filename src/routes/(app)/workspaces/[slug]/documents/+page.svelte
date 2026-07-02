<script lang="ts">
    import { resolve } from "$app/paths";
    import Empty from "$lib/components/empty.svelte";
    import Meta from "$lib/components/meta.svelte";
    import { Button } from "$lib/components/ui/button";
    import DocumentCard from "$lib/components/document-card.svelte";
    import { MarkdownIcon } from "$lib/icons";
    import * as Kbd from "$lib/components/ui/kbd";
    import type { PageProps } from "./$types";
    import Filters from "./filters.svelte";
    import Pagination from "$lib/components/pagination.svelte";
    import { goto } from "$app/navigation";
    import { isTextFieldTarget } from "$lib/utils";

    let { data }: PageProps = $props();
    let documents = $derived(data.documents);
    let hasSearch = $derived(Boolean(data.search));

    function onkeydown(e: KeyboardEvent) {
        if (e.defaultPrevented || isTextFieldTarget(e.target)) return;
        if (e.key === "n") {
            e.preventDefault();
            goto(resolve("/(app)/workspaces/[slug]/documents/new", { slug: data.workspace.slug }));
        }
    }
</script>

<svelte:window {onkeydown} />

<Meta
    title={`${data.workspace.title} Documents`}
    description={`View documents in ${data.workspace.title}.`}
    tags={["documents", data.workspace.slug]}
    robots="noindex,nofollow"
/>

<section class="@container flex flex-col gap-5 p-5">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex flex-col gap-1">
            <p class="text-muted-foreground">
                <small>{data.workspace.title}</small>
            </p>
            <h1>Documents</h1>
        </div>
        <div class="flex flex-wrap gap-2">
            <Filters
                workspaceSlug={data.workspace.slug}
                search={data.search}
                sortBy={data.sortBy}
                sortDir={data.sortDir}
            />
            <Button
                href={resolve("/(app)/workspaces/[slug]/documents/new", { slug: data.workspace.slug })}
                variant="outline"
                size="sm"
                aria-keyshortcuts="N"
            >
                <MarkdownIcon />
                <span>New Document</span>
                <Kbd.Root class="hidden can-hover:flex">N</Kbd.Root>
            </Button>
        </div>
    </header>

    {#if documents.results.length === 0}
        <Empty
            title={hasSearch ? "No matching documents" : "No Documents"}
            description={hasSearch
                ? "No documents match your search."
                : "This workspace does not have any documents yet."}
            icon={MarkdownIcon}
        >
            <Button href={resolve("/(app)/workspaces/[slug]/documents/new", { slug: data.workspace.slug })}>
                <MarkdownIcon />
                <span>New Document</span>
            </Button>
        </Empty>
    {:else}
        <ul class="grid gap-5 @xl:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4">
            {#each documents.results as doc (doc.id)}
                <li class="min-w-0">
                    <DocumentCard {...doc} workspaceSlug={data.workspace.slug} />
                </li>
            {/each}
        </ul>
    {/if}

    {#if documents.totalPages > 1}
        <Pagination count={documents.total} perPage={documents.perPage} page={documents.page} />
    {/if}
</section>
