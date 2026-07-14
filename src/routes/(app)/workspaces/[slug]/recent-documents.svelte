<script lang="ts">
  import { resolve } from "$app/paths";
  import type { DocumentCardSelection } from "$db/documents";
  import * as Button from "$lib/components/ui/button";
  import * as Skeleton from "$lib/components/ui/skeleton";
  import { formatShortDateTime, toIsoDate } from "$lib/date-format";
  import { MarkdownIcon, PinIcon } from "$lib/icons";
  import type { WorkspaceSelect } from "$lib/server/db/schema";

  type Props = {
    documentsPromise: Promise<{ results: DocumentCardSelection[] }>;
    workspaceSlug: WorkspaceSelect["slug"];
  };

  let { documentsPromise, workspaceSlug }: Props = $props();
</script>

<div class="max-w-lg space-y-2 p-5">
  <h2>Recent Documents</h2>
  {#await documentsPromise}
    {#each { length: 6 }}
      <div class="flex items-center gap-2">
        <Skeleton.Root class="size-8 rounded-full" />
        <Skeleton.Root class="h-6 w-(--w)" style="--w: {Math.random() * 50 + 40}%" />
      </div>
    {/each}
  {:then documents}
    {#if documents.results.length === 0}
      <p>No documents in this workspace</p>
      <Button.Root
        class="w-full"
        variant="outline"
        href={resolve("/(app)/workspaces/[slug]/documents/new", { slug: workspaceSlug })}>New Document</Button.Root
      >
    {:else}
      <ul class="space-y-2">
        {#each documents.results as doc (doc.id)}
          <li>
            <Button.Root
              href={resolve("/(app)/workspaces/[slug]/documents/[docSlug]", {
                slug: workspaceSlug,
                docSlug: doc.slug,
              })}
              variant="outline"
              class="w-full justify-start"
            >
              {#if doc.pinnedAt}
                <PinIcon class="size-5" />
              {:else}
                <MarkdownIcon class="size-5" />
              {/if}
              <span class="truncate">{doc.title}</span>
              <time datetime={toIsoDate(doc.updatedAt)} class="text-muted-foreground ms-auto text-xs">
                {formatShortDateTime(doc.updatedAt)}
              </time>
            </Button.Root>
          </li>
        {/each}
      </ul>
    {/if}
  {/await}
</div>
