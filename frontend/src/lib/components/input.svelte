<script lang="ts" module>
    import type {
        HTMLInputAttributes,
        HTMLInputTypeAttribute,
    } from "svelte/elements";
    import type { WithElementRef } from "./utils.js";

    type InputType = Exclude<HTMLInputTypeAttribute, "file">;

    type Props = WithElementRef<
        Omit<HTMLInputAttributes, "type"> &
            (
                | { type: "file"; files?: FileList }
                | { type?: InputType; files?: undefined }
            )
    >;
</script>

<script lang="ts">
    let {
        ref = $bindable(null),
        value = $bindable(),
        type,
        files = $bindable(),
        class: klass,
        ...restProps
    }: Props = $props();
</script>

{#if type === "file"}
    <input
        bind:this={ref}
        class={[
            "border-2 rounded-md border-crust px-2 p-1 placeholder:text-subtext-1/60 text-txt focus:border-primary outline-none disabled:opacity-50",
            klass,
        ]}
        type="file"
        bind:files
        bind:value
        {...restProps}
    />
{:else}
    <input
        bind:this={ref}
        class={[
            "border-2 rounded-md border-crust px-2 p-1 placeholder:text-subtext-1/60 text-txt focus:border-primary outline-none disabled:opacity-50",
            klass,
        ]}
        {type}
        bind:value
        {...restProps}
    />
{/if}
