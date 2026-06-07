<script lang="ts" module>
  import type { HTMLTextareaAttributes } from "svelte/elements";

  import type { WithElementRef } from "./utils";

  type Props = WithElementRef<HTMLTextareaAttributes, HTMLTextAreaElement>;
</script>

<script lang="ts">
  let { ref = $bindable(null), value = $bindable(), class: klass, ...restProps }: Props = $props();
</script>

<textarea
  bind:this={ref}
  class={[
    "border-crust placeholder:text-subtext-1/60 text-txt focus:border-primary min-h-24 resize-y rounded-md border-2 p-1 px-2 outline-none disabled:opacity-50",
    klass,
  ]}
  bind:value
  {...restProps}
></textarea>
