<script lang="ts">
    import { resolve } from "$app/paths";
    import BreadcrumbItem from "$lib/components/ui/breadcrumb/breadcrumb-item.svelte";
    import BreadcrumbList from "$lib/components/ui/breadcrumb/breadcrumb-list.svelte";
    import BreadcrumbPage from "$lib/components/ui/breadcrumb/breadcrumb-page.svelte";
    import BreadcrumbSeparator from "$lib/components/ui/breadcrumb/breadcrumb-separator.svelte";
    import Breadcrumb from "$lib/components/ui/breadcrumb/breadcrumb.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import EmptyContent from "$lib/components/ui/empty/empty-content.svelte";
    import EmptyDescription from "$lib/components/ui/empty/empty-description.svelte";
    import EmptyHeader from "$lib/components/ui/empty/empty-header.svelte";
    import EmptyMedia from "$lib/components/ui/empty/empty-media.svelte";
    import EmptyTitle from "$lib/components/ui/empty/empty-title.svelte";
    import Empty from "$lib/components/ui/empty/empty.svelte";
    import SidebarTrigger from "$lib/components/ui/sidebar/sidebar-trigger.svelte";
    import WorkspaceIcon from "$lib/icons/workspace-icon.svelte";
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

{#if data.workspaces.length === 0}
    <Empty>
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <WorkspaceIcon />
            </EmptyMedia>
            <EmptyTitle>No workspaces</EmptyTitle>
            <EmptyDescription>You are not apart of any workspaces</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
            <Button href={resolve("/(app)/workspaces/new")}>New Workspace</Button>
        </EmptyContent>
    </Empty>
{:else}
    <ul class="p-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {#each data.workspaces as w (w.id)}
            <li>
                <WorkspaceCard {...w} />
            </li>
        {/each}
    </ul>
    <div class="p-5 flex-center">
        <Button variant="outline" href={resolve("/(app)/workspaces/new")}>New Workspace</Button>
    </div>
{/if}
