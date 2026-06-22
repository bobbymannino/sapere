<script lang="ts">
    import BreadcrumbItem from "$lib/components/ui/breadcrumb/breadcrumb-item.svelte";
    import BreadcrumbList from "$lib/components/ui/breadcrumb/breadcrumb-list.svelte";
    import BreadcrumbPage from "$lib/components/ui/breadcrumb/breadcrumb-page.svelte";
    import BreadcrumbSeparator from "$lib/components/ui/breadcrumb/breadcrumb-separator.svelte";
    import Breadcrumb from "$lib/components/ui/breadcrumb/breadcrumb.svelte";
    import SidebarTrigger from "$lib/components/ui/sidebar/sidebar-trigger.svelte";
    import type { PageProps } from "./$types";
    import WorkspaceCard from "./workspace-card.svelte";

    let { data }: PageProps = $props();
</script>

<header class="p-5">
    <Breadcrumb>
        <BreadcrumbList>
            <BreadcrumbItem>
                <SidebarTrigger />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbPage>Workspaces</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>
</header>

<ul class="p-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    {#each data.workspaces as w (w.id)}
        <li>
            <WorkspaceCard {...w} />
        </li>
    {/each}
</ul>
