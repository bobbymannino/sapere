<script lang="ts">
  import type { ActorAuditLog } from "$db/audit";
  import * as Table from "$lib/components/ui/table";
  import ActionCell from "./action-cell.svelte";
  import MetadataCell from "./metadata-cell.svelte";
  import TimestampCell from "./timestamp-cell.svelte";
  import UserAgentCell from "./user-agent-cell.svelte";

  type Props = { logs: ActorAuditLog[] };

  let { logs }: Props = $props();
</script>

<Table.Root>
  <Table.Caption class="sr-only">A list of your accounts audit logs</Table.Caption>
  <Table.Header>
    <Table.Row>
      <Table.Head class="max-w-40">Action</Table.Head>
      <Table.Head>Metadata</Table.Head>
      <Table.Head>User Agent</Table.Head>
      <Table.Head class="max-w-24">Timestamp</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each logs as l (l.id)}
      <Table.Row>
        <ActionCell action={l.action} />
        <MetadataCell action={l.action} metadata={l.metadata} />
        <UserAgentCell userAgent={l.userAgent} />
        <TimestampCell createdAt={l.createdAt} />
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>
