<script lang="ts">
  import * as InputGroup from "$lib/components/ui/input-group";
  import { EyeOpenIcon, EyeSlashIcon } from "$lib/icons";
  import type { ComponentProps } from "svelte";

  type Props = Omit<ComponentProps<typeof InputGroup.Input>, "type" | "files">;

  let { value = $bindable(), disabled, ...restProps }: Props = $props();
  let showPassword = $state(false);
</script>

<InputGroup.Root data-disabled={disabled ? "true" : undefined}>
  <InputGroup.Input {...restProps} type={showPassword ? "text" : "password"} bind:value {disabled} />
  <InputGroup.Addon align="inline-end">
    <InputGroup.Button
      type="button"
      size="icon-xs"
      aria-label={showPassword ? "Hide password" : "Show password"}
      aria-pressed={showPassword}
      {disabled}
      onclick={() => (showPassword = !showPassword)}
    >
      {#if showPassword}
        <EyeSlashIcon />
      {:else}
        <EyeOpenIcon />
      {/if}
    </InputGroup.Button>
  </InputGroup.Addon>
</InputGroup.Root>
