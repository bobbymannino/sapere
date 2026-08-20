<script lang="ts">
  import { resolve } from "$app/paths";
  import DocumentPinButton from "$lib/components/document-pin-button.svelte";
  import * as Card from "$lib/components/ui/card";
  import { toIsoDate, formatShortDateTime, formatRelativeDate } from "$lib/date-format";
  import { ClockIcon, MarkdownIcon } from "$lib/icons";
  import type { DocumentCardSelection } from "$lib/server/db/documents";
  import type { WorkspaceSelect } from "$lib/server/db/schema";

  type Props = DocumentCardSelection & { workspaceSlug: WorkspaceSelect["slug"] };

  let { id, content, slug, title, pinnedAt, updatedAt, workspaceSlug }: Props = $props();
  let pinError = $state<string | null>(null);
</script>

<Card.Root
  class="group/card focus-within:border-ring focus-within:ring-ring/30 relative h-full focus-within:ring-3 hover:scale-101 hover:shadow-sm motion-safe:hover:transition-transform"
>
  <a
    href={resolve("/(app)/workspaces/[slug]/documents/[docSlug]", { slug: workspaceSlug, docSlug: slug })}
    class="rounded-inherit absolute inset-0 z-10"
  >
    <span class="sr-only">Open {title} document</span>
  </a>

  <Card.Header>
    <div class="flex min-w-0 items-start gap-3">
      <div class="bg-primary/15 text-primary flex size-10 shrink-0 items-center justify-center rounded-md">
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
      <Card.Description class="wrap-break-words line-clamp-4 whitespace-pre-line">
        {content}{content.length >= 50 ? "..." : ""}
      </Card.Description>
    {:else}
      <Card.Description>Empty markdown file</Card.Description>
    {/if}
  </Card.Content>

  <Card.Footer class="mt-auto flex items-center justify-between gap-3">
    <div class="min-w-0">
      <Card.Description class="flex items-center gap-1 text-xs">
        <ClockIcon class="size-3" />
        <time datetime={toIsoDate(updatedAt)} title={formatShortDateTime(updatedAt)}>
          {formatRelativeDate(updatedAt)}
        </time>
      </Card.Description>
      {#if pinError}
        <Card.Description class="text-destructive text-xs" aria-live="polite">{pinError}</Card.Description>
      {/if}
    </div>

    <DocumentPinButton
      documentId={id}
      documentTitle={title}
      {pinnedAt}
      bind:error={pinError}
      hideLabel
      class={pinnedAt
        ? null
        : "can-hover:opacity-0 can-hover:group-hover/card:opacity-100 can-hover:group-focus-within/card:opacity-100 can-hover:focus-visible:opacity-100"}
    />
  </Card.Footer>
</Card.Root>
