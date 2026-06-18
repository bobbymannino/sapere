<script lang="ts">
    import Card from "$lib/components/ui/card/card.svelte";
    import CardContent from "$lib/components/ui/card/card-content.svelte";
    import CardDescription from "$lib/components/ui/card/card-description.svelte";
    import CardHeader from "$lib/components/ui/card/card-header.svelte";
    import CardTitle from "$lib/components/ui/card/card-title.svelte";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();

    const dateFormatter = new Intl.DateTimeFormat(undefined, {
        dateStyle: "long",
        timeZone: "UTC",
    });
    let joinedAt = $derived(
        dateFormatter.format(new Date(data.session.user.createdAt)),
    );
    let joinedAtIso = $derived(
        new Date(data.session.user.createdAt).toISOString(),
    );
</script>

<section class="flex-center p-5">
    <Card class="max-w-lg w-full">
        <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account details.</CardDescription>
        </CardHeader>

        <CardContent>
            <dl class="flex flex-col gap-4">
                <div class="grid gap-1">
                    <dt class="text-muted-foreground text-sm">Email</dt>
                    <dd class="font-medium">{data.session.user.email}</dd>
                </div>
                <div class="grid gap-1">
                    <dt class="text-muted-foreground text-sm">Username</dt>
                    <dd class="font-medium">{data.session.user.username}</dd>
                </div>
                <div class="grid gap-1">
                    <dt class="text-muted-foreground text-sm">Joined at</dt>
                    <dd class="font-medium">
                        <time datetime={joinedAtIso}>{joinedAt}</time>
                    </dd>
                </div>
            </dl>
        </CardContent>
    </Card>
</section>
