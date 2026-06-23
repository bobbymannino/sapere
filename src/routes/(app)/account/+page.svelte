<script lang="ts">
    import Card from "$lib/components/ui/card/card.svelte";
    import CardContent from "$lib/components/ui/card/card-content.svelte";
    import CardDescription from "$lib/components/ui/card/card-description.svelte";
    import CardHeader from "$lib/components/ui/card/card-header.svelte";
    import CardTitle from "$lib/components/ui/card/card-title.svelte";
    import { formatDate, toIsoDate } from "$lib/date-format";
    import type { PageProps } from "./$types";
    import Breadcrumb from "$lib/components/ui/breadcrumb/breadcrumb.svelte";
    import BreadcrumbList from "$lib/components/ui/breadcrumb/breadcrumb-list.svelte";
    import SidebarTrigger from "$lib/components/ui/sidebar/sidebar-trigger.svelte";
    import BreadcrumbItem from "$lib/components/ui/breadcrumb/breadcrumb-item.svelte";
    import BreadcrumbSeparator from "$lib/components/ui/breadcrumb/breadcrumb-separator.svelte";
    import BreadcrumbPage from "$lib/components/ui/breadcrumb/breadcrumb-page.svelte";

    let { data }: PageProps = $props();

    let joinedAt = $derived(formatDate(data.session.user.createdAt));
    let joinedAtIso = $derived(toIsoDate(data.session.user.createdAt));
</script>

<header class="p-5">
    <Breadcrumb>
        <BreadcrumbList>
            <BreadcrumbItem>
                <SidebarTrigger />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbPage>Account</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>
</header>

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
