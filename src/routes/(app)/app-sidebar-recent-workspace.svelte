<script lang="ts">
    import type { RecentWorkspaceSelection } from "$db/workspaces";
    import * as Dropdown from "$lib/components/ui/dropdown-menu";
    import * as Sidebar from "$lib/components/ui/sidebar";
    import { page } from "$app/state";
    import { resolve } from "$app/paths";
    import { getRecentWorkspaceDocuments } from "$lib/documents.remote";
    import { EllipsisIcon, SpinnerIcon } from "$lib/icons";

    let { slug, title, id }: RecentWorkspaceSelection = $props();

    let hasOpenedDropdown = $state(false);

    function dropdownOpenChange() {
        hasOpenedDropdown = true;
    }
</script>

<Sidebar.MenuItem>
    <Sidebar.MenuButton isActive={page.url.pathname === `/workspaces/${slug}`}>
        {#snippet child({ props })}
            <a {...props} href={resolve("/(app)/workspaces/[slug]", { slug })}>
                <span>{title}</span>
            </a>
        {/snippet}
    </Sidebar.MenuButton>
    <Dropdown.Root onOpenChange={dropdownOpenChange}>
        <Dropdown.Trigger>
            {#snippet child({ props })}
                <Sidebar.MenuAction {...props}>
                    <EllipsisIcon />
                </Sidebar.MenuAction>
            {/snippet}
        </Dropdown.Trigger>

        <Dropdown.Content side="right" align="start">
            <Dropdown.Group>
                <Dropdown.GroupHeading>Documents</Dropdown.GroupHeading>

                {#if hasOpenedDropdown}
                    {#await getRecentWorkspaceDocuments(id)}
                        <Dropdown.Item disabled>
                            <SpinnerIcon class="animate-spin" />
                            <span>Loading...</span>
                        </Dropdown.Item>
                    {:then workspaces}
                        {#each workspaces as w (w.id)}
                            <Dropdown.Item>
                                {#snippet child({ props })}
                                    <a
                                        {...props}
                                        href={resolve("/(app)/workspaces/[slug]/documents/[docSlug]", {
                                            slug: w.workspaceSlug,
                                            docSlug: w.slug,
                                        })}
                                        class={[props.class, "hover:cursor-pointer"]}
                                    >
                                        <span>{w.title}</span>
                                    </a>
                                {/snippet}
                            </Dropdown.Item>
                        {/each}
                    {/await}
                {/if}

                <Dropdown.Item>
                    {#snippet child({ props })}
                        <a
                            {...props}
                            href={resolve("/(app)/workspaces/[slug]/documents", { slug })}
                            class={[props.class, "hover:cursor-pointer"]}
                        >
                            <span>All Documents</span>
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
                            class={[props.class, "hover:cursor-pointer"]}
                        >
                            <span>Edit</span>
                        </a>
                    {/snippet}
                </Dropdown.Item>
            </Dropdown.Group>
        </Dropdown.Content>
    </Dropdown.Root>
</Sidebar.MenuItem>
