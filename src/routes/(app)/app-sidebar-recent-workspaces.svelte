<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import type { RecentWorkspaceSelection } from "$db/workspaces";
  import * as Collapsible from "$lib/components/ui/collapsible";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { WorkspaceIcon, ChevronDownIcon } from "$lib/icons";

  import AppSidebarRecentWorkspace from "./app-sidebar-recent-workspace.svelte";

  type Props = {
    recentWorkspaces: Promise<RecentWorkspaceSelection[]>;
  };

  let { recentWorkspaces }: Props = $props();
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
          <WorkspaceIcon class="text-sidebar-foreground/60" />
          <span class="min-w-0 flex-1 truncate text-left">Workspaces</span>
          <ChevronDownIcon
            class="text-sidebar-foreground/60 ms-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
          />
        </Collapsible.Trigger>
      {/snippet}
    </Sidebar.GroupLabel>

    <Collapsible.Content class="pt-0.5">
      <Sidebar.GroupContent>
        <Sidebar.MenuSub class="mt-1">
          {#await recentWorkspaces}
            {#each { length: 4 } as _, index (index)}
              <Sidebar.MenuSubItem>
                <Sidebar.MenuSkeleton class="h-7 px-3" />
              </Sidebar.MenuSubItem>
            {/each}
          {:then recentWorkspaces}
            {#each recentWorkspaces as w, index (w.id)}
              <AppSidebarRecentWorkspace {...w} {index} />
            {/each}
          {/await}
          <Sidebar.MenuSubItem>
            <Sidebar.MenuSubButton isActive={page.url.pathname === "/workspaces"} href={resolve("/(app)/workspaces")}>
              <span>All workspaces</span>
            </Sidebar.MenuSubButton>
          </Sidebar.MenuSubItem>
        </Sidebar.MenuSub>
      </Sidebar.GroupContent>
    </Collapsible.Content>
  </Sidebar.Group>
</Collapsible.Root>
