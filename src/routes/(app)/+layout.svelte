<script lang="ts">
    import SidebarProvider from "$lib/components/ui/sidebar/sidebar-provider.svelte";
    import NavigationProgressBar from "../navigation-progress-bar.svelte";
    import type { LayoutProps } from "./$types";
    import AppBreadcrumbs from "./app-breadcrumbs.svelte";
    import CommandBar from "./command-bar.svelte";
    import AppSidebar from "./app-sidebar.svelte";
    import SiteFooter from "../site-footer.svelte";

    let { children, data }: LayoutProps = $props();
</script>

<NavigationProgressBar />
<SidebarProvider open={data.sidebarOpen}>
    <AppSidebar
        username={data.session.user.username}
        recentWorkspaces={data.recentWorkspaces}
        recentDocuments={data.recentDocuments}
    />
    <main class="w-full grid grid-rows-[auto_1fr_auto]">
        <AppBreadcrumbs>
            <CommandBar workspaces={data.commandWorkspaces} />
        </AppBreadcrumbs>
        {@render children?.()}
        <SiteFooter />
    </main>
</SidebarProvider>
