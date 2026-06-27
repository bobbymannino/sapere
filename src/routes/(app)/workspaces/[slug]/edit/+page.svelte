<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import type { PageProps } from "./$types";
    import EditWorkspaceForm from "./edit-workspace-form.svelte";

    let { data }: PageProps = $props();
</script>

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
