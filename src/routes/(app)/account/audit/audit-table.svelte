<script lang="ts">
  import type { ActorAuditLog } from "$db/audit";
  import * as Table from "$lib/components/ui/table";

  import ActionBadge from "./action-badge.svelte";
  import { metadataLabel, userAgentLabel } from "./audit-format";
  import AuditTimestamp from "./audit-timestamp.svelte";

  type Props = { logs: ActorAuditLog[] };

  let { logs }: Props = $props();
</script>

<ul class="flex flex-col lg:hidden" aria-label="A list of your accounts audit logs">
  {#each logs as l (l.id)}
    {@const metadata = metadataLabel(l)}
    {@const userAgent = userAgentLabel(l.userAgent)}
    <li class="flex flex-col gap-1 border-b p-4 text-sm">
      <ActionBadge action={l.action} />
      {#if metadata}
        <span class="wrap-break-word">{metadata}</span>
      {/if}
      <span class="text-muted-foreground flex flex-wrap items-center gap-x-2">
        <AuditTimestamp createdAt={l.createdAt} />
        {#if userAgent}
          <span title={l.userAgent}>• {userAgent}</span>
        {/if}
        {#if l.ipAddress}
          <span title={l.ipAddress}>• {l.ipAddress}</span>
        {/if}
      </span>
    </li>
  {/each}
</ul>

<Table.Root class="hidden lg:table">
  <Table.Caption class="sr-only">A list of your accounts audit logs</Table.Caption>
  <Table.Header>
    <Table.Row>
      <Table.Head class="max-w-40">Action</Table.Head>
      <Table.Head>Metadata</Table.Head>
      <Table.Head class="w-22">IP Address</Table.Head>
      <Table.Head>User Agent</Table.Head>
      <Table.Head class="max-w-24">Timestamp</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each logs as l (l.id)}
      <Table.Row>
        <Table.Cell class="max-w-40">
          <ActionBadge action={l.action} />
        </Table.Cell>
        <Table.Cell>{metadataLabel(l)}</Table.Cell>
        <Table.Cell class="w-22" title={l.ipAddress}>{l.ipAddress}</Table.Cell>
        <Table.Cell title={l.userAgent}>{userAgentLabel(l.userAgent)}</Table.Cell>
        <Table.Cell class="max-w-24">
          <AuditTimestamp createdAt={l.createdAt} />
        </Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>
