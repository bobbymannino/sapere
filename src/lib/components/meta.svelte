<script module lang="ts">
  export type MetaDate = Date | string;

  export type MetaImage = {
    url: string;
    alt?: string | null;
    width?: number | string | null;
    height?: number | string | null;
  };

  export type MetaProps = {
    title?: string | null;
    description?: string | null;
    image?: MetaImage | null;
    url?: string | null;
    canonical?: string | null;
    type?: string;
    tags?: readonly string[];
    robots?: string | null;
    publishedTime?: MetaDate | null;
    modifiedTime?: MetaDate | null;
    author?: string | null;
  };
</script>

<script lang="ts">
  import { APP_NAME } from "$app/env/public";
  import { page } from "$app/state";

  let {
    title,
    description,
    image,
    url,
    canonical,
    type = "website",
    tags = [],
    robots,
    publishedTime,
    modifiedTime,
    author,
  }: MetaProps = $props();

  let pageTitle = $derived(title ? `${title} | ${APP_NAME}` : APP_NAME);
  let pageUrl = $derived(`${page.url.origin}${page.url.pathname}`);
  let canonicalUrl = $derived(normalizeUrl(firstNonEmpty(canonical, url, pageUrl)));
  let pageTags = $derived(tags.map((tag) => tag.trim()).filter(Boolean));
  let publishedTimeContent = $derived(formatMetaDate(publishedTime));
  let modifiedTimeContent = $derived(formatMetaDate(modifiedTime));
  let imageWidthContent = $derived(formatMetaNumber(image?.width));
  let imageHeightContent = $derived(formatMetaNumber(image?.height));

  function formatMetaDate(value: MetaDate | null | undefined) {
    if (!value) return null;
    return value instanceof Date ? value.toISOString() : value;
  }

  function formatMetaNumber(value: number | string | null | undefined) {
    if (value === null || value === undefined || value === "") return null;
    return String(value);
  }

  function firstNonEmpty(...values: Array<string | null | undefined>) {
    return values.find((value) => value && value.trim().length > 0)?.trim() ?? null;
  }

  function normalizeUrl(value: string | null | undefined) {
    if (!value) return null;

    try {
      return new URL(value, page.url.origin).toString();
    } catch {
      return value;
    }
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta property="og:title" content={pageTitle} />
  <meta name="twitter:title" content={pageTitle} />

  {#if description}
    <meta name="description" content={description} />
    <meta property="og:description" content={description} />
    <meta name="twitter:description" content={description} />
  {/if}

  {#if canonicalUrl}
    <link rel="canonical" href={canonicalUrl} />
    <meta property="og:url" content={canonicalUrl} />
  {/if}

  {#if type}
    <meta property="og:type" content={type} />
  {/if}

  {#if robots}
    <meta name="robots" content={robots} />
  {/if}

  {#if image?.url}
    <meta property="og:image" content={image.url} />
    <meta name="twitter:image" content={image.url} />
  {/if}

  {#if image?.alt}
    <meta property="og:image:alt" content={image.alt} />
    <meta name="twitter:image:alt" content={image.alt} />
  {/if}

  {#if imageWidthContent}
    <meta property="og:image:width" content={imageWidthContent} />
  {/if}

  {#if imageHeightContent}
    <meta property="og:image:height" content={imageHeightContent} />
  {/if}

  {#if pageTags.length > 0}
    <meta name="keywords" content={pageTags.join(", ")} />
    {#each pageTags as tag (tag)}
      <meta property="article:tag" content={tag} />
    {/each}
  {/if}

  {#if publishedTimeContent}
    <meta property="article:published_time" content={publishedTimeContent} />
  {/if}

  {#if modifiedTimeContent}
    <meta property="article:modified_time" content={modifiedTimeContent} />
  {/if}

  {#if author}
    <meta name="author" content={author} />
    <meta property="article:author" content={author} />
  {/if}
</svelte:head>
