<script lang="ts">
    import { resolve } from "$app/paths";
    import { navigating, page } from "$app/state";
    import { buttonVariants } from "$lib/components/ui/button";
    import * as Dropdown from "$lib/components/ui/dropdown-menu";

    const sortOptions = [
        { label: "Recently updated", sortBy: "updatedAt", sortDir: "desc", value: "updatedAt:desc" },
        { label: "Oldest updated", sortBy: "updatedAt", sortDir: "asc", value: "updatedAt:asc" },
        { label: "Title A-Z", sortBy: "title", sortDir: "asc", value: "title:asc" },
        { label: "Title Z-A", sortBy: "title", sortDir: "desc", value: "title:desc" },
        { label: "Newest created", sortBy: "createdAt", sortDir: "desc", value: "createdAt:desc" },
        { label: "Oldest created", sortBy: "createdAt", sortDir: "asc", value: "createdAt:asc" },
    ] as const;

    type SortOption = (typeof sortOptions)[number];

    type Props = {
        workspaceSlug: string;
        /** @default updatedAt */
        sortBy?: LiteralUnion<SortOption["sortBy"]>;
        /** @default desc */
        sortDir?: LiteralUnion<SortOption["sortDir"]>;
    };

    let { workspaceSlug, sortBy = "updatedAt", sortDir = "desc" }: Props = $props();

    const sortOption = $derived(sortOptions.find((option) => option.value === `${sortBy}:${sortDir}`) ?? sortOptions[0]);

    function getSortSearch(option: SortOption) {
        const searchParams = new URLSearchParams(page.url.searchParams);
        searchParams.set("sortBy", option.sortBy);
        searchParams.set("sortDir", option.sortDir);
        searchParams.delete("page");
        return searchParams.toString();
    }
</script>

<Dropdown.Root>
    <Dropdown.Trigger class={buttonVariants({ variant: "outline", size: "sm" })} disabled={Boolean(navigating.to)}>
        Sort: {sortOption.label}
    </Dropdown.Trigger>

    <Dropdown.Content align="end">
        <Dropdown.Label>Sort by</Dropdown.Label>
        <Dropdown.Group>
            {#each sortOptions as option (option.value)}
                <Dropdown.Item>
                    {#snippet child({ props })}
                        <a
                            {...props}
                            href={`${resolve("/(app)/workspaces/[slug]/documents", { slug: workspaceSlug })}?${getSortSearch(option)}`}
                            class={[props.class, "cursor-pointer", sortOption.value === option.value && "bg-accent text-accent-foreground"]}
                            aria-current={sortOption.value === option.value ? "true" : undefined}
                        >
                            {option.label}
                        </a>
                    {/snippet}
                </Dropdown.Item>
            {/each}
        </Dropdown.Group>
    </Dropdown.Content>
</Dropdown.Root>