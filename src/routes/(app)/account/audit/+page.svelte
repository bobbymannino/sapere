<script lang="ts">
  import { resolve } from "$app/paths";
  import Empty from "$lib/components/empty.svelte";
  import Meta from "$lib/components/meta.svelte";
  import Pagination from "$lib/components/pagination.svelte";
  import * as Button from "$lib/components/ui/button";
  import * as InputGroup from "$lib/components/ui/input-group";
  import * as Kbd from "$lib/components/ui/kbd";
  import { SpinnerIcon, ClockIcon, WorkspaceIcon, SearchIcon } from "$lib/icons";
  import { isTextFieldTarget, isUnmodifiedKey } from "$lib/utils";

  import type { PageProps } from "./$types";
  import AuditTable from "./audit-table.svelte";

  let { data }: PageProps = $props();

  let searchInput: Nullable<HTMLInputElement> = $state(null);

  function onkeydown(e: KeyboardEvent) {
    if (e.defaultPrevented || isTextFieldTarget(e.target)) return;
    if (isUnmodifiedKey(e, "/")) {
      e.preventDefault();
      searchInput?.focus();
    }
  }
</script>

<svelte:window {onkeydown} />

<Meta
  title="Audit Logs"
  description="View your accounts audit logs."
  tags={["account", "audit", "logs"]}
  robots="noindex,nofollow"
/>

{#await data.logs}
  <Empty icon={SpinnerIcon} spinningIcon title="Loading Logs" color="primary" />
{:then logs}
  {#if logs.total === 0 && !data.search}
    <Empty
      icon={ClockIcon}
      title="No Audit Logs"
      description="You do not have any audit logs yet, create a new workspace to see your first log"
    >
      <Button.Root href={resolve("/(app)/workspaces/new")}>
        <WorkspaceIcon />
        <span>New Workspace</span>
      </Button.Root>
    </Empty>
  {:else}
    <div class="flex flex-col">
      <form class="p-4" method="get">
        <label for="q" class="sr-only">Search</label>
        <InputGroup.Root>
          <InputGroup.Addon align="inline-start" class="can-hover:flex hidden">
            <Kbd.Root class="can-hover:flex hidden">/</Kbd.Root>
          </InputGroup.Addon>
          <InputGroup.Input
            type="search"
            placeholder="Search actions and metadata"
            name="q"
            id="q"
            value={data.search ?? ""}
            bind:ref={searchInput}
          />
          <InputGroup.Addon align="inline-end">
            <InputGroup.Button type="submit">
              <SearchIcon />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup.Root>
      </form>
      {#if logs.results.length === 0}
        <Empty icon={SearchIcon} title="No Matching Logs" description="No audit logs match that search">
          <Button.Root variant="outline" href={resolve("/(app)/account/audit")}>Clear search</Button.Root>
        </Empty>
      {:else}
        <AuditTable logs={logs.results} />
        {#if logs.totalPages > 1}
          <Pagination count={logs.total} perPage={logs.perPage} page={logs.page} class="pbe-5" />
        {/if}
      {/if}
    </div>
  {/if}
{/await}
