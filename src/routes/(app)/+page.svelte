<script lang="ts">
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { navigating, page } from "$app/state";
    import { Button } from "$lib/components/ui/button";
    import Empty from "$lib/components/empty.svelte";
    import Pagination from "$lib/components/ui/pagination/pagination.svelte";
    import type { PageProps } from "./$types";
    import WorkspaceCard from "./workspace-card.svelte";
    import PaginationLink from "$lib/components/ui/pagination/pagination-link.svelte";
    import PaginationItem from "$lib/components/ui/pagination/pagination-item.svelte";
    import { PaginationContent } from "$lib/components/ui/pagination";
    import PaginationNext from "$lib/components/ui/pagination/pagination-next.svelte";
    import PaginationPrevious from "$lib/components/ui/pagination/pagination-previous.svelte";
    import PaginationEllipsis from "$lib/components/ui/pagination/pagination-ellipsis.svelte";
    import { WorkspaceIcon } from "$lib/icons";
    import Filters from "./filters.svelte";

    let { data }: PageProps = $props();
    let workspaces = $derived(data.workspaces);

    function onPageChange(newPage: number) {
        const sp = new URLSearchParams(page.url.searchParams);
        sp.set("page", newPage.toString());
        goto(`${page.url.pathname}?${sp.toString()}`);
    }
</script>

<div class="flex flex-col">
    {#if workspaces.results.length === 0}
        <Empty title="No Workspaces" description="You are not apart of any workspaces" icon={WorkspaceIcon}>
            <Button href={resolve("/(app)/workspaces/new")}>New Workspace</Button>
        </Empty>
    {:else}
        <section class="@container">
            <Filters sortBy={data.sortBy} sortDir={data.sortDir} />

            <ul class="p-5 grid gap-5 @xl:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4">
                {#each workspaces.results as w (w.id)}
                    <li>
                        <WorkspaceCard {...w} />
                    </li>
                {/each}
            </ul>
        </section>

        <Pagination
            count={workspaces.total}
            perPage={workspaces.perPage}
            page={workspaces.page}
            {onPageChange}
            class="mbs-auto p-5 pbs-0"
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
