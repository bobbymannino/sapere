<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import type { RecentPinnedThingSelection } from "$db/workspaces";
  import * as Collapsible from "$lib/components/ui/collapsible";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { ChevronDownIcon, MarkdownIcon, PinIcon, WorkspaceIcon } from "$lib/icons";

  type Props = {
    recentPinnedThings: Promise<RecentPinnedThingSelection[]>;
  };

  let { recentPinnedThings }: Props = $props();

  function getPinnedHref(item: RecentPinnedThingSelection) {
    if (item.type === "workspace") return resolve("/(app)/workspaces/[slug]", { slug: item.workspaceSlug });
    if (item.type === "document" && item.documentSlug)
      return resolve("/(app)/workspaces/[slug]/documents/[docSlug]", {
        slug: item.workspaceSlug,
        docSlug: item.documentSlug,
      });
  }

  function isPinnedActive(item: RecentPinnedThingSelection) {
    if (item.type === "workspace") return page.url.pathname === `/workspaces/${item.workspaceSlug}`;
    return page.url.pathname === `/workspaces/${item.workspaceSlug}/documents/${item.documentSlug}`;
  }
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
          <PinIcon class="text-sidebar-foreground/60" />
          <span class="min-w-0 flex-1 truncate text-left">Pinned</span>
          <ChevronDownIcon
            class="text-sidebar-foreground/60 ms-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
          />
        </Collapsible.Trigger>
      {/snippet}
    </Sidebar.GroupLabel>

    <Collapsible.Content class="pt-0.5">
      <Sidebar.GroupContent>
        <Sidebar.MenuSub class="mt-1">
          {#await recentPinnedThings}
            {#each { length: 5 } as _, index (index)}
              <Sidebar.MenuSubItem>
                <Sidebar.MenuSkeleton class="h-7 px-3" />
              </Sidebar.MenuSubItem>
            {/each}
          {:then recentPinnedThings}
            {#each recentPinnedThings as item, index (`${item.type}-${item.id}`)}
              <Sidebar.MenuSubItem {index}>
                <Sidebar.MenuSubButton isActive={isPinnedActive(item)} href={getPinnedHref(item)}>
                  {#if item.type === "workspace"}
                    <WorkspaceIcon />
                  {:else if item.type === "document"}
                    <MarkdownIcon />
                  {/if}
                  <span>{item.title}</span>
                </Sidebar.MenuSubButton>
              </Sidebar.MenuSubItem>
            {:else}
              <Sidebar.MenuSubItem>
                <Sidebar.MenuSubButton aria-disabled="true" tabindex={-1}>
                  <span>No pinned items</span>
                </Sidebar.MenuSubButton>
              </Sidebar.MenuSubItem>
            {/each}
          {/await}
        </Sidebar.MenuSub>
      </Sidebar.GroupContent>
    </Collapsible.Content>
  </Sidebar.Group>
</Collapsible.Root>
