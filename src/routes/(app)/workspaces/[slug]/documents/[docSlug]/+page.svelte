<script lang="ts">
    import { browser } from "$app/env";
    import Meta from "$lib/components/meta.svelte";
    import * as Button from "$lib/components/ui/button";
    import * as Textarea from "$lib/components/ui/textarea";
    import dompurify from "dompurify";
    import { marked } from "marked";
    import { onDestroy } from "svelte";
    import type { PageProps } from "./$types";
    import { saveDocumentContent } from "./document.remote";
    import { SpinnerIcon } from "$lib/icons";

    type SaveState = "saved" | "dirty" | "saving" | "error";

    const saveDebounceMs = 800;

    let { data }: PageProps = $props();

    let showPreview = $state(true);
    let showEditor = $state(true);
    let md = $derived(data.document.content);
    let lastSavedContent = $derived(data.document.content);
    let saveState = $state<SaveState>("saved");
    let saveError = $state("");
    let saveTimer: ReturnType<typeof setTimeout> | null = null;
    let saveInFlight = false;
    let saveQueued = false;
    let destroyed = false;

    function togglePreview() {
        if (showPreview) showEditor = true;
        showPreview = !showPreview;
    }

    function toggleEditor() {
        if (showEditor) showPreview = true;
        showEditor = !showEditor;
    }

    let sanitizedMarkdown = $derived(
        browser ? dompurify.sanitize(md, { ALLOWED_TAGS: ["div", "img", "p", "a"], ALLOWED_ATTR: [] }) : md,
    );
    let previewHtml = $derived(
        browser && showPreview ? dompurify.sanitize(marked.parse(sanitizedMarkdown, { async: false })) : "",
    );
    let saveLabel = $derived.by(() => {
        if (saveState === "saving") return "Saving...";
        if (saveState === "dirty") return "Unsaved changes";
        if (saveState === "error") return saveError || "Save failed";
        return "Saved";
    });
    let saveLabelClass = $derived(["text-sm", saveState === "error" ? "text-destructive" : "text-muted-foreground"]);

    function scheduleSave(delay = saveDebounceMs) {
        if (!browser) return;
        if (saveTimer) clearTimeout(saveTimer);

        if (md === lastSavedContent) {
            saveState = "saved";
            saveError = "";
            return;
        }

        saveState = "dirty";
        saveTimer = setTimeout(() => {
            saveTimer = null;
            void saveContent();
        }, delay);
    }

    function oninput() {
        saveError = "";
        scheduleSave();
    }

    async function saveContent() {
        if (saveInFlight) {
            saveQueued = true;
            return;
        }
        if (md === lastSavedContent) {
            saveState = "saved";
            return;
        }

        const rawContentAtSave = md;
        const contentAtSave = sanitizedMarkdown;
        if (contentAtSave === lastSavedContent) {
            md = contentAtSave;
            saveState = "saved";
            return;
        }

        saveInFlight = true;
        saveState = "saving";
        saveError = "";

        try {
            const result = await saveDocumentContent({
                workspaceSlug: data.workspace.slug,
                documentSlug: data.document.slug,
                content: contentAtSave,
            });

            lastSavedContent = result.content;

            if (md === rawContentAtSave) {
                md = result.content;
                saveState = "saved";
            }
        } catch (error) {
            if (md === rawContentAtSave) {
                saveError = error instanceof Error ? error.message : "Save failed";
                saveState = "error";
            }
        } finally {
            saveInFlight = false;
            const needsNextSave = saveQueued || md !== rawContentAtSave;
            saveQueued = false;
            if (!destroyed && needsNextSave) scheduleSave(0);
        }
    }

    onDestroy(() => {
        destroyed = true;
        if (saveTimer) clearTimeout(saveTimer);
    });
</script>

<Meta
    title={data.document.title}
    description={`View ${data.document.title} in ${data.workspace.title}.`}
    tags={["documents", data.workspace.slug, data.document.slug]}
    robots="noindex,nofollow"
/>

<div class="@container">
    <header class="flex items-center gap-1 p-5 pbe-0">
        <Button.Root onclick={toggleEditor}>
            {showEditor ? "Hide" : "Show"} Editor
        </Button.Root>
        <Button.Root onclick={togglePreview}>
            {showPreview ? "Hide" : "Show"} Preview
        </Button.Root>
        <span class={saveLabelClass} aria-live="polite">{saveLabel}</span>
    </header>

    <div class={["grid gap-5 p-5", showPreview && showEditor && "@3xl:grid-cols-2"]}>
        {#if showEditor}
            <section>
                <Textarea.Root bind:value={md} {oninput} aria-label="Document content" class="font-mono" />
            </section>
        {/if}

        {#if showPreview}
            <section class="@container/preview flex justify-center">
                <div class="@3xl/preview:prose-lg prose rounded-2xl border p-5 w-full">
                    {#if browser}
                        {@html previewHtml}
                    {:else}
                        <p>
                            <SpinnerIcon class="animate-spin size-5 inline-block" />
                            Loading preview...
                        </p>
                    {/if}
                </div>
            </section>
        {/if}
    </div>
</div>
