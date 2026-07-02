<script lang="ts">
    import { browser } from "$app/env";
    import Meta from "$lib/components/meta.svelte";
    import type { PageProps } from "./$types";
    import dompurify from "dompurify";
    import { parse } from "marked";
    import * as Textarea from "$lib/components/ui/textarea";
    import * as Button from "$lib/components/ui/button";

    let { data }: PageProps = $props();

    let showPreview = $state(true);

    let md = $derived(data.document.content);
    const sanitized = $derived(browser && showPreview ? dompurify.sanitize(md) : "");
    const html = $derived(parse(sanitized));

    function oninput(e: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) {
        md = e.currentTarget.value;
    }
</script>

<Meta
    title={data.document.title}
    description={`View ${data.document.title} in ${data.workspace.title}.`}
    tags={["documents", data.workspace.slug, data.document.slug]}
    robots="noindex,nofollow"
/>

<div>
    <header class="p-5 pbe-0">
        <Button.Root class="" onclick={() => (showPreview = !showPreview)}>
            {showPreview ? "Hide" : "Show"} Preview
        </Button.Root>
    </header>

    <div class={["grid gap-5", showPreview && "md:grid-cols-2"]}>
        <section class="p-5">
            <Textarea.Root bind:value={md} />
        </section>

        {#if showPreview}
            <section class="p-5">
                {#if browser}
                    {@html html}
                {:else}
                    <p>Loading preview...</p>
                {/if}
            </section>
        {/if}
    </div>
</div>
