<script lang="ts">
  import type { ActorAuditLog } from "$db/audit";
  import * as Table from "$lib/components/ui/table";

  type Props = { action: ActorAuditLog["action"]; metadata: ActorAuditLog["metadata"] };

  let { action, metadata }: Props = $props();
</script>

<Table.Cell>
  {#if action.startsWith("workspace.") && metadata.title}
    Workspace: {metadata.title}
  {:else if action.startsWith("document.") && metadata.title}
    Document: {metadata.title}
  {:else if action === "user.passkey.added" && metadata.name}
    Passkey: {metadata.name}
  {/if}
</Table.Cell>
