<script lang="ts">
    import type { SVGAttributes } from "svelte/elements";

    let props: SVGAttributes<SVGElement> = $props();
</script>

<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
>
    <path
        d="M2.75 15.0938L9 20.25L21.25 3.75"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
