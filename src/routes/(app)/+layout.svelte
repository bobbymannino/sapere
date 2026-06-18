<script lang="ts">
    import SidebarProvider from "$lib/components/ui/sidebar/sidebar-provider.svelte";
    import SidebarTrigger from "$lib/components/ui/sidebar/sidebar-trigger.svelte";
    import type { LayoutProps } from "./$types";
    import AppSidebar from "./app-sidebar.svelte";

    let { children, data }: LayoutProps = $props();
</script>

<SidebarProvider>
    <AppSidebar username={data.session.user.username} />
    <main>
        <SidebarTrigger />
        {@render children?.()}
    </main>
</SidebarProvider>
