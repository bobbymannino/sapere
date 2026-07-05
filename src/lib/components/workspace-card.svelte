<script lang="ts">
    import { resolve } from "$app/paths";
    import * as Card from "$lib/components/ui/card";
    import OptimizedImage from "$lib/components/optimized-image.svelte";
    import { formatShortDateTime, toIsoDate } from "$lib/date-format";
    import { ClockIcon, PictureIcon } from "$lib/icons";
    import type { WorkspaceCardSelection } from "$lib/server/db/workspaces";
    import WorkspaceCardOptions from "./workspace-card-options.svelte";

    type Props = WorkspaceCardSelection & {
        onEdit?: (workspace: WorkspaceCardSelection) => void;
    };

    let workspace: Props = $props();
    let formattedUpdatedAt = $derived(formatShortDateTime(workspace.updatedAt));
    let updatedAtIso = $derived(toIsoDate(workspace.updatedAt));
    let imageUrl = $derived(
        `${resolve("/(app)/workspaces/[slug]/image", { slug: workspace.slug })}?v=${workspace.updatedAt.getTime()}`,
    );
</script>

<Card.Root
    class="group/card h-full relative pt-0 hover:scale-101 motion-safe:hover:transition-transform hover:shadow-lg focus-within:ring-3 focus-within:border-ring focus-within:ring-ring/30"
>
    <a
        href={resolve("/(app)/workspaces/[slug]", { slug: workspace.slug })}
        class="absolute inset-0 rounded-inherit z-10"
    >
        <span class="sr-only">Open {workspace.title} workspace</span>
    </a>

    {#if workspace.image}
        <OptimizedImage src={imageUrl} alt="{workspace.title} thumbnail" class="aspect-video w-full" />
    {:else}
        <div class="bg-muted aspect-video flex-center">
            <PictureIcon class="text-muted-foreground" />
        </div>
    {/if}

    <Card.Header>
        <Card.Title>{workspace.title}</Card.Title>
    </Card.Header>

    {#if workspace.description}
        <Card.Content>
            <Card.Description class="line-clamp-2 whitespace-pre-line">
                {workspace.description}
            </Card.Description>
        </Card.Content>
    {/if}

    <Card.Footer class="flex items-center justify-between mbs-auto">
        <Card.Description class="text-xs flex items-center gap-1">
            <ClockIcon class="size-3" />
            <time datetime={updatedAtIso}>{formattedUpdatedAt}</time>
        </Card.Description>

        <WorkspaceCardOptions {...workspace} />
    </Card.Footer>
</Card.Root>
