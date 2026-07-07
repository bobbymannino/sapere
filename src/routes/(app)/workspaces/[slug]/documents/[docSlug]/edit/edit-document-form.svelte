<script lang="ts">
    import { applyAction, enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { page } from "$app/state";
    import { Button } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Separator from "$lib/components/ui/separator";
    import * as Field from "$lib/components/ui/field";
    import { Input } from "$lib/components/ui/input";
    import { SpinnerIcon, TrashIcon } from "$lib/icons";
    import type { DocumentSelection } from "$lib/server/db/documents";
    import type { WorkspaceCardSelection } from "$lib/server/db/workspaces";
    import { slugify } from "$lib/utils";
    import { deleteDocumentCommand } from "$lib/documents.remote";

    type FieldName = "title" | "slug";
    type Props = {
        workspace: WorkspaceCardSelection;
        document: DocumentSelection;
    };

    let { workspace, document }: Props = $props();
    let pending = $state(false);
    let deleteDialogOpen = $state(false);
    let deleteError = $state(null as string | null);
    let deleting = $derived(deleteDocumentCommand.pending > 0);
    let title = $derived(document.title);
    let slug = $derived(document.slug);

    function fieldErrors(field: FieldName) {
        return page.form?.valiErrors?.nested?.[field] ?? [];
    }

    function fieldInvalid(field: FieldName) {
        return fieldErrors(field).length > 0 ? "true" : undefined;
    }

    function openDeleteDialog() {
        deleteError = null;
        deleteDialogOpen = true;
    }

    async function confirmDelete() {
        deleteError = null;

        try {
            await deleteDocumentCommand({
                workspaceSlug: workspace.slug,
                documentSlug: document.slug,
            });
            deleteDialogOpen = false;
            await goto(resolve("/(app)/workspaces/[slug]/documents", { slug: workspace.slug }));
        } catch (error) {
            deleteError = error instanceof Error ? error.message : "Failed to delete document";
        }
    }
</script>

<div class="flex flex-col gap-6">
    <form
        action="?/update"
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
                    disabled={pending || deleting}
                    placeholder="Research notes"
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
                <Field.FieldDescription>A unique slug for this document</Field.FieldDescription>
                <Input
                    aria-invalid={fieldErrors("slug").length > 0}
                    disabled={pending || deleting}
                    placeholder="research_notes"
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
        </Field.FieldGroup>

        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
                variant="ghost"
                href={resolve("/(app)/workspaces/[slug]/documents/[docSlug]", {
                    slug: workspace.slug,
                    docSlug: document.slug,
                })}
                aria-disabled={pending || deleting}
            >
                Cancel
            </Button>
            <Button type="submit" disabled={pending || deleting}>
                {#if pending}<SpinnerIcon data-icon="inline-start" class="animate-spin" />{/if}
                Save changes
            </Button>
        </div>
    </form>

    <Separator.Root />

    <div class="flex flex-col gap-3 items-center">
        <small class="text-muted-foreground text-center">
            This permanently removes the document from the workspace.
        </small>
        <Button type="button" variant="destructive" disabled={pending || deleting} onclick={openDeleteDialog}>
            <TrashIcon data-icon="inline-start" />
            Delete document
        </Button>
    </div>
</div>

<Dialog.Root bind:open={deleteDialogOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Delete document</Dialog.Title>
            <Dialog.Description>This action cannot be undone.</Dialog.Description>
        </Dialog.Header>

        {#if deleteError}
            <p class="text-sm text-destructive">{deleteError}</p>
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
                Delete document
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
