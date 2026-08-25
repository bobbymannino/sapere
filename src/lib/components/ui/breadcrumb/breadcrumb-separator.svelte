<script lang="ts">
  import { slideInDown } from "$lib/actions/slide-in";
  import { ChevronRightIcon } from "$lib/icons";
  import { cn, type WithElementRef } from "$lib/utils.js";
  import type { HTMLLiAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    index,
    ...restProps
  }: WithElementRef<HTMLLiAttributes> & { index?: number } = $props();
</script>

<li
  bind:this={ref}
  data-slot="breadcrumb-separator"
  role="presentation"
  aria-hidden="true"
  class={cn("motion-safe:opacity-0 [&>svg]:size-3.5", className)}
  use:slideInDown={{ index }}
  {...restProps}
>
  {#if children}
    {@render children?.()}
  {:else}
    <ChevronRightIcon />
  {/if}
</li>
