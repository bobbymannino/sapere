<script lang="ts">
    import { resolve } from "$app/paths";
    import Button from "$lib/components/ui/button/button.svelte";
    import EmptyContent from "$lib/components/ui/empty/empty-content.svelte";
    import EmptyDescription from "$lib/components/ui/empty/empty-description.svelte";
    import EmptyHeader from "$lib/components/ui/empty/empty-header.svelte";
    import EmptyMedia from "$lib/components/ui/empty/empty-media.svelte";
    import EmptyTitle from "$lib/components/ui/empty/empty-title.svelte";
    import Empty from "$lib/components/ui/empty/empty.svelte";
    import Pagination from "$lib/components/ui/pagination/pagination.svelte";
    import type { PageProps } from "./$types";
    import WorkspaceCard from "./workspace-card.svelte";
    import PaginationLink from "$lib/components/ui/pagination/pagination-link.svelte";
    import PaginationItem from "$lib/components/ui/pagination/pagination-item.svelte";
    import { PaginationContent } from "$lib/components/ui/pagination";
    import PaginationNext from "$lib/components/ui/pagination/pagination-next.svelte";
    import PaginationPrevious from "$lib/components/ui/pagination/pagination-previous.svelte";
    import PaginationEllipsis from "$lib/components/ui/pagination/pagination-ellipsis.svelte";
    import { navigating, page } from "$app/state";
    import { goto } from "$app/navigation";
    import { WorkspaceIcon } from "$lib/icons";

    let { data }: PageProps = $props();
    let workspaces = $derived(data.workspaces);

    function onPageChange(newPage: number) {
        let url = page.url;
        let sp = new URLSearchParams(url.searchParams);
        sp.set("page", newPage.toString());
        goto(`${url.pathname}?${sp.toString()}`);
    }
</script>

<div class="flex flex-col">
    {#if workspaces.results.length === 0}
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <WorkspaceIcon />
                </EmptyMedia>
                <EmptyTitle>No workspaces</EmptyTitle>
                <EmptyDescription>You are not apart of any workspaces</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button href={resolve("/(app)/workspaces/new")}>New Workspace</Button>
            </EmptyContent>
        </Empty>
    {:else}
        <section class="@container">
            <ul class="p-5 grid gap-5 @xl:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4">
                {#each workspaces.results as w (w.id)}
                    <li>
                        <WorkspaceCard {...w} />
                    </li>
                {/each}
            </ul>

            <div class="p-5 flex-center">
                <Button variant="outline" href={resolve("/(app)/workspaces/new")}>New Workspace</Button>
            </div>
        </section>

        <Pagination
            count={workspaces.total}
            perPage={workspaces.perPage}
            page={workspaces.page}
            {onPageChange}
            class="mbs-auto p-5"
        >
            {#snippet children({ pages, currentPage })}
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious disabled={Boolean(navigating.to)} />
                    </PaginationItem>
                    {#each pages as page (page.key)}
                        {#if page.type === "ellipsis"}
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                        {:else}
                            <PaginationItem>
                                <PaginationLink
                                    {page}
                                    isActive={currentPage === page.value}
                                    disabled={Boolean(navigating.to)}
                                >
                                    {page.value}
                                </PaginationLink>
                            </PaginationItem>
                        {/if}
                    {/each}
                    <PaginationItem>
                        <PaginationNext disabled={Boolean(navigating.to)} />
                    </PaginationItem>
                </PaginationContent>
            {/snippet}
        </Pagination>
    {/if}
</div>
