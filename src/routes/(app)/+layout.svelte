<script lang="ts">
    import SidebarProvider from "$lib/components/ui/sidebar/sidebar-provider.svelte";
    import SidebarTrigger from "$lib/components/ui/sidebar/sidebar-trigger.svelte";
    import AppSidebar from "./app-sidebar.svelte";

    let { children } = $props();
</script>

<SidebarProvider>
    <AppSidebar />
    <main>
        <SidebarTrigger />
        {@render children?.()}
    </main>
</SidebarProvider>
