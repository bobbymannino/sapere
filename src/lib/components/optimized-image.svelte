<script lang="ts">
    import { ErrorIcon, PictureIcon, SpinnerIcon } from "$lib/icons";
    import { cn, type WithElementRef, type WithoutChildren } from "$lib/utils";
    import { onMount } from "svelte";
    import type { ClassValue, HTMLImgAttributes } from "svelte/elements";

    type ImageEvent = Event & { currentTarget: EventTarget & Element };
    type ImageProps = Omit<
        WithoutChildren<WithElementRef<HTMLImgAttributes, HTMLImageElement>>,
        "alt" | "onerror" | "onload" | "src"
    >;

    type Props = ImageProps & {
        src?: string | null;
        alt?: string;
        imageClass?: ClassValue;
        emptyLabel?: string;
        loadingLabel?: string;
        errorLabel?: string;
        showErrorLabel?: boolean;
        onload?: (event: ImageEvent) => void;
        onerror?: (event: ImageEvent) => void;
    };

    let {
        ref = $bindable(null),
        src,
        alt = "",
        class: className,
        imageClass,
        loading = "lazy",
        decoding = "async",
        emptyLabel = "No image",
        loadingLabel = "Loading image",
        errorLabel = "Image failed to load",
        showErrorLabel = true,
        onload,
        onerror,
        ...restProps
    }: Props = $props();

    let loadedSrc = $state<string | null>(null);
    let failedSrc = $state<string | null>(null);
    let imageSrc = $derived(typeof src === "string" && src.length > 0 ? src : null);
    let isLoaded = $derived(imageSrc !== null && loadedSrc === imageSrc);
    let isFailed = $derived(imageSrc !== null && failedSrc === imageSrc);
    let isLoading = $derived(imageSrc !== null && !isLoaded && !isFailed);

    async function markLoaded(image: HTMLImageElement, loaded: string) {
        try {
            await image.decode();
        } catch {
            // The load event succeeded; decode can reject if the image is already decoded or interrupted.
        }

        if (loaded === src) {
            failedSrc = null;
            loadedSrc = loaded;
        }
    }

    function markFailed(failed: string) {
        loadedSrc = null;
        failedSrc = failed;
    }

    onMount(() => {
        const image = ref;
        const currentSrc = imageSrc;

        if (!currentSrc || !image?.complete) return;

        if (image.naturalWidth > 0) {
            void markLoaded(image, currentSrc);
        } else {
            markFailed(currentSrc);
        }
    });

    async function handleLoad(event: ImageEvent) {
        if (!imageSrc) return;
        onload?.(event);
        await markLoaded(event.currentTarget as HTMLImageElement, imageSrc);
    }

    function handleError(event: ImageEvent) {
        if (!imageSrc) return;
        onerror?.(event);
        markFailed(imageSrc);
    }
</script>

<div
    data-slot="optimized-image"
    aria-busy={isLoading ? "true" : undefined}
    class={cn("bg-muted relative overflow-hidden", className)}
>
    {#if !imageSrc}
        <div class="absolute inset-0 flex-center bg-muted text-muted-foreground" role="img" aria-label={emptyLabel}>
            <PictureIcon aria-hidden="true" />
        </div>
    {:else}
        {#if isLoading}
            <div
                class="absolute inset-0 flex-center bg-muted text-muted-foreground"
                role="status"
                aria-label={loadingLabel}
            >
                <SpinnerIcon class="animate-spin" aria-hidden="true" />
            </div>
        {/if}

        {#if isFailed}
            <div
                class="absolute inset-0 flex-center flex-col gap-2 bg-muted px-3 text-center text-sm text-destructive-muted"
                role="img"
                aria-label={errorLabel}
            >
                <ErrorIcon aria-hidden="true" />
                {#if showErrorLabel}
                    <span>{errorLabel}</span>
                {/if}
            </div>
        {/if}

        <img
            bind:this={ref}
            {...restProps}
            src={imageSrc}
            {alt}
            {loading}
            {decoding}
            onload={handleLoad}
            onerror={handleError}
            class={cn(
                "absolute inset-0 size-full object-cover transition-opacity duration-200",
                isLoaded ? "opacity-100" : "opacity-0",
                imageClass,
            )}
        />
    {/if}
</div>
