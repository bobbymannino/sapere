<script lang="ts">
    import { resolve } from "$app/paths";
    import BreadcrumbItem from "$lib/components/ui/breadcrumb/breadcrumb-item.svelte";
    import BreadcrumbLink from "$lib/components/ui/breadcrumb/breadcrumb-link.svelte";
    import BreadcrumbList from "$lib/components/ui/breadcrumb/breadcrumb-list.svelte";
    import BreadcrumbPage from "$lib/components/ui/breadcrumb/breadcrumb-page.svelte";
    import BreadcrumbSeparator from "$lib/components/ui/breadcrumb/breadcrumb-separator.svelte";
    import Breadcrumb from "$lib/components/ui/breadcrumb/breadcrumb.svelte";
    import SidebarTrigger from "$lib/components/ui/sidebar/sidebar-trigger.svelte";
    import { formatDateTime, toIsoDate } from "$lib/date-format";
    import type { PageProps } from "./$types";
    import Button from "$lib/components/ui/button/button.svelte";

    let { data }: PageProps = $props();
    let formattedUpdatedAt = $derived(formatDateTime(data.workspace.updatedAt));
    let updatedAtIso = $derived(toIsoDate(data.workspace.updatedAt));
    let imageUrl = $derived(resolve("/(app)/workspaces/[slug]/image", { slug: data.workspace.slug }));
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
    {#if data.workspace.image}
        <img src={imageUrl} alt="" class="mb-5 aspect-video w-full max-w-4xl rounded-3xl object-cover" />
    {/if}
    <h1>{data.workspace.title}</h1>
    {#if data.workspace.description}
        <p class="whitespace-pre-wrap text-muted-foreground">{data.workspace.description}</p>
    {/if}
    <p>Updated <time datetime={updatedAtIso}>{formattedUpdatedAt}</time></p>
    <Button href="/workspaces/{data.workspace.slug}/edit">Edit</Button>
</div>
