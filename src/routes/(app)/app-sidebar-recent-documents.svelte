<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import type { RecentDocumentSelection } from "$db/documents";
  import * as Collapsible from "$lib/components/ui/collapsible";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { ChevronDownIcon, MarkdownIcon } from "$lib/icons";

  type Props = { recentDocuments: Promise<RecentDocumentSelection[]> };

  let { recentDocuments }: Props = $props();
</script>

<Collapsible.Root open class="group/collapsible">
  <Sidebar.Group class="gap-1 p-0 py-1">
    <Sidebar.GroupLabel class="px-2">
      {#snippet child({ props })}
        <Collapsible.Trigger
          {...props}
          class={[
            props.class,
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full cursor-pointer gap-2",
          ]}
        >
          <MarkdownIcon class="text-sidebar-foreground/60" />
          <span class="min-w-0 flex-1 truncate text-left">Documents</span>
          <ChevronDownIcon
            class="text-sidebar-foreground/60 ms-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
          />
        </Collapsible.Trigger>
      {/snippet}
    </Sidebar.GroupLabel>

    <Collapsible.Content class="pt-0.5">
      <Sidebar.GroupContent>
        <Sidebar.MenuSub class="mt-1">
          {#await recentDocuments}
            {#each { length: 4 } as _, index (index)}
              <Sidebar.MenuSubItem>
                <Sidebar.MenuSkeleton class="h-7 px-3" />
              </Sidebar.MenuSubItem>
            {/each}
          {:then recentDocuments}
            {#each recentDocuments as document (document.id)}
              <Sidebar.MenuSubItem>
                <Sidebar.MenuSubButton
                  isActive={page.url.pathname === `/workspaces/${document.workspaceSlug}/documents/${document.slug}`}
                  href={resolve("/(app)/workspaces/[slug]/documents/[docSlug]", {
                    slug: document.workspaceSlug,
                    docSlug: document.slug,
                  })}
                >
                  <span>{document.title}</span>
                </Sidebar.MenuSubButton>
              </Sidebar.MenuSubItem>
            {:else}
              <Sidebar.MenuSubItem>
                <Sidebar.MenuSubButton aria-disabled="true" tabindex={-1}>
                  <span>No documents</span>
                </Sidebar.MenuSubButton>
              </Sidebar.MenuSubItem>
            {/each}
          {/await}
        </Sidebar.MenuSub>
      </Sidebar.GroupContent>
    </Collapsible.Content>
  </Sidebar.Group>
</Collapsible.Root>
