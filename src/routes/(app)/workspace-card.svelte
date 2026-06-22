<script lang="ts">
    import { resolve } from "$app/paths";
    import CardContent from "$lib/components/ui/card/card-content.svelte";
    import CardDescription from "$lib/components/ui/card/card-description.svelte";
    import CardHeader from "$lib/components/ui/card/card-header.svelte";
    import CardTitle from "$lib/components/ui/card/card-title.svelte";
    import Card from "$lib/components/ui/card/card.svelte";
    import { formatDateTime, toIsoDate } from "$lib/date-format";
    import type { WorkspaceCardSelection } from "$lib/server/db/workspaces";

    type Props = WorkspaceCardSelection;

    let { title, slug, updatedAt }: Props = $props();
    let formattedUpdatedAt = $derived(formatDateTime(updatedAt));
    let updatedAtIso = $derived(toIsoDate(updatedAt));
</script>

<a
    href={resolve("/(app)/workspaces/[slug]", { slug })}
    class="group/card block hover:scale-101 motion-safe:hover:transition-transform"
>
    <Card class="group-hover/card:shadow-lg">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>

        <CardContent>
            <CardDescription>
                Updated <time datetime={updatedAtIso}>{formattedUpdatedAt}</time
                >
            </CardDescription>
        </CardContent>
    </Card>
</a>
