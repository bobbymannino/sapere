<script lang="ts">
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { navigating, page } from "$app/state";
    import * as Button from "$lib/components/ui/button";
    import { buttonVariants } from "$lib/components/ui/button";
    import * as Dropdown from "$lib/components/ui/dropdown-menu";
    import { WorkspaceIcon } from "$lib/icons";

    const sortOptions = [
        { label: "Recently updated", sortBy: "updatedAt", sortDir: "desc", value: "updatedAt:desc" },
        { label: "Oldest updated", sortBy: "updatedAt", sortDir: "asc", value: "updatedAt:asc" },
        { label: "Name A-Z", sortBy: "title", sortDir: "asc", value: "title:asc" },
        { label: "Name Z-A", sortBy: "title", sortDir: "desc", value: "title:desc" },
        { label: "Newest created", sortBy: "createdAt", sortDir: "desc", value: "createdAt:desc" },
        { label: "Oldest created", sortBy: "createdAt", sortDir: "asc", value: "createdAt:asc" },
    ] as const;

    type Props = {
        /** @default updatedAt */
        sortBy?: LiteralUnion<(typeof sortOptions)[number]["sortBy"]>;
        /** @default desc */
        sortDir?: LiteralUnion<(typeof sortOptions)[number]["sortDir"]>;
    };

    let { sortBy = "updatedAt", sortDir = "desc" }: Props = $props();

    const sortOption = $derived(sortOptions.find((o) => o.value === `${sortBy}:${sortDir}`) ?? sortOptions[0]);

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

<div class="p-5 pbe-0 flex flex-wrap justify-end gap-2">
    <Dropdown.Root>
        <Dropdown.Trigger class={buttonVariants({ variant: "outline", size: "sm" })} disabled={Boolean(navigating.to)}>
            Sort: {sortOption.label}
        </Dropdown.Trigger>

        <Dropdown.Content align="end">
            <Dropdown.Label>Sort by</Dropdown.Label>
            <Dropdown.RadioGroup value={sortOption.value}>
                {#each sortOptions as option (option.value)}
                    <Dropdown.RadioItem value={option.value} onclick={() => onSortChange(option.value)}>
                        {option.label}
                    </Dropdown.RadioItem>
                {/each}
            </Dropdown.RadioGroup>
        </Dropdown.Content>
    </Dropdown.Root>

    <Button.Root variant="outline" href={resolve("/(app)/workspaces/new")} size="sm">
        <WorkspaceIcon />
        <span>New Workspace</span>
    </Button.Root>
</div>
