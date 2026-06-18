<script lang="ts">
    import ErrorIcon from "$lib/icons/error-icon.svelte";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";

    // Menu items.
    const items = [
        {
            title: "Home",
            url: "#",
            icon: ErrorIcon,
        },
        {
            title: "Inbox",
            url: "#",
            icon: ErrorIcon,
        },
        {
            title: "Calendar",
            url: "#",
            icon: ErrorIcon,
        },
        {
            title: "Search",
            url: "#",
            icon: ErrorIcon,
        },
        {
            title: "Settings",
            url: "#",
            icon: ErrorIcon,
        },
    ];
</script>

<Sidebar.Root>
    <Sidebar.Content>
        <Sidebar.Group>
            <Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
                <Sidebar.Menu>
                    {#each items as item (item.title)}
                        <Sidebar.MenuItem>
                            <Sidebar.MenuButton>
                                {#snippet child({ props })}
                                    <a href={item.url} {...props}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </a>
                                {/snippet}
                            </Sidebar.MenuButton>
                        </Sidebar.MenuItem>
                    {/each}
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>
    </Sidebar.Content>
</Sidebar.Root>
