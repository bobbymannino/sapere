<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import ImageEditor from "$lib/components/image-editor.svelte";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Field from "$lib/components/ui/field";
  import { Input } from "$lib/components/ui/input";
  import * as Separator from "$lib/components/ui/separator";
  import { Textarea } from "$lib/components/ui/textarea";
  import { SpinnerIcon, TrashIcon } from "$lib/icons";
  import type { WorkspaceCardSelection } from "$lib/server/db/workspaces";
  import { slugify } from "$lib/utils";
  import { deleteWorkspaceCommand } from "$lib/workspaces.remote";
  import { onDestroy } from "svelte";

  type FieldName = "title" | "slug" | "description" | "image";
  type Props = {
    workspace: WorkspaceCardSelection;
    showDelete?: boolean;
    onSuccess?: () => void | Promise<void>;
    onCancel?: () => void;
  };

  let { workspace, showDelete = false, onSuccess, onCancel }: Props = $props();
  let pending = $state(false);
  let deleteDialogOpen = $state(false);
  let deleteError = $state(null as string | null);
  let deleting = $derived(deleteWorkspaceCommand.pending > 0);
  let title = $derived(workspace.title);
  let slug = $derived(workspace.slug);
  let description = $derived(workspace.description ?? "");
  /** Already cropped by the image editor, so it can be submitted as-is. */
  let image: File | null = $state(null);
  let imagePreviewUrl: string | null = $state(null);
  let removeImage = $state(false);
  let imageEditorOpen = $state(false);

  let currentImageUrl = $derived(
    workspace.image && !image && !removeImage
      ? `${resolve("/(app)/workspaces/[slug]/image", {
          slug: workspace.slug,
        })}?v=${workspace.updatedAt.getTime()}`
      : null,
  );

  function fieldErrors(field: FieldName) {
    return page.form?.valiErrors?.nested?.[field] ?? [];
  }

  function fieldInvalid(field: FieldName) {
    return fieldErrors(field).length > 0 ? "true" : undefined;
  }

  function clearImagePreview() {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    imagePreviewUrl = null;
  }

  function clearSelectedImage() {
    clearImagePreview();
    image = null;
  }

  function onImageSave(cropped: File) {
    clearImagePreview();
    image = cropped;
    imagePreviewUrl = URL.createObjectURL(cropped);
    removeImage = false;
  }

  function removeCurrentImage() {
    clearSelectedImage();
    removeImage = true;
  }

  function keepCurrentImage() {
    removeImage = false;
  }

  function openDeleteDialog() {
    deleteError = null;
    deleteDialogOpen = true;
  }

  async function confirmDelete() {
    deleteError = null;

    try {
      await deleteWorkspaceCommand(workspace.id);
      deleteDialogOpen = false;
      await goto(resolve("/(app)/workspaces"), { invalidateAll: true });
    } catch (error) {
      deleteError = error instanceof Error ? error.message : "Failed to delete workspace";
    }
  }

  onDestroy(clearImagePreview);
</script>

<form
  enctype="multipart/form-data"
  class="flex flex-col gap-5"
  use:enhance={async ({ formData, cancel }) => {
    if (pending) {
      cancel();
      return;
    }
    pending = true;

    if (image) formData.set("image", image, image.name);

    return async ({ result }) => {
      try {
        if ((result.type === "redirect" || result.type === "success") && onSuccess) {
          await onSuccess();
          return;
        }

        await applyAction(result);
      } finally {
        pending = false;
      }
    };
  }}
  method="post"
