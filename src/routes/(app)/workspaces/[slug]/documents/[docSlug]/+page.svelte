<script lang="ts">
  import { browser } from "$app/env";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import DocumentPinButton from "$lib/components/document-pin-button.svelte";
  import Meta from "$lib/components/meta.svelte";
  import * as Button from "$lib/components/ui/button";
  import * as Kbd from "$lib/components/ui/kbd";
  import * as Textarea from "$lib/components/ui/textarea";
  import { saveDocumentContentCommand } from "$lib/documents.remote";
  import { MarkdownIcon, SpinnerIcon } from "$lib/icons";
  import { isTextFieldTarget, isUnmodifiedKey } from "$lib/utils";
  import dompurify from "dompurify";
  import { marked } from "marked";
  import { onDestroy } from "svelte";

  import type { PageProps } from "./$types";

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
  let pinError = $state<string | null>(null);
  let exportLink: Nullable<HTMLElement> = $state(null);
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
      const result = await saveDocumentContentCommand({
        documentId: data.document.id,
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

  function onkeydown(e: KeyboardEvent) {
    // Checked before the text field guard so export still works from the editor.
    const exportModifier = data.isMac ? e.metaKey : e.ctrlKey;
    if (exportModifier && e.key.toLocaleLowerCase() === "e") {
      e.preventDefault();
      exportLink?.click();
      return;
    }

    if (e.defaultPrevented || isTextFieldTarget(e.target)) return;
    if (isUnmodifiedKey(e, "e")) {
      e.preventDefault();
      goto(
        resolve("/(app)/workspaces/[slug]/documents/[docSlug]/edit", {
          slug: data.workspace.slug,
          docSlug: data.document.slug,
        }),
      );
    }
  }
</script>

<svelte:window {onkeydown} />

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
    {#if pinError}
      <span class="text-destructive text-sm" aria-live="polite">{pinError}</span>
    {/if}
    <div class="ms-auto flex items-center gap-1">
      <DocumentPinButton
        documentId={data.document.id}
        documentTitle={data.document.title}
        pinnedAt={data.document.pinnedAt}
        keyboardShortcut="p"
        bind:error={pinError}
        outline
      />
      <Button.Root
        variant="outline"
        download="{data.document.slug}.md"
        bind:ref={exportLink}
        aria-keyshortcuts="Meta+E Control+E"
        href={resolve("/(app)/workspaces/[slug]/documents/[docSlug]/export", {
          slug: data.workspace.slug,
          docSlug: data.document.slug,
        })}
      >
        <MarkdownIcon />
        <span>Export</span>
        <Kbd.Group class="can-hover:flex hidden">
          <Kbd.Root>{data.isMac ? "⌘" : "Ctrl"}</Kbd.Root>
          <Kbd.Root>E</Kbd.Root>
        </Kbd.Group>
      </Button.Root>
      <Button.Root
        variant="outline"
        href={resolve("/(app)/workspaces/[slug]/documents/[docSlug]/edit", {
          slug: data.workspace.slug,
          docSlug: data.document.slug,
        })}
      >
        <span>Edit</span>
        <Kbd.Root class="can-hover:flex hidden">E</Kbd.Root>
      </Button.Root>
    </div>
  </header>

  <div class={["grid gap-5 p-5", showPreview && showEditor && "@3xl:grid-cols-2"]}>
    {#if showEditor}
      <section>
        <Textarea.Root bind:value={md} autofocus {oninput} aria-label="Document content" class="font-mono" />
      </section>
    {/if}

    {#if showPreview}
      <section class="@container/preview flex justify-center">
        <div class="@3xl/preview:prose-lg prose w-full rounded-2xl border p-5">
          {#if browser}
            {@html previewHtml}
          {:else}
            <p>
              <SpinnerIcon class="inline-block size-5 animate-spin" />
              Loading preview...
            </p>
          {/if}
        </div>
      </section>
    {/if}
  </div>
</div>
