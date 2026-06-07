<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import { ConflictApiError, UnprocessableEntityApiError } from "$lib/api/errors";
  import Alert from "$lib/components/alert.svelte";
  import Button from "$lib/components/button.svelte";
  import InputField from "$lib/components/input-field.svelte";
  import TextareaField from "$lib/components/textarea-field.svelte";

  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();

  let pending = $state(false);

  function slugify(value: string) {
    return value.toLowerCase().replace(/[^0-9a-z-]/g, "-");
  }

  let slug = $state("");
</script>

<div class="flex-center min-h-svh p-6">
  <form
    method="post"
    use:enhance={() => {
      if (pending) return;
      pending = true;
      return async ({ update }) => {
        await update();
        pending = false;
      };
    }}
    class="card max-w-md"
  >
    <h1>New workspace</h1>

    <InputField
      id="title"
      required
      name="title"
      type="text"
      label="Title"
      oninput={(e) => (slug = slugify(e.currentTarget.value))}
      defaultValue={form?.title}
      placeholder="Sapere"
      error={form?.error}
    />

    <InputField
      id="slug"
      required
      name="slug"
      type="text"
      label="Slug"
      bind:value={() => slug, (v) => (slug = slugify(v))}
      defaultValue={form?.slug}
      placeholder="sapere"
      error={form?.error}
    />

    <TextareaField
      id="description"
      name="description"
      label="Description"
      defaultValue={form?.description}
      placeholder="(optional)"
      error={form?.error}
    />

    {#if form?.error instanceof UnprocessableEntityApiError}
      {#each form.error.rootErrors as error}
        <Alert type="error">{error}</Alert>
      {/each}
    {/if}

    {#if form?.error instanceof ConflictApiError}
      <Alert type="error">{form.error.message}</Alert>
    {/if}

    <div class="grid grid-cols-2 gap-3">
      <Button href={resolve("/")} variant="text" disabled={pending}>Cancel</Button>
      <Button type="submit" {pending} disabled={pending}>Create workspace</Button>
    </div>
  </form>
</div>
