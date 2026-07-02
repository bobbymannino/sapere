<script lang="ts">
    import type { DocumentCardSelection } from "$lib/server/db/documents";
    import { MarkdownIcon } from "$lib/icons";
    import * as Card from "$lib/components/ui/card";
    import { toIsoDate, formatDateTime } from "$lib/date-format";
    import { resolve } from "$app/paths";
    import type { WorkspaceSelect } from "$lib/server/db/schema";

    type Props = DocumentCardSelection & { workspaceSlug: WorkspaceSelect["slug"] };

    let { content, slug, title, updatedAt, workspaceSlug }: Props = $props();
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
            <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
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

    <Card.Footer class="mt-auto">
        <Card.Description class="text-xs">
            Updated <time datetime={toIsoDate(updatedAt)}>{formatDateTime(updatedAt)}</time>
        </Card.Description>
    </Card.Footer>
</Card.Root>
