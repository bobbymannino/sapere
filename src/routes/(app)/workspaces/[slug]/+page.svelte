<script lang="ts">
    import BreadcrumbItem from "$lib/components/ui/breadcrumb/breadcrumb-item.svelte";
    import BreadcrumbLink from "$lib/components/ui/breadcrumb/breadcrumb-link.svelte";
    import BreadcrumbList from "$lib/components/ui/breadcrumb/breadcrumb-list.svelte";
    import BreadcrumbPage from "$lib/components/ui/breadcrumb/breadcrumb-page.svelte";
    import BreadcrumbSeparator from "$lib/components/ui/breadcrumb/breadcrumb-separator.svelte";
    import Breadcrumb from "$lib/components/ui/breadcrumb/breadcrumb.svelte";
    import SidebarTrigger from "$lib/components/ui/sidebar/sidebar-trigger.svelte";
    import { formatDateTime, toIsoDate } from "$lib/date-format";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
    let formattedUpdatedAt = $derived(formatDateTime(data.workspace.updatedAt));
    let updatedAtIso = $derived(toIsoDate(data.workspace.updatedAt));
</script>

<header class="p-5">
    <Breadcrumb>
        <BreadcrumbList>
            <BreadcrumbItem>
                <SidebarTrigger />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbLink href="/workspaces">Workspaces</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbPage>{data.workspace.title}</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>
</header>

<div class="p-5">
    <h1>{data.workspace.title}</h1>
    <p>Updated <time datetime={updatedAtIso}>{formattedUpdatedAt}</time></p>
</div>
