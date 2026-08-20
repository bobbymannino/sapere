<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import ImageEditor from "$lib/components/image-editor.svelte";
  import AlertTitle from "$lib/components/ui/alert/alert-title.svelte";
  import Alert from "$lib/components/ui/alert/alert.svelte";
  import { Button } from "$lib/components/ui/button";
  import FieldDescription from "$lib/components/ui/field/field-description.svelte";
  import FieldLabel from "$lib/components/ui/field/field-label.svelte";
  import Field from "$lib/components/ui/field/field.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import { CircleErrorIcon, SpinnerIcon } from "$lib/icons";
  import { slugify } from "$lib/utils";

  let pending = $state(false);
  let slug = $state("");
  /** Already cropped by the image editor, so it can be submitted as-is. */
  let image: File | null = $state(null);
  let imageEditorOpen = $state(false);

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
      await applyAction(result);
      pending = false;
    };
  }}
  method="post"
>
  <Field>
    <FieldLabel for="title">Title</FieldLabel>
    <Input
      aria-invalid={page.form?.valiErrors?.nested?.title?.length > 0}
      disabled={pending}
      placeholder="Origin"
      id="title"
      name="title"
      required
      autocapitalize="words"
      autofocus
      oninput={(e) => (slug = slugify(e.currentTarget.value))}
    />
    {#each page.form?.valiErrors?.nested?.title as error (error)}
      <Alert variant="destructive">
        <CircleErrorIcon />
        <AlertTitle>{error}</AlertTitle>
      </Alert>
    {/each}
  </Field>

  <Field>
    <FieldLabel for="slug">Slug</FieldLabel>
    <FieldDescription>A unique slug for your workspace</FieldDescription>
    <Input
      aria-invalid={page.form?.valiErrors?.nested?.slug?.length > 0}
      disabled={pending}
      placeholder="origin"
      id="slug"
      name="slug"
      required
      bind:value={() => slug, (v) => (slug = slugify(v))}
    />
    {#each page.form?.valiErrors?.nested?.slug as error (error)}
      <Alert variant="destructive">
        <CircleErrorIcon />
        <AlertTitle>{error}</AlertTitle>
      </Alert>
    {/each}
  </Field>

  <Field>
    <FieldLabel for="description">Description</FieldLabel>
    <FieldDescription>Optional context about this workspace</FieldDescription>
    <Textarea
      aria-invalid={page.form?.valiErrors?.nested?.description?.length > 0}
      disabled={pending}
      placeholder="A place for product research and planning"
      id="description"
      name="description"
      maxlength={1000}
    />
    {#each page.form?.valiErrors?.nested?.description as error (error)}
      <Alert variant="destructive">
        <CircleErrorIcon />
        <AlertTitle>{error}</AlertTitle>
      </Alert>
    {/each}
  </Field>

  <Field>
    <FieldLabel>Image</FieldLabel>
    <FieldDescription>An optional thumbnail for this workspace</FieldDescription>
    {#if imageUrl}
      <img src={imageUrl} alt="" class="aspect-video w-full rounded-3xl object-cover" />
    {/if}

    <div class="flex gap-2">
      <Button type="button" variant="outline" disabled={pending} onclick={() => (imageEditorOpen = true)}>
        {image ? "Change image" : "Choose image"}
      </Button>
      {#if image}
        <Button type="button" variant="ghost" disabled={pending} onclick={() => (image = null)}>Remove image</Button>
      {/if}
    </div>

    <ImageEditor bind:open={imageEditorOpen} inputImage={image ?? undefined} onSave={(cropped) => (image = cropped)} />
    {#each page.form?.valiErrors?.nested?.image as error (error)}
      <Alert variant="destructive">
        <CircleErrorIcon />
        <AlertTitle>{error}</AlertTitle>
      </Alert>
    {/each}
  </Field>

  <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
    <Button variant="ghost" href={resolve("/(app)/workspaces")} aria-disabled={pending}>Cancel</Button>
    <Button type="submit" disabled={pending}>
      {#if pending}<SpinnerIcon class="animate-spin" />{/if}
      Create
    </Button>
  </div>
</form>
