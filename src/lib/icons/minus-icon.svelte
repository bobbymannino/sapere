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
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M4.5 12C4.5 11.5858 4.77982 11.25 5.125 11.25H18.875C19.2202 11.25 19.5 11.5858 19.5 12C19.5 12.4142 19.2202 12.75 18.875 12.75H5.125C4.77982 12.75 4.5 12.4142 4.5 12Z"
        fill="currentColor"
    />
</svg>
