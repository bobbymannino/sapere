<script lang="ts">
    import Meta from "$lib/components/meta.svelte";
    import * as Card from "$lib/components/ui/card";
    import type { PageProps } from "./$types";
    import EditDocumentForm from "./edit-document-form.svelte";

    let { data }: PageProps = $props();
</script>

<Meta
    title={`Edit ${data.document.title}`}
    description={`Update or delete ${data.document.title}.`}
    tags={["documents", data.workspace.slug, data.document.slug, "edit"]}
    robots="noindex,nofollow"
/>

<main class="flex-center p-5">
    <Card.Root class="w-full max-w-lg">
        <Card.Header>
            <Card.Description>{data.workspace.title}</Card.Description>
            <Card.Title>Edit Document</Card.Title>
        </Card.Header>

        <Card.Content>
            <EditDocumentForm workspace={data.workspace} document={data.document} />
        </Card.Content>
    </Card.Root>
</main>
