<script lang="ts">
  import type { AuditLogSelect } from "$db/schema";
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import { CircleErrorIcon, CircleTickIcon } from "$lib/icons";

  type Props = {
    status: AuditLogSelect["status"];
  };

  let { status }: Props = $props();

  const failed = $derived(status === "failure");
</script>

<Badge variant={failed ? "destructive" : "secondary"}>
  {#if failed}
    <CircleErrorIcon data-icon="inline-start" />
    <span>Failed</span>
  {:else}
    <CircleTickIcon data-icon="inline-start" />
    <span>Success</span>
  {/if}
</Badge>
