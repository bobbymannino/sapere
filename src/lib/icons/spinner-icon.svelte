<script lang="ts">
    import type { SVGAttributes } from "svelte/elements";

    let props: SVGAttributes<SVGElement> = $props();
</script>

<!-- solid, 1.5px, 3px -->
<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
>
    <path
        d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z"
        stroke="currentColor"
        stroke-opacity="0.3"
    /><path
        d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5"
        stroke="currentColor"
    />
</svg>
