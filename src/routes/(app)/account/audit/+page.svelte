<script lang="ts">
  import { resolve } from "$app/paths";
  import { auditActionTitle } from "$lib/audit-actions";
  import Empty from "$lib/components/empty.svelte";
  import Meta from "$lib/components/meta.svelte";
  import * as Button from "$lib/components/ui/button";
  import * as Table from "$lib/components/ui/table";
  import { formatDateTime, formatShortDateTime, toIsoDate } from "$lib/date-format";
  import { SpinnerIcon, ClockIcon, WorkspaceIcon } from "$lib/icons";

  import type { PageProps } from "./$types";

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
    <Table.Root>
      <Table.Caption>A list of your accounts audit logs</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.Head>Action</Table.Head>
          <Table.Head>Metadata</Table.Head>
          <Table.Head>User Agent</Table.Head>
          <Table.Head>Timestamp</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each logs as l (l.id)}
          <Table.Row>
            <Table.Cell>{auditActionTitle(l.action)}</Table.Cell>
            <Table.Cell>
              {#if l.action === "workspace.created" && l.metadata.title}
                Workspace: {l.metadata.title}
              {:else if l.action === "workspace.deleted" && l.metadata.title}
                Workspace: {l.metadata.title}
              {/if}
            </Table.Cell>
            <Table.Cell>{l.userAgent}</Table.Cell>
            <Table.Cell>
              <time datetime={toIsoDate(l.createdAt)}>{formatDateTime(l.createdAt)}</time>
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  {/if}{/await}
