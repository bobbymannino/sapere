<script lang="ts">
    import { dev } from "$app/env";
    import { UMAMI_WEBSITE_ID } from "$app/env/public";
</script>

<svelte:head>
    {#if !dev && UMAMI_WEBSITE_ID}
        <script
            defer
            src="https://analytics.bobman.dev/script.js"
            data-website-id={UMAMI_WEBSITE_ID}
            data-performance="true"
        ></script>
        <script defer src="https://analytics.bobman.dev/recorder.js" data-website-id={UMAMI_WEBSITE_ID}></script>
    {/if}
</svelte:head>
