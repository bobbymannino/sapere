<script lang="ts">
  import type { ActorAuditLog } from "$db/audit";
  import { auditAction } from "$lib/audit-actions";
  import * as Table from "$lib/components/ui/table";
  import { formatDateTime, formatShortDateTime, toIsoDate } from "$lib/date-format";
  import clsx from "clsx";

  type Props = { logs: ActorAuditLog[] };

  let { logs }: Props = $props();
</script>

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
      {@const action = auditAction(l.action)}
      {@const isDestructive = /\.(deleted|removed)/.test(l.action)}
      <Table.Row>
        <Table.Cell>
          <span class="flex items-center gap-2">
            <div
              class={[
                "rounded-full p-2",
                l.action.startsWith("user.") && "bg-primary/15 text-primary",
                l.action.startsWith("workspace.") && "bg-emerald-500/15 text-emerald-500",
                isDestructive && "bg-destructive/15! text-destructive!",
              ]}
            >
              <action.icon class="size-4" />
            </div>
            <span title={action.description}>{action.title}</span>
          </span>
        </Table.Cell>
        <Table.Cell>
          {#if l.action === "workspace.created" && l.metadata.title}
            Workspace: {l.metadata.title}
          {:else if l.action === "workspace.deleted" && l.metadata.title}
            Workspace: {l.metadata.title}
          {:else if l.action === "workspace.updated" && l.metadata.title}
            Workspace: {l.metadata.title}
          {:else if l.action === "user.passkey.added" && l.metadata.name}
            Passkey: {l.metadata.name}
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
