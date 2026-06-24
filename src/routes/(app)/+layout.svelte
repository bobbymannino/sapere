<script lang="ts">
    import SidebarProvider from "$lib/components/ui/sidebar/sidebar-provider.svelte";
    import NavigationProgressBar from "../navigation-progress-bar.svelte";
    import type { LayoutProps } from "./$types";
    import AppSidebar from "./app-sidebar.svelte";

    let { children, data }: LayoutProps = $props();
</script>

<NavigationProgressBar />
<SidebarProvider open={data.sidebarOpen}>
    <AppSidebar username={data.session.user.username} />
    <main class="w-full">
        {@render children?.()}
    </main>
</SidebarProvider>
