<script lang="ts">
    import type { DocumentCardSelection } from "$lib/server/db/documents";
    import { MarkdownIcon, PinIcon, SpinnerIcon, UnpinIcon } from "$lib/icons";
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { toIsoDate, formatDateTime } from "$lib/date-format";
    import { resolve } from "$app/paths";
    import type { WorkspaceSelect } from "$lib/server/db/schema";
    import { setDocumentPinnedCommand } from "$lib/documents.remote";
    import { refreshAll } from "$app/navigation";

    type Props = DocumentCardSelection & { workspaceSlug: WorkspaceSelect["slug"] };

    let { content, slug, title, pinnedAt, updatedAt, workspaceSlug }: Props = $props();
    let pinning = $state(false);
    let pinError = $state<string | null>(null);
    let pinLabel = $derived(pinnedAt ? "Pinned" : "Pin");
    let pinActionLabel = $derived(pinnedAt ? `Unpin ${title}` : `Pin ${title}`);

    async function togglePinned() {
        if (pinning) return;

        pinning = true;
        pinError = null;

        try {
            await setDocumentPinnedCommand({
                workspaceSlug,
                documentSlug: slug,
                pinned: !pinnedAt,
            });
            await refreshAll({ includeLoadFunctions: true });
        } catch (error) {
            pinError = error instanceof Error ? error.message : "Failed to update pin";
        } finally {
            pinning = false;
        }
    }
</script>

<Card.Root
    class="group/card h-full relative hover:scale-101 motion-safe:hover:transition-transform hover:shadow-lg focus-within:ring-3 focus-within:border-ring focus-within:ring-ring/30"
>
    <a
        href={resolve("/(app)/workspaces/[slug]/documents/[docSlug]", { slug: workspaceSlug, docSlug: slug })}
        class="absolute inset-0 rounded-inherit z-10"
    >
        <span class="sr-only">Open {title} document</span>
    </a>

    <Card.Header>
        <div class="flex min-w-0 items-start gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                <MarkdownIcon />
            </div>
            <div class="min-w-0">
                <Card.Title class="truncate text-base">{title}</Card.Title>
                <Card.Description class="truncate">{slug}.md</Card.Description>
            </div>
        </div>
    </Card.Header>

    <Card.Content>
        {#if content.trim()}
            <Card.Description class="line-clamp-4 wrap-break-words whitespace-pre-line">
                {content}{content.length >= 50 ? "..." : ""}
            </Card.Description>
        {:else}
            <Card.Description>Empty markdown file</Card.Description>
        {/if}
    </Card.Content>

    <Card.Footer class="mt-auto flex items-center justify-between gap-3">
        <div class="min-w-0">
            <Card.Description class="text-xs">
                Updated <time datetime={toIsoDate(updatedAt)}>{formatDateTime(updatedAt)}</time>
            </Card.Description>
            {#if pinError}
                <Card.Description class="text-destructive text-xs" aria-live="polite">{pinError}</Card.Description>
            {/if}
        </div>

        <Button
            class="relative z-20"
            variant={pinnedAt ? "secondary" : "ghost"}
            size="sm"
            aria-label={pinActionLabel}
            aria-pressed={Boolean(pinnedAt)}
            disabled={pinning}
            onclick={togglePinned}
        >
            {#if pinning}
                <SpinnerIcon class="size-3 animate-spin" />
            {:else if pinnedAt}
                <UnpinIcon class="size-3" />
            {:else}
                <PinIcon class="size-3" />
            {/if}
            <span>{pinLabel}</span>
        </Button>
    </Card.Footer>
</Card.Root>
