<script lang="ts">
    import FieldDescription from "$lib/components/ui/field/field-description.svelte";
    import FieldLabel from "$lib/components/ui/field/field-label.svelte";
    import Field from "$lib/components/ui/field/field.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import { applyAction, enhance } from "$app/forms";
    import { resolve } from "$app/paths";
    import Alert from "$lib/components/ui/alert/alert.svelte";
    import ErrorIcon from "$lib/icons/error-icon.svelte";
    import AlertTitle from "$lib/components/ui/alert/alert-title.svelte";
    import { Button } from "$lib/components/ui/button";
    import { page } from "$app/state";
    import SpinnerIcon from "$lib/icons/spinner-icon.svelte";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";

    let pending = $state(false);
    let slug = $state("");

    function slugify(value: string) {
        return value
            .toLocaleLowerCase()
            .replace(/\s/g, "_")
            .replace(/[^a-z0-9._-]/g, "");
    }
</script>

<form
    class="flex flex-col gap-5"
    use:enhance={() => {
        if (pending) return;
        pending = true;
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
            oninput={(e) => (slug = slugify(e.currentTarget.value))}
        />
        {#each page.form?.valiErrors?.nested?.title as error (error)}
            <Alert variant="destructive">
                <ErrorIcon />
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
                <ErrorIcon />
                <AlertTitle>{error}</AlertTitle>
            </Alert>
        {/each}
    </Field>

    <Field>
        <FieldLabel for="description">Description</FieldLabel>
        <FieldDescription>
            Optional context about this workspace
        </FieldDescription>
        <Textarea
            aria-invalid={page.form?.valiErrors?.nested?.description?.length >
                0}
            disabled={pending}
            placeholder="A place for product research and planning"
            id="description"
            name="description"
            maxlength={1000}
        />
        {#each page.form?.valiErrors?.nested?.description as error (error)}
            <Alert variant="destructive">
                <ErrorIcon />
                <AlertTitle>{error}</AlertTitle>
            </Alert>
        {/each}
    </Field>

    <Button type="submit" disabled={pending}>
        {#if pending}<SpinnerIcon class="animate-spin" />{/if}
        Create
    </Button>
    <Button variant="ghost" href={resolve("/(app)/workspaces")}>Cancel</Button>
</form>
