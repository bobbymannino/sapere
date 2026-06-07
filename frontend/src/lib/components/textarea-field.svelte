<script lang="ts" module>
  import type { ApiError } from "$lib/api/errors";
  import type { HTMLTextareaAttributes } from "svelte/elements";

  import type { WithElementRef } from "./utils.js";

  type Props = WithElementRef<
    Omit<HTMLTextareaAttributes, "id" | "name"> & {
      error?: ApiError;
      errorNames?: string[];
      id: string;
      label: string;
      name: string;
      textareaClass?: string;
    },
    HTMLTextAreaElement
  >;
</script>

<script lang="ts">
  import FormErrors from "./form-errors.svelte";
  import Textarea from "./textarea.svelte";

  let {
    class: klass,
    error,
    errorNames,
    id,
    label,
    name,
    ref = $bindable(null),
    textareaClass,
    value = $bindable(),
    ...restProps
  }: Props = $props();
</script>

<div class={["stack-1", klass]}>
  <label for={id}>{label}</label>
  <Textarea bind:ref bind:value class={textareaClass} {id} {name} {...restProps}></Textarea>
  {#each errorNames ?? [name] as errorName (errorName)}
    <FormErrors name={errorName} {error} />
  {/each}
</div>
