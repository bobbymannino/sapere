<script lang="ts">
    import BreadcrumbItem from "$lib/components/ui/breadcrumb/breadcrumb-item.svelte";
    import BreadcrumbLink from "$lib/components/ui/breadcrumb/breadcrumb-link.svelte";
    import BreadcrumbList from "$lib/components/ui/breadcrumb/breadcrumb-list.svelte";
    import BreadcrumbSeparator from "$lib/components/ui/breadcrumb/breadcrumb-separator.svelte";
    import Breadcrumb from "$lib/components/ui/breadcrumb/breadcrumb.svelte";
    import SidebarTrigger from "$lib/components/ui/sidebar/sidebar-trigger.svelte";
    import type { PageProps } from "./$types";

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
                <BreadcrumbLink href="/">Workspaces</BreadcrumbLink>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>
</header>

<ul>
    {#each data.workspaces as w (w.id)}
        <li>
            <a href="/workspaces/{w.slug}-{w.id}">
                <h2>{w.title}</h2>
                <p>{w.updatedAt}</p>
            </a>
        </li>
    {/each}
</ul>
