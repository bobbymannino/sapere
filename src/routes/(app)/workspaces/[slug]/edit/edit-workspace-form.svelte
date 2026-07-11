<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Field from "$lib/components/ui/field";
  import { Input } from "$lib/components/ui/input";
  import { Slider } from "$lib/components/ui/slider";
  import { Textarea } from "$lib/components/ui/textarea";
  import { SpinnerIcon, TrashIcon } from "$lib/icons";
  import type { WorkspaceCardSelection } from "$lib/server/db/workspaces";
  import { slugify } from "$lib/utils";
  import { onDestroy } from "svelte";
  import Cropper, { type CropArea } from "svelte-easy-crop";

  type FieldName = "title" | "slug" | "description" | "image";
  type Props = {
    workspace: WorkspaceCardSelection;
    onSuccess?: () => void | Promise<void>;
    onCancel?: () => void;
  };

  let { workspace, onSuccess, onCancel }: Props = $props();
  let pending = $state(false);
  let title = $derived(workspace.title);
  let slug = $derived(workspace.slug);
  let description = $derived(workspace.description ?? "");
  let image: File | null = $state(null);
  let imageInput: HTMLInputElement | null = $state(null);
  let imagePreviewUrl: string | null = $state(null);
  let removeImage = $state(false);
  let zoom = $state(1);
  let crop: CropArea = $state({ height: 0, width: 0, x: 0, y: 0 });

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

  function resetCrop() {
    zoom = 1;
    crop = { height: 0, width: 0, x: 0, y: 0 };
  }

  function clearImagePreview() {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    imagePreviewUrl = null;
  }

  function clearSelectedImage() {
    clearImagePreview();
    image = null;
    resetCrop();
    if (imageInput) imageInput.value = "";
  }

  function onImageChange(event: Event & { currentTarget: HTMLInputElement }) {
    const selectedImage = event.currentTarget.files?.[0] ?? null;
    clearImagePreview();
    image = selectedImage;
    imagePreviewUrl = selectedImage ? URL.createObjectURL(selectedImage) : null;
    removeImage = false;
    resetCrop();
  }

  function removeCurrentImage() {
    clearSelectedImage();
    removeImage = true;
  }

  function keepCurrentImage() {
    removeImage = false;
  }

  /**
   * Crops an image file to the given pixel area using the Canvas API.
   * Falls back to `image/webp` for AVIF inputs since canvas cannot encode AVIF.
   */
  async function cropImageFile(file: File, area: CropArea): Promise<File> {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = document.createElement("img");
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = area.width;
      canvas.height = area.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context unavailable");

      ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);

      const mimeType = file.type === "image/avif" ? "image/webp" : file.type;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to encode cropped image"))), mimeType, 0.9);
      });

      return new File([blob], file.name, { type: mimeType });
    } finally {
      URL.revokeObjectURL(url);
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

    try {
      if (image && crop.width > 0 && crop.height > 0) {
        const croppedFile = await cropImageFile(image, crop);
        formData.set("image", croppedFile, image.name);
      }
    } catch (error) {
      pending = false;
      throw error;
    }

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
      <Field.FieldLabel for="image">Image</Field.FieldLabel>
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

      <Input
        bind:ref={imageInput}
        aria-invalid={fieldErrors("image").length > 0}
        disabled={pending}
        type="file"
        id="image"
        name="image"
        accept="image/png, image/jpeg, image/avif, image/webp"
        onchange={onImageChange}
      />

      {#if image && imagePreviewUrl}
        <div class="relative aspect-video overflow-hidden rounded-3xl">
          <Cropper
            image={imagePreviewUrl}
            bind:zoom
            aspect={16 / 9}
            oncropcomplete={(event) => (crop = event.pixels)}
          />
        </div>
        <Slider bind:value={zoom} type="single" min={1} step={0.1} max={5} disabled={pending} />
        <div>
          <Button type="button" variant="outline" disabled={pending} onclick={clearSelectedImage}>
            Clear selected image
          </Button>
        </div>
      {/if}

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
    <Button type="submit" disabled={pending}>
      {#if pending}<SpinnerIcon data-icon="inline-start" class="animate-spin" />{/if}
      Save changes
    </Button>
  </div>
</form>
