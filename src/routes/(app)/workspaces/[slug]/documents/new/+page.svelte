<script lang="ts">
  import Meta from "$lib/components/meta.svelte";
  import * as Card from "$lib/components/ui/card";

  import type { PageProps } from "./$types";
  import NewDocumentForm from "./new-document-form.svelte";

  let { data }: PageProps = $props();
</script>

<Meta
  title="New Document"
  description={`Create a new document in ${data.workspace.title}.`}
  tags={["documents", data.workspace.slug]}
  robots="noindex,nofollow"
/>

<main class="flex-center p-5">
  <Card.Root class="w-full max-w-lg">
    <Card.Header>
      <Card.Description>{data.workspace.title}</Card.Description>
      <Card.Title>New Document</Card.Title>
    </Card.Header>

    <Card.Content>
      <NewDocumentForm workspace={data.workspace} />
    </Card.Content>
  </Card.Root>
</main>
