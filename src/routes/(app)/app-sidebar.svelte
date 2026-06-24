<script lang="ts">
    import { goto } from "$app/navigation";
    import { APP_NAME } from "$app/env/public";
    import { authClient } from "$lib/auth-client";
    import DropdownMenu from "$lib/components/ui/dropdown-menu/dropdown-menu.svelte";
    import DropdownMenuContent from "$lib/components/ui/dropdown-menu/dropdown-menu-content.svelte";
    import DropdownMenuTrigger from "$lib/components/ui/dropdown-menu/dropdown-menu-trigger.svelte";
    import DropdownMenuItem from "$lib/components/ui/dropdown-menu/dropdown-menu-item.svelte";
    import DropdownMenuGroup from "$lib/components/ui/dropdown-menu/dropdown-menu-group.svelte";
    import SidebarHeader from "$lib/components/ui/sidebar/sidebar-header.svelte";
    import SidebarContent from "$lib/components/ui/sidebar/sidebar-content.svelte";
    import Sidebar from "$lib/components/ui/sidebar/sidebar.svelte";
    import SidebarFooter from "$lib/components/ui/sidebar/sidebar-footer.svelte";
    import SidebarMenu from "$lib/components/ui/sidebar/sidebar-menu.svelte";
    import SidebarMenuItem from "$lib/components/ui/sidebar/sidebar-menu-item.svelte";
    import SidebarMenuButton from "$lib/components/ui/sidebar/sidebar-menu-button.svelte";
    import SidebarGroup from "$lib/components/ui/sidebar/sidebar-group.svelte";
    import SidebarGroupContent from "$lib/components/ui/sidebar/sidebar-group-content.svelte";
    import {
        ChevronUpIcon,
        ExitIcon,
        SpinnerIcon,
        UserIcon,
        WorkspaceIcon,
    } from "$lib/icons";

    type Props = { username: string };

    let { username }: Props = $props();

    let pending = $state(false);

    async function signOut() {
        pending = true;
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => goto("/login", { invalidateAll: true }),
            },
        });
        pending = false;
    }
</script>

<Sidebar>
    <SidebarHeader>
        <span class="font-heading px-3 py-2 text-lg font-bold">{APP_NAME}</span>
    </SidebarHeader>

    <SidebarContent>
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            {#snippet child({ props })}
                                <a {...props} href={"/workspaces"}>
                                    <WorkspaceIcon />
                                    <span>Workspaces</span>
                                </a>
                            {/snippet}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    </SidebarContent>

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
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                {#snippet child({ props })}
                                    <a {...props} href={"/account"}>
                                        <UserIcon />
                                        Account
                                    </a>
                                {/snippet}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onclick={signOut}
                                variant="destructive"
                                disabled={pending}
                            >
                                {#if pending}
                                    <SpinnerIcon class="animate-spin" />
                                {:else}
                                    <ExitIcon />
                                {/if}
                                <span>Sign out</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarFooter>
</Sidebar>
