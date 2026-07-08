<script lang="ts">
    import { refreshAll } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";
    import * as Kbd from "$lib/components/ui/kbd";
    import { setDocumentPinnedCommand } from "$lib/documents.remote";
    import { PinIcon, SpinnerIcon, UnpinIcon } from "$lib/icons";
    import type { DocumentCardSelection } from "$lib/server/db/documents";
    import { cn, isTextFieldTarget, isUnmodifiedKey } from "$lib/utils";

    type Props = {
        documentId: DocumentCardSelection["id"];
        documentTitle: DocumentCardSelection["title"];
        pinnedAt: DocumentCardSelection["pinnedAt"];
        class?: string | null;
        error?: string | null;
        hideLabel?: boolean;
        outline?: boolean;
        keyboardShortcut?: string | null;
    };

    let {
        documentId,
        documentTitle,
        pinnedAt,
        class: className,
        error = $bindable(null),
        hideLabel = false,
        keyboardShortcut = null,
        outline = false,
    }: Props = $props();

    let pinning = $state(false);
    let pinned = $derived(Boolean(pinnedAt));
    let pinLabel = $derived(pinned ? "Unpin" : "Pin");
    let pinActionLabel = $derived(pinned ? `Unpin ${documentTitle}` : `Pin ${documentTitle}`);
    let visibleKeyboardShortcut = $derived(keyboardShortcut?.toLocaleUpperCase() ?? null);

    function onkeydown(e: KeyboardEvent) {
        if (!keyboardShortcut || e.defaultPrevented || e.repeat || isTextFieldTarget(e.target)) return;
        if (!isUnmodifiedKey(e, keyboardShortcut.toLocaleLowerCase())) return;

        e.preventDefault();
        void togglePinned();
    }

    async function togglePinned() {
        if (pinning) return;

        pinning = true;
        error = null;

        try {
            await setDocumentPinnedCommand({
                documentId,
                pinned: !pinned,
            });
            await refreshAll({ includeLoadFunctions: true });
        } catch (caught) {
            error = caught instanceof Error ? caught.message : "Failed to update pin";
        } finally {
            pinning = false;
        }
    }
</script>

<svelte:window {onkeydown} />

<Button
    class={cn("relative z-20", className)}
    variant={outline ? "outline" : pinned ? "secondary" : "ghost"}
    size={hideLabel ? "icon-sm" : "sm"}
    aria-label={pinActionLabel}
    aria-pressed={pinned}
    disabled={pinning}
    onclick={togglePinned}
>
    {#if pinning}
        <SpinnerIcon class="size-3 animate-spin" />
    {:else if pinned}
        <UnpinIcon class="size-3" />
    {:else}
        <PinIcon class="size-3" />
    {/if}
    {#if !hideLabel}
        <span>{pinLabel}</span>
    {/if}
    {#if visibleKeyboardShortcut}
        <Kbd.Root class="hidden can-hover:flex">{visibleKeyboardShortcut}</Kbd.Root>
    {/if}
</Button>
