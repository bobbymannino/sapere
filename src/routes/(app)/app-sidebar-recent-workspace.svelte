<script lang="ts">
    import type { RecentWorkspaceSelection } from "$db/workspaces";
    import * as Dropdown from "$lib/components/ui/dropdown-menu";
    import * as Sidebar from "$lib/components/ui/sidebar";
    import { page } from "$app/state";
    import { resolve } from "$app/paths";
    import { getRecentWorkspaceDocuments } from "$lib/documents.remote";
    import { EllipsisIcon, MarkdownIcon, PencilIcon, SpinnerIcon } from "$lib/icons";

    let { slug, title, id }: RecentWorkspaceSelection = $props();

    let hasOpenedDropdown = $state(false);

    function dropdownOpenChange() {
        hasOpenedDropdown = true;
    }
</script>

<Sidebar.MenuItem>
    <Sidebar.MenuButton isActive={page.url.pathname === `/workspaces/${slug}`} tooltipContent={title}>
        {#snippet child({ props })}
            <a {...props} href={resolve("/(app)/workspaces/[slug]", { slug })}>
                <span>{title}</span>
            </a>
        {/snippet}
    </Sidebar.MenuButton>
    <Dropdown.Root onOpenChange={dropdownOpenChange}>
        <Dropdown.Trigger>
            {#snippet child({ props })}
                <Sidebar.MenuAction {...props} showOnHover aria-label={`Open ${title} menu`}>
                    <EllipsisIcon />
                </Sidebar.MenuAction>
            {/snippet}
        </Dropdown.Trigger>

        <Dropdown.Content side="right" align="start" class="w-64">
            <Dropdown.Group>
                <Dropdown.GroupHeading>Documents</Dropdown.GroupHeading>

                {#if hasOpenedDropdown}
                    {#await getRecentWorkspaceDocuments(id)}
                        <Dropdown.Item disabled>
                            <SpinnerIcon class="animate-spin" />
                            <span>Loading...</span>
                        </Dropdown.Item>
                    {:then documents}
                        {#each documents as document (document.id)}
                            <Dropdown.Item>
                                {#snippet child({ props })}
                                    <a
                                        {...props}
                                        href={resolve("/(app)/workspaces/[slug]/documents/[docSlug]", {
                                            slug: document.workspaceSlug,
                                            docSlug: document.slug,
                                        })}
                                        class={[props.class, "cursor-pointer"]}
                                    >
                                        <span>{document.title}</span>
                                    </a>
                                {/snippet}
                            </Dropdown.Item>
                        {:else}
                            <Dropdown.Item disabled>
                                <span>No recent documents</span>
                            </Dropdown.Item>
                        {/each}
                    {/await}
                {/if}

                <Dropdown.Item>
                    {#snippet child({ props })}
                        <a
                            {...props}
                            href={resolve("/(app)/workspaces/[slug]/documents", { slug })}
                            class={[props.class, "cursor-pointer"]}
                        >
                            <MarkdownIcon />
                            <span>All documents</span>
                        </a>
                    {/snippet}
                </Dropdown.Item>
            </Dropdown.Group>

            <Dropdown.Separator />

            <Dropdown.Group>
                <Dropdown.GroupHeading>Actions</Dropdown.GroupHeading>

                <Dropdown.Item>
                    {#snippet child({ props })}
                        <a
                            {...props}
                            href={resolve("/(app)/workspaces/[slug]/edit", { slug })}
                            class={[props.class, "cursor-pointer"]}
                        >
                            <PencilIcon />
                            <span>Edit</span>
                        </a>
                    {/snippet}
                </Dropdown.Item>
            </Dropdown.Group>
        </Dropdown.Content>
    </Dropdown.Root>
</Sidebar.MenuItem>
