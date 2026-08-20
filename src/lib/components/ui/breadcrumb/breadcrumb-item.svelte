<script lang="ts">
  import { slideInDown } from "$lib/actions/slide-in";
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
  data-slot="breadcrumb-item"
  class={cn("inline-flex items-center gap-1.5 motion-safe:opacity-0", className)}
  use:slideInDown={index}
  {...restProps}
>
  {@render children?.()}
</li>
