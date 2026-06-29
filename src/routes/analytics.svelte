<script lang="ts">
    import { dev } from "$app/env";
</script>

<svelte:head>
    {#if !dev}
        <script
            defer
            src="https://analytics.bobman.dev/script.js"
            data-website-id="58341853-ca32-4a44-be65-7f1d303b6375"
            data-performance="true"
        ></script>
        <script
            defer
            src="https://analytics.bobman.dev/recorder.js"
            data-website-id="58341853-ca32-4a44-be65-7f1d303b6375"
        ></script>
    {/if}
</svelte:head>
