<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar";
  import type { RecentDocumentSelection } from "$lib/server/db/documents";
  import type { RecentPinnedThingSelection, RecentWorkspaceSelection } from "$lib/server/db/workspaces";

  import AppSidebarFooter from "./app-sidebar-footer.svelte";
  import AppSidebarHeader from "./app-sidebar-header.svelte";
  import AppSidebarPinnedItems from "./app-sidebar-pinned-items.svelte";
  import AppSidebarRecentDocuments from "./app-sidebar-recent-documents.svelte";
  import AppSidebarRecentWorkspaces from "./app-sidebar-recent-workspaces.svelte";

  type Props = {
    username: string;
    recentPinnedThings: Promise<RecentPinnedThingSelection[]>;
    recentWorkspaces: Promise<RecentWorkspaceSelection[]>;
    recentDocuments: Promise<RecentDocumentSelection[]>;
  };

  let { username, recentPinnedThings, recentWorkspaces, recentDocuments }: Props = $props();
</script>

<Sidebar.Root>
  <AppSidebarHeader />

  <Sidebar.Content class="gap-1 px-3 py-1">
    <AppSidebarPinnedItems {recentPinnedThings} />

    <Sidebar.Separator class="my-1" />

    <AppSidebarRecentWorkspaces {recentWorkspaces} />

    <Sidebar.Separator class="my-1" />

    <AppSidebarRecentDocuments {recentDocuments} />
  </Sidebar.Content>

  <AppSidebarFooter {username} />

  <Sidebar.Rail />
</Sidebar.Root>
