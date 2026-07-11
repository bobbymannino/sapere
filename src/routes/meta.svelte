<script lang="ts">
  import { APP_NAME } from "$app/env/public";
  import blackFaviconIco from "$lib/assets/favicon-black.ico";
  import blackFaviconSvg from "$lib/assets/favicon-black.svg";
  import orangeFaviconIco from "$lib/assets/favicon-orange.ico";
  import orangeFaviconSvg from "$lib/assets/favicon-orange.svg";
  import faviconIco from "$lib/assets/favicon.ico";
  import faviconSvg from "$lib/assets/favicon.svg";
</script>

<svelte:head>
  <title>{APP_NAME}</title>
  {#if process.env.NODE_ENV === "production"}
    <link rel="icon" href={faviconIco} sizes="144x144" type="image/x-icon" />
    <link rel="icon" href={faviconSvg} type="image/svg+xml" />
  {:else if process.env.NODE_ENV === "beta"}
    <link rel="icon" href={orangeFaviconIco} sizes="144x144" type="image/x-icon" />
    <link rel="icon" href={orangeFaviconSvg} type="image/svg+xml" />
  {:else}
    <link rel="icon" href={blackFaviconIco} sizes="144x144" type="image/x-icon" />
    <link rel="icon" href={blackFaviconSvg} type="image/svg+xml" />
  {/if}
  <meta name="application-name" content={APP_NAME} />
  <meta name="apple-mobile-web-app-title" content={APP_NAME} />
  <meta property="og:site_name" content={APP_NAME} />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>
