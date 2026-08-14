<script lang="ts">
  import * as Button from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Slider } from "$lib/components/ui/slider";
  import { SpinnerIcon } from "$lib/icons";
  import init, { crop } from "@bobbymannino/image-tools";
  import { onMount } from "svelte";
  import Cropper, { type CropArea, type OnCropCompleteEvent } from "svelte-easy-crop";

  type Props = {
    inputImage?: File;
    outputImage?: File;
    open?: boolean;
    /** @default 16 / 9 */
    aspectRatio?: number;
  };

  let { inputImage, outputImage = $bindable(), open = $bindable(false), aspectRatio = 16 / 9 }: Props = $props();

  let cropArea: CropArea = $state({ x: 0, y: 0, width: 0, height: 0 });
  let isPending = $state(false);
  let zoom = $state(1);
  let input: HTMLInputElement;

  let imageUrl = $state<string>();
  $effect(() => {
    if (!inputImage) {
      imageUrl = undefined;
      return;
    }

    const url = URL.createObjectURL(inputImage);
    imageUrl = url;

    return () => URL.revokeObjectURL(url);
  });

  onMount(async () => {
    await init();
  });

  async function oncropcomplete(event: OnCropCompleteEvent) {
    cropArea = event.pixels;
  }

  function close() {
    open = false;
  }

  async function saveAndClose() {
    if (!outputImage || isPending) return;
    isPending = true;
    let arr = await outputImage.bytes();
    try {
      let out = crop(arr, cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      console.log(out);
    } catch (e) {
      console.error("Failed to crop image");
    } finally {
      isPending = false;
    }
  }

  function imageChange(event: Event & { currentTarget: HTMLInputElement }) {
    const newImage = event.currentTarget.files?.[0];
    if (!newImage) return;
    outputImage = newImage;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    {#if imageUrl}
      <div class="relative aspect-video overflow-hidden rounded-xl">
        <Cropper image={imageUrl} bind:zoom aspect={aspectRatio} {oncropcomplete} />
      </div>
      <Slider bind:value={zoom} type="single" min={1} step={0.1} max={5} />
    {/if}
    <Dialog.Footer>
      <input
        type="file"
        class="hidden"
        accept="image/jpeg,image/png,image/bmp,image/gif"
        bind:this={input}
        onchange={imageChange}
      />
      <Button.Root variant="outline" disabled={isPending} class="me-auto" onclick={() => input.click()}>
        Upload Image
      </Button.Root>
      <Button.Root variant="ghost" onclick={close} disabled={isPending}>Cancel</Button.Root>
      <Button.Root onclick={saveAndClose} disabled={isPending}>
        {#if isPending}<SpinnerIcon class="animate-spin" />{/if}
        <span>Save</span>
      </Button.Root>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- TODO -->
<!-- DROP zone  -->
<!-- No input image drop zone area -->
