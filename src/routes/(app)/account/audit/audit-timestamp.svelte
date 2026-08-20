<script lang="ts">
  import type { ActorAuditLog } from "$db/audit";
  import { formatDateTime, toIsoDate, formatRelativeDate } from "$lib/date-format";

  type Props = { createdAt: ActorAuditLog["createdAt"] };

  let { createdAt }: Props = $props();

  let createdAtIso = $derived(toIsoDate(createdAt));
</script>

<time datetime={createdAtIso} title="{createdAtIso} ({formatRelativeDate(createdAt)})">
  {formatDateTime(createdAt)}
</time>
