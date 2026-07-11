<script lang="ts">
  import { goto } from "$app/navigation";
  import { navigating, page as svPage } from "$app/state";
  import * as Pagination from "$lib/components/ui/pagination";
  import type { ClassValue } from "svelte/elements";

  function onPageChange(newPage: number) {
    const sp = new URLSearchParams(svPage.url.searchParams);
    sp.set("page", newPage.toString());
    goto(`${svPage.url.pathname}?${sp.toString()}`);
  }

  type Props = {
    count: number;
    perPage: number;
    page: number;
    class?: ClassValue;
  };

  let { count, page, perPage, class: klass }: Props = $props();
</script>

<Pagination.Root {count} {perPage} {page} {onPageChange} class={["mbs-auto px-5", klass]}>
  {#snippet children({ pages, currentPage })}
    <Pagination.Content>
      <Pagination.Item>
        <Pagination.Previous disabled={Boolean(navigating.to)} />
      </Pagination.Item>
      {#each pages as page (page.key)}
        {#if page.type === "ellipsis"}
          <Pagination.Item>
            <Pagination.Ellipsis />
          </Pagination.Item>
        {:else}
          <Pagination.Item>
            <Pagination.Link {page} isActive={currentPage === page.value} disabled={Boolean(navigating.to)}>
              {page.value}
            </Pagination.Link>
          </Pagination.Item>
        {/if}
      {/each}
      <Pagination.Item>
        <Pagination.Next disabled={Boolean(navigating.to)} />
      </Pagination.Item>
    </Pagination.Content>
  {/snippet}
</Pagination.Root>
