<script lang="ts">
  import * as Button from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Slider } from "$lib/components/ui/slider";
  import { PictureIcon, SpinnerIcon } from "$lib/icons";
  import init, { crop, isImageFile } from "@bobbymannino/image-tools";
  import { onMount } from "svelte";
  import Cropper, { type CropArea, type OnCropCompleteEvent } from "svelte-easy-crop";

  type Props = {
    inputImage?: File;
    outputImage?: File;
    open?: boolean;
    /** @default 16 / 9 */
    aspectRatio?: number;
    /** Called with the cropped image once the user saves. */
    onSave?: (image: File) => void;
    /** Called when the user cancels or dismisses the editor. */
    onCancel?: () => void;
  };

  let {
    inputImage,
    outputImage = $bindable(),
    open = $bindable(false),
    aspectRatio = 16 / 9,
    onSave,
    onCancel,
  }: Props = $props();

  const acceptedTypes = "image/jpeg,image/png,image/bmp,image/gif";

  let cropArea: CropArea = $state({ x: 0, y: 0, width: 0, height: 0 });
  let isPending = $state(false);
  let isDraggingOver = $state(false);
  let error = $state<string>();
  let zoom = $state(1);
  let input: HTMLInputElement;

  /** The image currently being edited, either the provided one or a newly picked one. */
  let image = $state<File>();
  $effect(() => {
    image = inputImage;
  });

  let imageUrl = $state<string>();
  $effect(() => {
    if (!image) {
      imageUrl = undefined;
      return;
    }

    const url = URL.createObjectURL(image);
    imageUrl = url;

    return () => URL.revokeObjectURL(url);
  });

  onMount(async () => {
    await init();
  });

  function oncropcomplete(event: OnCropCompleteEvent) {
    cropArea = event.pixels;
  }

  function setImage(newImage: File | undefined) {
    if (!newImage) return;

    if (!isImageFile(newImage.name)) {
      error = "That file is not a supported image.";
      return;
    }

    error = undefined;
    zoom = 1;
    image = newImage;
  }

  /** Set while closing after a save so the close handler doesn't also report a cancel. */
  let isSaving = false;

  function cancel() {
    open = false;
  }

  async function saveAndClose() {
    if (!image || isPending) return;

    if (cropArea.width < 1 || cropArea.height < 1) {
      error = "Select an area to crop first.";
      return;
    }

    isPending = true;
    error = undefined;

    try {
      const bytes = await image.bytes();
      const cropped = crop(bytes, cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      const file = new File([cropped as BlobPart], image.name, {
        type: image.type,
        lastModified: Date.now(),
      });

      outputImage = file;
      isSaving = true;
      open = false;
      onSave?.(file);
    } catch (e) {
      console.error("Failed to crop image", e);
      error = "Failed to crop image, please try again.";
    } finally {
      isPending = false;
    }
  }

  function imageChange(event: Event & { currentTarget: HTMLInputElement }) {
    setImage(event.currentTarget.files?.[0]);
    // Allow re-picking the same file.
    event.currentTarget.value = "";
  }

  /** Depth of nested elements the drag is currently over, so child boundaries don't flicker the overlay. */
  let dragDepth = 0;

  function ondrop(event: DragEvent) {
    event.preventDefault();
    dragDepth = 0;
    isDraggingOver = false;
    if (isPending) return;
    setImage(event.dataTransfer?.files?.[0]);
  }

  function ondragenter(event: DragEvent) {
    event.preventDefault();
    dragDepth += 1;
    if (!isPending) isDraggingOver = true;
  }

  function ondragover(event: DragEvent) {
    event.preventDefault();
  }

  function ondragleave() {
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) isDraggingOver = false;
  }
</script>

<Dialog.Root
  bind:open
  onOpenChange={(isOpen) => {
    if (isOpen) {
      isSaving = false;
      error = undefined;
      return;
    }

    if (!isSaving) onCancel?.();
    isSaving = false;
  }}
>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit image</Dialog.Title>
      <Dialog.Description>Drag to reposition and use the slider to zoom, then save.</Dialog.Description>
    </Dialog.Header>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div {ondrop} {ondragenter} {ondragover} {ondragleave}>
      {#if imageUrl}
        <div class="relative aspect-video overflow-hidden rounded-xl">
          <Cropper image={imageUrl} bind:zoom aspect={aspectRatio} {oncropcomplete} />

          {#if isDraggingOver}
            <div
              class="border-primary bg-background/80 text-foreground pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed backdrop-blur-sm"
            >
              <PictureIcon class="text-muted-foreground size-8" />
              <span class="text-sm font-medium">Drop to replace this image</span>
              <span class="text-muted-foreground text-xs">JPEG, PNG, BMP or GIF</span>
            </div>
          {/if}
        </div>
        <Slider bind:value={zoom} type="single" min={1} step={0.1} max={5} class="mt-4" />
      {:else}
        <button
          type="button"
          onclick={() => input.click()}
          class="border-muted-foreground/30 hover:bg-muted/50 data-[dragging=true]:border-primary data-[dragging=true]:bg-muted flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors"
          data-dragging={isDraggingOver}
        >
          <PictureIcon class="text-muted-foreground size-8" />
          <span class="text-sm font-medium">Drop an image here, or click to browse</span>
          <span class="text-muted-foreground text-xs">JPEG, PNG, BMP or GIF</span>
        </button>
      {/if}
    </div>

    {#if error}
      <p class="text-destructive text-sm">{error}</p>
    {/if}

    <Dialog.Footer>
      <input type="file" class="hidden" accept={acceptedTypes} bind:this={input} onchange={imageChange} />
      <Button.Root variant="outline" disabled={isPending} class="me-auto" onclick={() => input.click()}>
        {image ? "Change Image" : "Upload Image"}
      </Button.Root>
      <Button.Root variant="ghost" onclick={cancel} disabled={isPending}>Cancel</Button.Root>
      <Button.Root onclick={saveAndClose} disabled={isPending || !image}>
        {#if isPending}<SpinnerIcon class="animate-spin" />{/if}
        <span>Save</span>
      </Button.Root>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