>
  <input type="hidden" name="removeImage" value={removeImage ? "true" : "false"} />

  <Field.FieldGroup>
    <Field.Field data-invalid={fieldInvalid("title")}>
      <Field.FieldLabel for="title">Title</Field.FieldLabel>
      <Input
        aria-invalid={fieldErrors("title").length > 0}
        disabled={pending}
        placeholder="Origin"
        id="title"
        name="title"
        required
        autocapitalize="words"
        autofocus
        bind:value={title}
      />
      {#each fieldErrors("title") as error (error)}
        <Field.FieldError>{error}</Field.FieldError>
      {/each}
    </Field.Field>

    <Field.Field data-invalid={fieldInvalid("slug")}>
      <Field.FieldLabel for="slug">Slug</Field.FieldLabel>
      <Field.FieldDescription>A unique slug for your workspace URL</Field.FieldDescription>
      <Input
        aria-invalid={fieldErrors("slug").length > 0}
        disabled={pending}
        placeholder="origin"
        id="slug"
        name="slug"
        required
        autocapitalize="none"
        bind:value={() => slug, (value) => (slug = slugify(String(value ?? "")))}
      />
      {#each fieldErrors("slug") as error (error)}
        <Field.FieldError>{error}</Field.FieldError>
      {/each}
    </Field.Field>

    <Field.Field data-invalid={fieldInvalid("description")}>
      <Field.FieldLabel for="description">Description</Field.FieldLabel>
      <Field.FieldDescription>Optional context about this workspace</Field.FieldDescription>
      <Textarea
        aria-invalid={fieldErrors("description").length > 0}
        disabled={pending}
        placeholder="A place for product research and planning"
        id="description"
        name="description"
        maxlength={1000}
        bind:value={description}
      />
      {#each fieldErrors("description") as error (error)}
        <Field.FieldError>{error}</Field.FieldError>
      {/each}
    </Field.Field>

    <Field.Field data-invalid={fieldInvalid("image")}>
      <Field.FieldLabel>Image</Field.FieldLabel>
      <Field.FieldDescription>Upload a new thumbnail or remove the current one.</Field.FieldDescription>

      {#if currentImageUrl}
        <OptimizedImage src={currentImageUrl} alt="" class="aspect-video w-full rounded-3xl" />
        <div>
          <Button type="button" variant="destructive" disabled={pending} onclick={removeCurrentImage}>
            <TrashIcon data-icon="inline-start" />
            Remove image
          </Button>
        </div>
      {:else if removeImage}
        <Field.FieldDescription>The current image will be removed when you save.</Field.FieldDescription>
        <div>
          <Button type="button" variant="outline" disabled={pending} onclick={keepCurrentImage}>
            Keep current image
          </Button>
        </div>
      {/if}

      {#if image && imagePreviewUrl}
        <img src={imagePreviewUrl} alt="" class="aspect-video w-full rounded-3xl object-cover" />
      {/if}

      <div class="flex gap-2">
        <Button type="button" variant="outline" disabled={pending} onclick={() => (imageEditorOpen = true)}>
          {image ? "Change new image" : "Upload new image"}
        </Button>
        {#if image}
          <Button type="button" variant="ghost" disabled={pending} onclick={clearSelectedImage}>
            Clear selected image
          </Button>
        {/if}
      </div>

      <ImageEditor bind:open={imageEditorOpen} inputImage={image ?? undefined} onSave={onImageSave} />

      {#each fieldErrors("image") as error (error)}
        <Field.FieldError>{error}</Field.FieldError>
      {/each}
    </Field.Field>
  </Field.FieldGroup>

  <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
    {#if onCancel}
      <Button type="button" variant="ghost" disabled={pending} onclick={onCancel}>Cancel</Button>
    {:else}
      <Button
        variant="ghost"
        href={resolve("/(app)/workspaces/[slug]", { slug: workspace.slug })}
        aria-disabled={pending}
      >
        Cancel
      </Button>
    {/if}
    <Button type="submit" disabled={pending || deleting}>
      {#if pending}<SpinnerIcon data-icon="inline-start" class="animate-spin" />{/if}
      Save changes
    </Button>
  </div>
</form>

{#if showDelete}
  <Separator.Root class="my-6" />

  <div class="flex flex-col items-center gap-3">
    <small class="text-muted-foreground text-center">
      This permanently removes the workspace and all of its documents.
    </small>
    <Button type="button" variant="destructive" disabled={pending || deleting} onclick={openDeleteDialog}>
      <TrashIcon data-icon="inline-start" />
      Delete workspace
    </Button>
  </div>

  <Dialog.Root bind:open={deleteDialogOpen}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Delete workspace</Dialog.Title>
        <Dialog.Description>This action cannot be undone.</Dialog.Description>
      </Dialog.Header>

      {#if deleteError}
        <p class="text-destructive text-sm">{deleteError}</p>
      {/if}

      <Dialog.Footer>
        <Button type="button" variant="outline" disabled={deleting} onclick={() => (deleteDialogOpen = false)}>
          Cancel
        </Button>
        <Button type="button" variant="destructive" disabled={deleting} onclick={confirmDelete}>
          {#if deleting}
            <SpinnerIcon data-icon="inline-start" class="animate-spin" />
          {:else}
            <TrashIcon data-icon="inline-start" />
          {/if}
          Delete workspace
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
{/if}
