<script lang="ts">
  import type { ActorAuditLog } from "$db/audit";
  import { auditAction } from "$lib/audit-actions";

  type Props = { action: ActorAuditLog["action"] };

  let { action }: Props = $props();

  let entry = $derived(auditAction(action));
  let isDestructive = $derived(/\.(deleted|removed)/.test(action));
</script>

<span class="flex items-center gap-2">
  <span
    class={[
      "shrink-0 rounded-full p-2",
      action.startsWith("user.") && "bg-primary/15 text-primary",
      action.startsWith("workspace.") && "bg-emerald-500/15 text-emerald-500",
      action.startsWith("document.") && "bg-purple-400/15 text-purple-400",
      isDestructive && "bg-destructive/15! text-destructive!",
    ]}
  >
    <entry.icon class="size-4" />
  </span>
  <span title={entry.description}>{entry.title}</span>
</span>
