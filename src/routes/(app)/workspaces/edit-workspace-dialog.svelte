<script lang="ts">
  import { pushState, refreshAll } from "$app/navigation";
  import { page } from "$app/state";
  import DialogContent from "$lib/components/ui/dialog/dialog-content.svelte";
  import DialogHeader from "$lib/components/ui/dialog/dialog-header.svelte";
  import DialogTitle from "$lib/components/ui/dialog/dialog-title.svelte";
  import Dialog from "$lib/components/ui/dialog/dialog.svelte";

  import EditWorkspaceForm from "./[slug]/edit/edit-workspace-form.svelte";

  type Props = { postUpdatePath: string };

  let { postUpdatePath }: Props = $props();

  function closeEditDialog() {
    history.back();
  }

  async function handleEditSuccess() {
    pushState(postUpdatePath, {});
    await refreshAll({ includeLoadFunctions: true });
  }
</script>

{#if page.state.editWorkspace}
  <Dialog
    open
    onOpenChange={(open) => {
      if (!open) closeEditDialog();
    }}
  >
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Edit workspace</DialogTitle>
      </DialogHeader>

      <EditWorkspaceForm
        workspace={page.state.editWorkspace}
        onSuccess={handleEditSuccess}
        onCancel={closeEditDialog}
      />
    </DialogContent>
  </Dialog>
{/if}
