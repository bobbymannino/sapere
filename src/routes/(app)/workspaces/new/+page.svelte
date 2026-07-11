<script lang="ts">
  import Meta from "$lib/components/meta.svelte";
  import CardContent from "$lib/components/ui/card/card-content.svelte";
  import CardHeader from "$lib/components/ui/card/card-header.svelte";
  import CardTitle from "$lib/components/ui/card/card-title.svelte";
  import Card from "$lib/components/ui/card/card.svelte";

  import NewWorkspaceForm from "./new-workspace-form.svelte";
</script>

<Meta
  title="New Workspace"
  description="Create a new workspace for product research and planning."
  tags={["workspace", "projects"]}
  robots="noindex,nofollow"
/>

<main class="flex-center p-5">
  <Card class="w-full max-w-lg">
    <CardHeader>
      <CardTitle>New Workspace</CardTitle>
    </CardHeader>

    <CardContent>
      <NewWorkspaceForm />
    </CardContent>
  </Card>
</main>
