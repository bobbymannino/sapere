<script lang="ts">
    import type { RecentWorkspaceSelection } from "$db/workspaces";
    import * as Dropdown from "$lib/components/ui/dropdown-menu";
    import * as Sidebar from "$lib/components/ui/sidebar";
    import { page } from "$app/state";
    import { resolve } from "$app/paths";
    import { EllipsisIcon } from "$lib/icons";

    let { slug, title }: RecentWorkspaceSelection = $props();
</script>

<Sidebar.MenuItem>
    <Sidebar.MenuButton isActive={page.url.pathname === `/workspaces/${slug}`}>
        {#snippet child({ props })}
            <a {...props} href={resolve("/(app)/workspaces/[slug]", { slug })}>
                <span>{title}</span>
            </a>
        {/snippet}
    </Sidebar.MenuButton>
    <Dropdown.Root>
        <Dropdown.Trigger>
            {#snippet child({ props })}
                <Sidebar.MenuAction {...props}>
                    <EllipsisIcon />
                </Sidebar.MenuAction>
            {/snippet}
        </Dropdown.Trigger>
        <Dropdown.Content side="right" align="start">
            <Dropdown.Item>
                {#snippet child({ props })}
                    <a
                        {...props}
                        href={resolve("/(app)/workspaces/[slug]/documents", { slug })}
                        class={[props.class, "hover:cursor-pointer"]}
                    >
                        <span>Documents</span>
                    </a>
                {/snippet}
            </Dropdown.Item>
            <Dropdown.Separator />
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
        </Dropdown.Content>
    </Dropdown.Root>
</Sidebar.MenuItem>
