<script lang="ts">
  import * as Empty from "$lib/components/ui/empty";
  import type { IconComponent } from "$lib/icons";
  import type { Snippet } from "svelte";
  import { tv } from "tailwind-variants";

  const empty = tv({
    variants: {
      color: {
        default: "",
        destructive: "bg-destructive/15 text-destructive",
      },
    },
    defaultVariants: {
      color: "default",
    },
  });

  type Props = {
    title: string;
    description: string;
    icon: IconComponent;
    children: Snippet;
    color?: keyof typeof empty.variants.color;
  };

  let { title, description, icon: Icon, children, color }: Props = $props();
</script>

<Empty.Root>
  <Empty.Header>
    <Empty.Media variant="icon" class={empty({ color })}>
      <Icon />
    </Empty.Media>
    <Empty.Title>{title}</Empty.Title>
    <Empty.Description>{description}</Empty.Description>
  </Empty.Header>
  <Empty.Content>
    {@render children()}
  </Empty.Content>
</Empty.Root>
