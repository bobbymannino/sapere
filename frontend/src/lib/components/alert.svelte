<script lang="ts">
  import CheckmarkIcon from "$lib/icons/checkmark-icon.svelte";
  import InfoIcon from "$lib/icons/info-icon.svelte";
  import StopIcon from "$lib/icons/stop-icon.svelte";
  import WarningIcon from "$lib/icons/warning-icon.svelte";
  import type { Snippet } from "svelte";
  import { tv, type VariantProps } from "tailwind-variants";

  const alertVariants = tv({
    slots: {
      alert: "p-2 rounded-md text-pretty",
      icon: "size-5 inline-block me-0.5",
    },
    variants: {
      type: {
        info: {
          alert: "bg-primary/10 text-primary",
        },
        warning: {
          alert: "bg-warning/10 text-warning-dark",
        },
        error: {
          alert: "bg-danger/10 text-danger",
        },
        success: {
          alert: "bg-success/10 text-success-dark",
        },
      },
    },
    defaultVariants: {
      type: "info",
    },
  });

  type AlertType = VariantProps<typeof alertVariants>["type"];

  type Props = {
    children: Snippet;
    type?: AlertType;
  };

  let { children, type }: Props = $props();

  const { alert, icon } = $derived(alertVariants({ type }));
</script>

<div class={alert()}>
  {#if type === "success"}
    <CheckmarkIcon class={icon()} />
  {:else if type === "error"}
    <StopIcon class={icon()} />
  {:else if type === "info"}
    <InfoIcon class={icon()} />
  {:else if type === "warning"}
    <WarningIcon class={icon()} />
  {/if}
  <span class="text-sm">{@render children()}</span>
</div>
