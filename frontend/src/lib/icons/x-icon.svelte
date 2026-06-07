<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  let props: SVGAttributes<SVGElement> = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
  <path
    d="M4.75 4.75L19.25 19.25M19.25 4.75L4.75 19.25"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
</svg>
