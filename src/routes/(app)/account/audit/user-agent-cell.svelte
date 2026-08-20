<script lang="ts">
  import type { ActorAuditLog } from "$db/audit";
  import * as Table from "$lib/components/ui/table";
  import { UAParser } from "ua-parser-js";

  type Props = { userAgent: ActorAuditLog["userAgent"] };

  let { userAgent }: Props = $props();

  let ua = $derived(userAgent ? new UAParser(userAgent).getResult() : null);
  let device = $derived(`${ua?.device.vendor ?? ""} ${ua?.device.model ?? ""}`);
  let browser = $derived(
    `${ua?.browser.name ?? ""} ${ua?.browser.major ? "v" : ""}${ua?.browser.major ?? ""}`,
  );
  let os = $derived(`${ua?.os.name ?? ""} ${ua?.os.version ?? ""}`);
</script>

<Table.Cell title={userAgent}>
  {device}
  {#if /\w/.test(device) && (/\w/.test(os) || /\w/.test(browser))}•{/if}
  {os}
  {#if /\w/.test(browser) && (/\w/.test(os) || /\w/.test(device))}•{/if}
  {browser}
</Table.Cell>
