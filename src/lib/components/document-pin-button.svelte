<script lang="ts">
    import { refreshAll } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";
    import { setDocumentPinnedCommand } from "$lib/documents.remote";
    import { PinIcon, SpinnerIcon, UnpinIcon } from "$lib/icons";
    import type { DocumentCardSelection } from "$lib/server/db/documents";
    import type { WorkspaceSelect } from "$lib/server/db/schema";
    import { cn } from "$lib/utils";

    type Props = {
        workspaceSlug: WorkspaceSelect["slug"];
        documentSlug: DocumentCardSelection["slug"];
        documentTitle: DocumentCardSelection["title"];
        pinnedAt: DocumentCardSelection["pinnedAt"];
        class?: string | null;
        error?: string | null;
        hideLabel?: boolean;
    };

    let {
        workspaceSlug,
        documentSlug,
        documentTitle,
        pinnedAt,
        class: className,
        error = $bindable(null),
        hideLabel = false,
    }: Props = $props();

    let pinning = $state(false);
    let pinned = $derived(Boolean(pinnedAt));
    let pinLabel = $derived(pinned ? "Pinned" : "Pin");
    let pinActionLabel = $derived(pinned ? `Unpin ${documentTitle}` : `Pin ${documentTitle}`);

    async function togglePinned() {
        if (pinning) return;

        pinning = true;
        error = null;

        try {
            await setDocumentPinnedCommand({
                workspaceSlug,
                documentSlug,
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

{#if hideLabel}
    <Button
        class={cn("relative z-20", className)}
        variant={pinned ? "secondary" : "ghost"}
        size="icon-sm"
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
    </Button>
{:else}
    <Button
        class={cn("relative z-20", className)}
        variant={pinned ? "secondary" : "ghost"}
        size="sm"
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
        <span>{pinLabel}</span>
    </Button>
{/if}
