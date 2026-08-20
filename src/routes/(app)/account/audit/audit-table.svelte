<script lang="ts">
  import type { ActorAuditLog } from "$db/audit";
  import { auditAction } from "$lib/audit-actions";
  import * as Table from "$lib/components/ui/table";
  import { formatDateTime, toIsoDate, formatRelativeDate } from "$lib/date-format";
  import { UAParser } from "ua-parser-js";

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
      {@const action = auditAction(l.action)}
      {@const isDestructive = /\.(deleted|removed)/.test(l.action)}
      {@const ua = l.userAgent ? new UAParser(l.userAgent).getResult() : null}
      {@const device = `${ua?.device.vendor ?? ""} ${ua?.device.model ?? ""}`}
      {@const browser = `${ua?.browser.name ?? ""} ${ua?.browser.major ? "v" : ""}${ua?.browser.major ?? ""}`}
      {@const os = `${ua?.os.name ?? ""} ${ua?.os.version ?? ""}`}
      {@const createdAtIso = toIsoDate(l.createdAt)}
      <Table.Row>
        <Table.Cell class="max-w-40">
          <span class="flex items-center gap-2">
            <div
              class={[
                "rounded-full p-2",
                l.action.startsWith("user.") && "bg-primary/15 text-primary",
                l.action.startsWith("workspace.") && "bg-emerald-500/15 text-emerald-500",
                l.action.startsWith("document.") && "bg-purple-400/15 text-purple-400",
                isDestructive && "bg-destructive/15! text-destructive!",
              ]}
            >
              <action.icon class="size-4" />
            </div>
            <span title={action.description}>{action.title}</span>
          </span>
        </Table.Cell>
        <Table.Cell>
          {#if l.action.startsWith("workspace.") && l.metadata.title}
            Workspace: {l.metadata.title}
          {:else if l.action.startsWith("document.") && l.metadata.title}
            Document: {l.metadata.title}
          {:else if l.action === "user.passkey.added" && l.metadata.name}
            Passkey: {l.metadata.name}
          {/if}
        </Table.Cell>
        <Table.Cell title={l.userAgent}>
          {device}
          {#if /\w/.test(device) && (/\w/.test(os) || /\w/.test(browser))}•{/if}
          {os}
          {#if /\w/.test(browser) && (/\w/.test(os) || /\w/.test(device))}•{/if}
          {browser}
        </Table.Cell>
        <Table.Cell class="max-w-24">
          <time datetime={createdAtIso} title="{createdAtIso} ({formatRelativeDate(l.createdAt)})">
            {formatDateTime(l.createdAt)}
          </time>
        </Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>
