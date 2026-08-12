<script lang="ts">
  import { slideInRight } from "$lib/actions/slide-in";
  import { cn, type WithElementRef } from "$lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    children,
    class: className,
    index,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLLIElement>> & { index?: number } = $props();
</script>

<li
  bind:this={ref}
  data-slot="sidebar-menu-sub-item"
  data-sidebar="menu-sub-item"
  class={cn("group/menu-sub-item relative", className)}
  use:slideInRight={index}
  {...restProps}
>
  {@render children?.()}
</li>
