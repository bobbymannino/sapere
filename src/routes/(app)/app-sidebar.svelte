<script lang="ts">
    import DropdownMenu from "$lib/components/ui/dropdown-menu/dropdown-menu.svelte";
    import DropdownMenuContent from "$lib/components/ui/dropdown-menu/dropdown-menu-content.svelte";
    import DropdownMenuTrigger from "$lib/components/ui/dropdown-menu/dropdown-menu-trigger.svelte";
    import DropdownMenuItem from "$lib/components/ui/dropdown-menu/dropdown-menu-item.svelte";
    import ChevronUpIcon from "$lib/icons/chevron-up-icon.svelte";
    import SidebarHeader from "$lib/components/ui/sidebar/sidebar-header.svelte";
    import SidebarContent from "$lib/components/ui/sidebar/sidebar-content.svelte";
    import Sidebar from "$lib/components/ui/sidebar/sidebar.svelte";
    import SidebarFooter from "$lib/components/ui/sidebar/sidebar-footer.svelte";
    import SidebarMenu from "$lib/components/ui/sidebar/sidebar-menu.svelte";
    import SidebarMenuItem from "$lib/components/ui/sidebar/sidebar-menu-item.svelte";
    import SidebarMenuButton from "$lib/components/ui/sidebar/sidebar-menu-button.svelte";

    type Props = { username: string };

    let { username }: Props = $props();
</script>

<Sidebar>
    <SidebarHeader />
    <SidebarContent />
    <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        {#snippet child({ props })}
                            <SidebarMenuButton
                                {...props}
                                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                {username}
                                <ChevronUpIcon class="ms-auto" />
                            </SidebarMenuButton>
                        {/snippet}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="top"
                        class="w-(--bits-dropdown-menu-anchor-width)"
                    >
                        <DropdownMenuItem>
                            <span>Sign out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarFooter>
</Sidebar>
