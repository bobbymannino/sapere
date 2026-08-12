<script lang="ts">
  import { page } from "$app/state";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  import SidebarTrigger from "$lib/components/ui/sidebar/sidebar-trigger.svelte";
  import type { Snippet } from "svelte";

  type Props = {
    children?: Snippet;
  };

  let { children }: Props = $props();
</script>

<header class="border-border flex items-center justify-between gap-3 border-b p-5">
  <Breadcrumb.Root>
    <Breadcrumb.List>
      <Breadcrumb.Item>
        <SidebarTrigger />
      </Breadcrumb.Item>
      {#each page.data.breadcrumbs as b, index (b.label)}
        {#if index > 0}
          <Breadcrumb.Separator {index} />
        {/if}
        <Breadcrumb.Item {index}>
          {#if b.href}
            <Breadcrumb.Link href={b.href}>{b.label}</Breadcrumb.Link>
          {:else}
            <Breadcrumb.Page>{b.label}</Breadcrumb.Page>
          {/if}
        </Breadcrumb.Item>
      {/each}
    </Breadcrumb.List>
  </Breadcrumb.Root>

  {#if children}
    {@render children()}
  {/if}
</header>
