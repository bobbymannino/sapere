<script lang="ts">
    import CardContent from "$lib/components/ui/card/card-content.svelte";
    import CardHeader from "$lib/components/ui/card/card-header.svelte";
    import CardTitle from "$lib/components/ui/card/card-title.svelte";
    import Card from "$lib/components/ui/card/card.svelte";
    import type { PageProps } from "./$types";
    import NewWorkspaceForm from "./new-workspace-form.svelte";

    let { form }: PageProps = $props();
</script>

<main class="flex-center p-5">
    <Card class="max-w-lg w-full">
        <CardHeader>
            <CardTitle>New Workspace</CardTitle>
        </CardHeader>

        <CardContent>
            <NewWorkspaceForm />
        </CardContent>
    </Card>
</main>
