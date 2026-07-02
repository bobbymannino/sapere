<script lang="ts">
    import FieldDescription from "$lib/components/ui/field/field-description.svelte";
    import FieldLabel from "$lib/components/ui/field/field-label.svelte";
    import Field from "$lib/components/ui/field/field.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import { applyAction, enhance } from "$app/forms";
    import { resolve } from "$app/paths";
    import Alert from "$lib/components/ui/alert/alert.svelte";
    import { ErrorIcon, SpinnerIcon } from "$lib/icons";
    import AlertTitle from "$lib/components/ui/alert/alert-title.svelte";
    import { Button } from "$lib/components/ui/button";
    import { page } from "$app/state";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import Cropper, { type CropArea } from "svelte-easy-crop";
    import Slider from "$lib/components/ui/slider/slider.svelte";

    let pending = $state(false);
    let slug = $state("");
    let image: File | null = $state(null);
    let zoom = $state(1);
    let crop: CropArea = $state({ height: 0, width: 0, x: 0, y: 0 });

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

            // canvas.toBlob does not support avif encoding in most browsers
            const mimeType = file.type === "image/avif" ? "image/webp" : file.type;

            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (b) => (b ? resolve(b) : reject(new Error("Failed to encode cropped image"))),
                    mimeType,
                    0.9,
                );
            });

            return new File([blob], file.name, { type: mimeType });
        } finally {
            URL.revokeObjectURL(url);
        }
    }

    function slugify(value: string) {
        return value
            .toLocaleLowerCase()
            .replace(/\s/g, "_")
            .replace(/[^a-z0-9._-]/g, "");
    }
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

        if (image && crop.width > 0 && crop.height > 0) {
            const croppedFile = await cropImageFile(image, crop);
            formData.set("image", croppedFile, image.name);
        }

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
                <ErrorIcon />
                <AlertTitle>{error}</AlertTitle>
            </Alert>
        {/each}
    </Field>

    <Field>
        <FieldLabel for="image">Image</FieldLabel>
        <FieldDescription>An optional thumbnail for this workspace</FieldDescription>
        <Input
            aria-invalid={page.form?.valiErrors?.nested?.image?.length > 0}
            disabled={pending}
            type="file"
            id="image"
            name="image"
            accept="image/png, image/jpeg, image/avif, image/webp"
            onchange={(e) => (image = e.currentTarget.files?.[0] ?? null)}
        />
        {#if image}
            <div class="aspect-video relative">
                <Cropper
                    image={URL.createObjectURL(image)}
                    bind:zoom
                    aspect={16 / 9}
                    oncropcomplete={(e) => (crop = e.pixels)}
                />
            </div>
            <Slider bind:value={zoom} type="single" min={1} step={0.1} max={5} />
        {/if}
        {#each page.form?.valiErrors?.nested?.image as error (error)}
            <Alert variant="destructive">
                <ErrorIcon />
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
