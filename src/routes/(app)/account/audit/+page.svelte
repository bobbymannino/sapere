<script lang="ts">
  import { resolve } from "$app/paths";
  import Empty from "$lib/components/empty.svelte";
  import Meta from "$lib/components/meta.svelte";
  import * as Button from "$lib/components/ui/button";
  import { SpinnerIcon, ClockIcon, WorkspaceIcon } from "$lib/icons";

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
  {#if logs.length === 0}
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
    <AuditTable {logs} />
  {/if}
{/await}
