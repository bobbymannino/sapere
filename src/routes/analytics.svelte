<script lang="ts">
  import { UMAMI_WEBSITE_ID } from "$app/env/public";
</script>

<svelte:head>
  {#if UMAMI_WEBSITE_ID && process.env.NODE_ENV === "production"}
    <script
      defer
      src="https://analytics.bobman.dev/script.js"
      data-website-id={UMAMI_WEBSITE_ID}
      data-performance="true"
    ></script>
    <script defer src="https://analytics.bobman.dev/recorder.js" data-website-id={UMAMI_WEBSITE_ID}></script>
  {/if}
</svelte:head>
