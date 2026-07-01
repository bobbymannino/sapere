<script lang="ts">
    import { resolve } from "$app/paths";
    import Empty from "$lib/components/empty.svelte";
    import Meta from "$lib/components/meta.svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { formatDateTime, toIsoDate } from "$lib/date-format";
    import { MarkdownIcon } from "$lib/icons";
    import type { PageProps } from "./$types";
    import Pagination from "../../pagination.svelte";

    let { data }: PageProps = $props();
    let documents = $derived(data.documents);
</script>

<Meta
    title={`${data.workspace.title} Documents`}
    description={`View documents in ${data.workspace.title}.`}
    tags={["documents", data.workspace.slug]}
    robots="noindex,nofollow"
/>

<section class="@container flex flex-col gap-5 p-5">
    <header class="flex flex-col gap-1">
        <p class="text-muted-foreground">
            <small>{data.workspace.title}</small>
        </p>
        <h1>Documents</h1>
    </header>

    {#if documents.results.length === 0}
        <Empty title="No Documents" description="This workspace does not have any documents yet." icon={MarkdownIcon}>
            <Button href={resolve("/(app)/workspaces/[slug]", { slug: data.workspace.slug })} variant="outline">
                Workspace
            </Button>
        </Empty>
    {:else}
        <ul class="grid gap-5 @xl:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4">
            {#each documents.results as doc (doc.id)}
                <li class="min-w-0">
                    <Card.Root class="h-full">
                        <Card.Header>
                            <div class="flex min-w-0 items-start gap-3">
                                <div
                                    class="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
                                >
                                    <MarkdownIcon />
                                </div>
                                <div class="min-w-0">
                                    <Card.Title class="truncate text-base">{doc.title}</Card.Title>
                                    <Card.Description class="truncate">{doc.slug}.md</Card.Description>
                                </div>
                            </div>
                        </Card.Header>

                        <Card.Content>
                            {#if doc.content.trim()}
                                <Card.Description class="line-clamp-4 wrap-break-words whitespace-pre-line">
                                    {doc.content}{doc.content.length >= 50 ? "..." : ""}
                                </Card.Description>
                            {:else}
                                <Card.Description>Empty markdown file</Card.Description>
                            {/if}
                        </Card.Content>

                        <Card.Footer class="mt-auto">
                            <Card.Description class="text-xs">
                                Updated <time datetime={toIsoDate(doc.updatedAt)}>{formatDateTime(doc.updatedAt)}</time>
                            </Card.Description>
                        </Card.Footer>
                    </Card.Root>
                </li>
            {/each}
        </ul>
    {/if}
</section>

{#if documents.totalPages > 1}
    <Pagination count={documents.total} perPage={documents.perPage} page={documents.page} />
{/if}
