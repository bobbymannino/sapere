<script lang="ts">
  import { resolve } from "$app/paths";
  import Empty from "$lib/components/empty.svelte";
  import Meta from "$lib/components/meta.svelte";
  import * as Button from "$lib/components/ui/button";
  import * as InputGroup from "$lib/components/ui/input-group";
  import { SpinnerIcon, ClockIcon, WorkspaceIcon, SearchIcon } from "$lib/icons";

  import type { PageProps } from "./$types";
  import AuditTable from "./audit-table.svelte";

  let { data }: PageProps = $props();
</script>

<Meta
  title="Audit Logs"
  description="View your accounts audit logs."
  tags={["account", "audit", "logs"]}
  robots="noindex,nofollow"
/>

{#await data.logs}
  <Empty icon={SpinnerIcon} spinningIcon title="Loading Logs" color="primary" />
{:then logs}
  {#if logs.length === 0 && !data.metadata}
    <Empty
      icon={ClockIcon}
      title="No Audit Logs"
      description="You do not have any audit logs yet, create a new workspace to see your first log"
    >
      <Button.Root href={resolve("/(app)/workspaces/new")}>
        <WorkspaceIcon />
        <span>New Workspace</span>
      </Button.Root>
    </Empty>
  {:else}
    <div>
      <form class="p-4" method="get">
        <label for="metadata" class="sr-only">Metadata</label>
        <InputGroup.Root>
          <InputGroup.Input placeholder="Search metadata" name="metadata" id="metadata" value={data.metadata ?? ""} />
          <InputGroup.Addon align="inline-end">
            <InputGroup.Button type="submit">
              <SearchIcon />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup.Root>
      </form>
      {#if logs.length === 0}
        <Empty icon={SearchIcon} title="No Matching Logs" description="No audit logs match that metadata search">
          <Button.Root variant="outline" href={resolve("/(app)/account/audit")}>Clear search</Button.Root>
        </Empty>
      {:else}
        <AuditTable {logs} />
      {/if}
    </div>
  {/if}
{/await}
