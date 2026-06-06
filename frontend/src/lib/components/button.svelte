<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue } from "svelte/elements";

    const variants = ["primary", "ghost", "destructive"] as const;
    type Variant = (typeof variants)[number];

    const sizes = ["sm", "md", "lg"] as const;
    type Size = (typeof sizes)[number];

    type Props = {
        href: string;
        children: Snippet;
        /** @default primary */
        variant?: Variant;
        /** @default md */
        size?: Size;
    };

    let { href, children, variant = "primary", size = "md" }: Props = $props();

    const variantClasses: Record<Variant, ClassValue> = {
        primary: "bg-primary hover:bg-primary-dark text-base",
        destructive: "bg-danger hover:bg-danger-darker text-base",
        ghost: "text-primary hover:bg-primary/10",
    };

    const sizeClasses: Record<Size, ClassValue> = {
        sm: "px-1.5 py-0.5 rounded-sm text-sm",
        md: "px-2.5 py-1 rounded-md",
        lg: "px-4 py-1.5 rounded-lg text-lg",
    };
</script>

<a
    {href}
    class={[
        "inline-block font-medium",
        variantClasses[variant],
        sizeClasses[size],
    ]}
>
    {@render children()}
</a>
