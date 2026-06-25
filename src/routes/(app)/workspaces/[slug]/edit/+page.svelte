<script lang="ts">
    import { resolve } from "$app/paths";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import * as Card from "$lib/components/ui/card";
    import { SidebarTrigger } from "$lib/components/ui/sidebar";
    import type { PageProps } from "./$types";
    import EditWorkspaceForm from "./edit-workspace-form.svelte";

    let { data }: PageProps = $props();
</script>

<header class="p-5">
    <Breadcrumb.Root>
        <Breadcrumb.List>
            <Breadcrumb.Item>
                <SidebarTrigger />
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
                <Breadcrumb.Link href={resolve("/(app)/workspaces")}>Workspaces</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
                <Breadcrumb.Link
                    href={resolve("/(app)/workspaces/[slug]", {
                        slug: data.workspace.slug,
                    })}
                >
                    {data.workspace.title}
                </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
                <Breadcrumb.Page>Edit</Breadcrumb.Page>
            </Breadcrumb.Item>
        </Breadcrumb.List>
    </Breadcrumb.Root>
</header>

<main class="flex-center p-5">
    <Card.Root class="w-full max-w-lg">
        <Card.Header>
            <Card.Title>Edit Workspace</Card.Title>
            <Card.Description>Update workspace details and thumbnail.</Card.Description>
        </Card.Header>

        <Card.Content>
            <EditWorkspaceForm workspace={data.workspace} />
        </Card.Content>
    </Card.Root>
</main>
