<script lang="ts">
  import { pushState } from "$app/navigation";
  import { resolve } from "$app/paths";
  import Empty from "$lib/components/empty.svelte";
  import Meta from "$lib/components/meta.svelte";
  import Pagination from "$lib/components/pagination.svelte";
  import { Button } from "$lib/components/ui/button";
  import WorkspaceCard from "$lib/components/workspace-card.svelte";
  import { WorkspaceIcon } from "$lib/icons";
  import type { WorkspaceCardSelection } from "$lib/server/db/workspaces";

  import type { PageProps } from "./$types";
  import EditWorkspaceDialog from "./edit-workspace-dialog.svelte";
  import Filters from "./filters.svelte";

  let { data }: PageProps = $props();
  let workspaces = $derived(data.workspaces);

  function openEditWorkspace(workspace: WorkspaceCardSelection) {
    const url = resolve("/(app)/workspaces/[slug]/edit", { slug: workspace.slug });
    pushState(url, { editWorkspace: workspace });
  }
</script>

<Meta
  title="Workspaces"
  description="View and manage your workspaces."
  tags={["workspaces", "projects"]}
  robots="noindex,nofollow"
/>

<div class="flex flex-col">
  {#if workspaces.results.length === 0}
    <Empty title="No Workspaces" description="You are not apart of any workspaces" icon={WorkspaceIcon}>
      <Button href={resolve("/(app)/workspaces/new")}>New Workspace</Button>
    </Empty>
  {:else}
    <section class="@container">
      <Filters sortBy={data.sortBy} sortDir={data.sortDir} />

      <ul class="grid gap-5 p-5 @xl:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4">
        {#each workspaces.results as w (w.id)}
          <li>
            <WorkspaceCard {...w} onEdit={openEditWorkspace} />
          </li>
        {/each}
      </ul>
    </section>

    {#if workspaces.totalPages > 1}
      <Pagination count={workspaces.total} perPage={workspaces.perPage} page={workspaces.page} class="pbe-5" />
    {/if}
  {/if}
</div>

<EditWorkspaceDialog postUpdatePath={resolve("/(app)/workspaces")} />
