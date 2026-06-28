<script lang="ts">
    import { APP_NAME } from "$app/env/public";
    import favicon from "$lib/assets/favicon.svg";
</script>

<svelte:head>
    <title>{APP_NAME}</title>
    <link rel="icon" href={favicon} />
    <meta name="application-name" content={APP_NAME} />
    <meta name="apple-mobile-web-app-title" content={APP_NAME} />
    <meta property="og:site_name" content={APP_NAME} />
    <meta name="twitter:card" content="summary_large_image" />
</svelte:head>
