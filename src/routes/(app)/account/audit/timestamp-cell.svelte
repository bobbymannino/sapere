<script lang="ts">
  import type { ActorAuditLog } from "$db/audit";
  import * as Table from "$lib/components/ui/table";
  import { formatDateTime, toIsoDate, formatRelativeDate } from "$lib/date-format";

  type Props = { createdAt: ActorAuditLog["createdAt"] };

  let { createdAt }: Props = $props();

  let createdAtIso = $derived(toIsoDate(createdAt));
</script>

<Table.Cell class="max-w-24">
  <time datetime={createdAtIso} title="{createdAtIso} ({formatRelativeDate(createdAt)})">
    {formatDateTime(createdAt)}
  </time>
</Table.Cell>
