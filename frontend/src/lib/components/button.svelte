<script lang="ts" module>
  import SpinnerIcon from "$lib/icons/spinner-icon.svelte";
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
  import { tv } from "tailwind-variants";
  import type { VariantProps } from "tailwind-variants";

  import type { WithElementRef } from "./utils";

  export const buttonVariants = tv({
    slots: {
      button:
        "disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45 disabled:pointer-events-none select-none inline-flex items-center justify-center font-medium focus-visible:ring-3 focus-visible:outline-none",
      icon: "animate-spin",
    },
    variants: {
      variant: {
        primary: {
          button: "bg-primary hover:bg-primary-dark text-(--color-base) ring-primary-darker",
        },
        destructive: {
          button: "bg-danger hover:bg-danger-darker text-(--color-base) ring-danger-darker",
        },
        ghost: {
          button: "text-primary hover:bg-primary/10 ring-primary",
        },
        text: {
          button: "text-txt hover:underline ring-txt",
        },
      },
      size: {
        sm: {
          button: "px-1.5 py-0.5 gap-1 rounded-sm text-sm",
          icon: "size-3",
        },
        md: {
          button: "px-2.5 py-1 gap-1.5 rounded-md",
          icon: "size-3.5",
        },
        lg: {
          button: "px-4 py-1.5 gap-2 rounded-lg text-lg",
          icon: "size-4",
        },
      },
    },
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
  });

  export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
  export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

  export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
    WithElementRef<HTMLAnchorAttributes> & {
      variant?: ButtonVariant;
      size?: ButtonSize;
      pending?: boolean;
    };
</script>

<script lang="ts">
  let {
    class: klass,
    children,
    variant = "primary",
    size = "md",
    href = undefined,
    ref = $bindable(null),
    type = "button",
    disabled,
    pending = false,
    ...restProps
  }: ButtonProps = $props();

  const { button, icon } = $derived(buttonVariants({ size, variant }));
</script>

{#if href}
  <a
    bind:this={ref}
    class={[button(), klass]}
    href={disabled ? undefined : href}
    aria-disabled={disabled}
    role={disabled ? "link" : undefined}
    tabindex={disabled ? -1 : 0}
    {...restProps}
  >
    {@render children?.()}
  </a>
{:else}
  <button bind:this={ref} class={[button(), klass]} {type} {disabled} {...restProps}>
    {#if pending}
      <SpinnerIcon class={icon()} />
    {/if}
    {@render children?.()}
  </button>
{/if}
