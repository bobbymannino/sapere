<script lang="ts">
    import CardContent from "$lib/components/ui/card/card-content.svelte";
    import CardDescription from "$lib/components/ui/card/card-description.svelte";
    import CardHeader from "$lib/components/ui/card/card-header.svelte";
    import CardTitle from "$lib/components/ui/card/card-title.svelte";
    import Card from "$lib/components/ui/card/card.svelte";

    type Props = {
        title: string;
        slug: string;
        id: string;
        updatedAt: Date;
        createdAt: Date;
    };

    let { title, slug, updatedAt }: Props = $props();
</script>

<a href="/workspaces/{slug}" class="group/card block hover:scale-101 hover:transition-transform">
    <Card class="group-hover/card:shadow-lg">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>

        <CardContent>
            <CardDescription>
                Updated {updatedAt.toLocaleDateString()}
                {updatedAt.toLocaleTimeString()}
            </CardDescription>
        </CardContent>
    </Card>
</a>
