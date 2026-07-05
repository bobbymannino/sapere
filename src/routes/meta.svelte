<script lang="ts">
    import { APP_NAME } from "$app/env/public";
    import faviconSvg from "$lib/assets/favicon.svg";
    import faviconIco from "$lib/assets/favicon.ico";
</script>

<svelte:head>
    <title>{APP_NAME}</title>
    <link rel="icon" href={faviconIco} sizes="144x144" type="image/x-icon" />
    <link rel="icon" href={faviconSvg} type="image/svg+xml" />
    <meta name="application-name" content={APP_NAME} />
    <meta name="apple-mobile-web-app-title" content={APP_NAME} />
    <meta property="og:site_name" content={APP_NAME} />
    <meta name="twitter:card" content="summary_large_image" />
</svelte:head>
