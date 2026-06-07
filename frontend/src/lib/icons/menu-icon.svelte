<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  let props: SVGAttributes<SVGElement> = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
  <path
    d="M2.75 12H21.25M2.75 5.75H21.25M2.75 18.25H21.25"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
