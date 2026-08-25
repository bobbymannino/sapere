<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button";
  import * as Field from "$lib/components/ui/field";
  import { Input } from "$lib/components/ui/input";
  import { SpinnerIcon } from "$lib/icons";
  import type { WorkspaceCardSelection } from "$lib/server/db/workspaces";
  import { slugify } from "$lib/utils";

  type FieldName = "title" | "slug";
  type Props = {
    workspace: WorkspaceCardSelection;
    title?: string | null;
  };

  let { workspace, title }: Props = $props();
  let pending = $state(false);
  let slug = $derived(title ? slugify(title) : "");

  function fieldErrors(field: FieldName) {
    return page.form?.valiErrors?.nested?.[field] ?? [];
  }

  function fieldInvalid(field: FieldName) {
    return fieldErrors(field).length > 0 ? "true" : undefined;
  }
</script>

<form
  class="flex flex-col gap-5"
  use:enhance={({ cancel }) => {
    if (pending) {
      cancel();
      return;
    }

    pending = true;

    return async ({ result }) => {
      try {
        await applyAction(result);
      } finally {
        pending = false;
      }
    };
  }}
  method="post"
>
  <Field.FieldGroup>
    <Field.Field data-invalid={fieldInvalid("title")}>
      <Field.FieldLabel for="title">Title</Field.FieldLabel>
      <Input
        aria-invalid={fieldErrors("title").length > 0}
        disabled={pending}
        placeholder="Research notes"
        id="title"
        name="title"
        required
        autocapitalize="words"
        autofocus
        bind:value={title}
        oninput={(event) => (slug = slugify(event.currentTarget.value))}
      />
      {#each fieldErrors("title") as error (error)}
        <Field.FieldError>{error}</Field.FieldError>
      {/each}
    </Field.Field>

    <Field.Field data-invalid={fieldInvalid("slug")}>
      <Field.FieldLabel for="slug">Slug</Field.FieldLabel>
      <Field.FieldDescription>A unique slug for this document</Field.FieldDescription>
      <Input
        aria-invalid={fieldErrors("slug").length > 0}
        disabled={pending}
        placeholder="research_notes"
        id="slug"
        name="slug"
        required
        autocapitalize="none"
        bind:value={() => slug, (value) => (slug = slugify(value))}
      />
      {#each fieldErrors("slug") as error (error)}
        <Field.FieldError>{error}</Field.FieldError>
      {/each}
    </Field.Field>
  </Field.FieldGroup>

  <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
    <Button
      variant="ghost"
      href={resolve("/(app)/workspaces/[slug]/documents", { slug: workspace.slug })}
      aria-disabled={pending}
    >
      Cancel
    </Button>
    <Button type="submit" disabled={pending}>
      {#if pending}<SpinnerIcon data-icon="inline-start" class="animate-spin" />{/if}
      Create document
    </Button>
  </div>
</form>
