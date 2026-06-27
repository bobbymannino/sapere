<script lang="ts">
    import * as Empty from "$lib/components/ui/empty";
    import type { IconComponent } from "$lib/icons";
    import type { Snippet } from "svelte";

    type Props = {
        title: string;
        description: string;
        icon: IconComponent;
        children: Snippet;
    };

    let { title, description, icon: Icon, children }: Props = $props();
</script>

<Empty.Root>
    <Empty.Header>
        <Empty.Media variant="icon">
            <Icon />
        </Empty.Media>
        <Empty.Title>{title}</Empty.Title>
        <Empty.Description>{description}</Empty.Description>
    </Empty.Header>
    <Empty.Content>
        {@render children()}
    </Empty.Content>
</Empty.Root>
