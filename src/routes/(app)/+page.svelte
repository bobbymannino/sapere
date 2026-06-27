<script lang="ts">
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { navigating, page } from "$app/state";
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import DropdownMenuContent from "$lib/components/ui/dropdown-menu/dropdown-menu-content.svelte";
    import DropdownMenuLabel from "$lib/components/ui/dropdown-menu/dropdown-menu-label.svelte";
    import DropdownMenuRadioGroup from "$lib/components/ui/dropdown-menu/dropdown-menu-radio-group.svelte";
    import DropdownMenuRadioItem from "$lib/components/ui/dropdown-menu/dropdown-menu-radio-item.svelte";
    import DropdownMenuTrigger from "$lib/components/ui/dropdown-menu/dropdown-menu-trigger.svelte";
    import DropdownMenu from "$lib/components/ui/dropdown-menu/dropdown-menu.svelte";
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

    const sortOptions = [
        { label: "Recently updated", sortBy: "updatedAt", sortDir: "desc", value: "updatedAt:desc" },
        { label: "Oldest updated", sortBy: "updatedAt", sortDir: "asc", value: "updatedAt:asc" },
        { label: "Name A-Z", sortBy: "title", sortDir: "asc", value: "title:asc" },
        { label: "Name Z-A", sortBy: "title", sortDir: "desc", value: "title:desc" },
        { label: "Newest created", sortBy: "createdAt", sortDir: "desc", value: "createdAt:desc" },
        { label: "Oldest created", sortBy: "createdAt", sortDir: "asc", value: "createdAt:asc" },
    ] as const;

    let { data }: PageProps = $props();
    let workspaces = $derived(data.workspaces);

    const currentSortBy = $derived(data.sortBy ?? "updatedAt");
    const currentSortDir = $derived(data.sortDir ?? "desc");
    const currentSortOption = $derived(
        sortOptions.find((o) => o.value === `${currentSortBy}:${currentSortDir}`) ?? sortOptions[0],
    );

    function onPageChange(newPage: number) {
        const sp = new URLSearchParams(page.url.searchParams);
        sp.set("page", newPage.toString());
        goto(`${page.url.pathname}?${sp.toString()}`);
    }

    function onSortChange(value: string) {
        const sortOption = sortOptions.find((option) => option.value === value);
        if (!sortOption) return;

        const sp = new URLSearchParams(page.url.searchParams);
        sp.set("sortBy", sortOption.sortBy);
        sp.set("sortDir", sortOption.sortDir);
        sp.delete("page");
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
            <div class="flex flex-col gap-3 p-5 pbe-0 @sm:flex-row @sm:items-center @sm:justify-between">
                <Button variant="outline" href={resolve("/(app)/workspaces/new")} size="sm">New Workspace</Button>

                <DropdownMenu>
                    <DropdownMenuTrigger
                        class={buttonVariants({ variant: "outline", size: "sm" })}
                        disabled={Boolean(navigating.to)}
                    >
                        Sort: {currentSortOption.label}
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={currentSortOption.value}>
                            {#each sortOptions as option (option.value)}
                                <DropdownMenuRadioItem value={option.value} onclick={() => onSortChange(option.value)}>
                                    {option.label}
                                </DropdownMenuRadioItem>
                            {/each}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

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
