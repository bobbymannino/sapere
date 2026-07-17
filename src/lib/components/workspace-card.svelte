<script lang="ts">
  import { resolve } from "$app/paths";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import * as Card from "$lib/components/ui/card";
  import { formatShortDateTime, formatRelativeDate, toIsoDate } from "$lib/date-format";
  import { ClockIcon, PictureIcon, PinIcon } from "$lib/icons";
  import type { WorkspaceCardSelection } from "$lib/server/db/workspaces";

  import WorkspaceCardOptions from "./workspace-card-options.svelte";

  type Props = WorkspaceCardSelection & {
    onEdit?: (workspace: WorkspaceCardSelection) => void;
  };

  let workspace: Props = $props();
  let formattedUpdatedAt = $derived(formatRelativeDate(workspace.updatedAt));
  let absoluteUpdatedAt = $derived(formatShortDateTime(workspace.updatedAt));
  let updatedAtIso = $derived(toIsoDate(workspace.updatedAt));
  let imageUrl = $derived(
    `${resolve("/(app)/workspaces/[slug]/image", { slug: workspace.slug })}?v=${workspace.updatedAt.getTime()}`,
  );
</script>

<Card.Root
  class="group/card focus-within:border-ring focus-within:ring-ring/30 relative h-full pt-0 focus-within:ring-3 hover:scale-101 hover:shadow-lg motion-safe:hover:transition-transform"
>
  <a href={resolve("/(app)/workspaces/[slug]", { slug: workspace.slug })} class="rounded-inherit absolute inset-0 z-10">
    <span class="sr-only">Open {workspace.title} workspace</span>
  </a>

  <div class="relative">
    {#if workspace.image}
      <OptimizedImage src={imageUrl} alt="{workspace.title} thumbnail" class="aspect-video w-full" />
    {:else}
      <div class="bg-muted flex-center aspect-video">
        <PictureIcon class="text-muted-foreground" />
      </div>
    {/if}
    {#if workspace.pinnedAt}
      <PinIcon class="text-primary absolute inset-e-3 inset-bs-3 size-3" />
    {/if}
  </div>

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

  <Card.Footer class="mbs-auto flex items-center justify-between">
    <Card.Description class="flex items-center gap-1 text-xs">
      <ClockIcon class="size-3" />
      <time datetime={updatedAtIso} title={absoluteUpdatedAt}>{formattedUpdatedAt}</time>
    </Card.Description>

    <WorkspaceCardOptions {...workspace} />
  </Card.Footer>
</Card.Root>
