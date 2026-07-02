<script lang="ts">
    import { browser } from "$app/env";
    import Meta from "$lib/components/meta.svelte";
    import type { PageProps } from "./$types";
    import dompurify from "dompurify";
    import { parse } from "marked";
    import * as Textarea from "$lib/components/ui/textarea";
    import * as Alert from "$lib/components/ui/alert";
    import { ErrorIcon } from "$lib/icons";

    let { data }: PageProps = $props();

    let showPreview = $state(true);

    let md = $derived(data.document.content);
    const sanitized = $derived(browser && showPreview ? dompurify.sanitize(md) : "### Loading preview...");
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
    <div class="p-5">
        <Alert.Root variant="destructive">
            <ErrorIcon />
            <Alert.Title>Nothing saves</Alert.Title>
        </Alert.Root>
    </div>

    <div class={["grid gap-5", showPreview && "md:grid-cols-2"]}>
        <section class="p-5">
            <Textarea.Root defaultValue={md} {oninput} />
        </section>

        {#if showPreview}
            <section class="p-5">
                {@html html}
            </section>
        {/if}
    </div>
</div>
