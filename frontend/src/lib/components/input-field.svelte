<script lang="ts" module>
  import type { ApiError } from "$lib/api/errors";
  import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";

  import type { WithElementRef } from "./utils.js";

  type InputType = Exclude<HTMLInputTypeAttribute, "file">;

  type Props = WithElementRef<
    Omit<HTMLInputAttributes, "files" | "id" | "name" | "type"> & {
      error?: ApiError;
      errorNames?: string[];
      id: string;
      inputClass?: string;
      label: string;
      name: string;
      type?: InputType;
    },
    HTMLInputElement
  >;
</script>

<script lang="ts">
  import FormErrors from "./form-errors.svelte";
  import Input from "./input.svelte";

  let {
    class: klass,
    error,
    errorNames,
    id,
    inputClass,
    label,
    name,
    ref = $bindable(null),
    type,
    value = $bindable(),
    ...restProps
  }: Props = $props();
</script>

<div class={["stack-1", klass]}>
  <label for={id}>{label}</label>
  <Input bind:ref bind:value class={inputClass} {id} {name} {type} {...restProps} />
  {#each errorNames ?? [name] as errorName (errorName)}
    <FormErrors name={errorName} {error} />
  {/each}
</div>
