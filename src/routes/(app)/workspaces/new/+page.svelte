<script lang="ts">
    import BreadcrumbItem from "$lib/components/ui/breadcrumb/breadcrumb-item.svelte";
    import BreadcrumbLink from "$lib/components/ui/breadcrumb/breadcrumb-link.svelte";
    import BreadcrumbList from "$lib/components/ui/breadcrumb/breadcrumb-list.svelte";
    import BreadcrumbPage from "$lib/components/ui/breadcrumb/breadcrumb-page.svelte";
    import BreadcrumbSeparator from "$lib/components/ui/breadcrumb/breadcrumb-separator.svelte";
    import Breadcrumb from "$lib/components/ui/breadcrumb/breadcrumb.svelte";
    import CardContent from "$lib/components/ui/card/card-content.svelte";
    import CardHeader from "$lib/components/ui/card/card-header.svelte";
    import CardTitle from "$lib/components/ui/card/card-title.svelte";
    import Card from "$lib/components/ui/card/card.svelte";
    import SidebarTrigger from "$lib/components/ui/sidebar/sidebar-trigger.svelte";
    import type { PageProps } from "./$types";
    import NewWorkspaceForm from "./new-workspace-form.svelte";

    let { form }: PageProps = $props();
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
                <BreadcrumbPage>New Workspace</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>
</header>

<main class="flex-center p-5">
    <Card class="max-w-lg w-full">
        <CardHeader>
            <CardTitle>New Workspace</CardTitle>
        </CardHeader>

        <CardContent>
            <NewWorkspaceForm />
        </CardContent>
    </Card>
</main>
