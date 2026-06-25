<script lang="ts">
    import { resolve } from "$app/paths";
    import { buttonVariants } from "$lib/components/ui/button";
    import Button from "$lib/components/ui/button/button.svelte";
    import CardContent from "$lib/components/ui/card/card-content.svelte";
    import CardDescription from "$lib/components/ui/card/card-description.svelte";
    import CardHeader from "$lib/components/ui/card/card-header.svelte";
    import CardTitle from "$lib/components/ui/card/card-title.svelte";
    import Card from "$lib/components/ui/card/card.svelte";
    import Dialog from "$lib/components/ui/dialog/dialog.svelte";
    import DropdownMenuContent from "$lib/components/ui/dropdown-menu/dropdown-menu-content.svelte";
    import DropdownMenuGroup from "$lib/components/ui/dropdown-menu/dropdown-menu-group.svelte";
    import DropdownMenuItem from "$lib/components/ui/dropdown-menu/dropdown-menu-item.svelte";
    import DropdownMenuLabel from "$lib/components/ui/dropdown-menu/dropdown-menu-label.svelte";
    import DropdownMenuTrigger from "$lib/components/ui/dropdown-menu/dropdown-menu-trigger.svelte";
    import DropdownMenu from "$lib/components/ui/dropdown-menu/dropdown-menu.svelte";
    import { formatDateTime, toIsoDate } from "$lib/date-format";
    import { EllipsisIcon } from "$lib/icons";
    import type { WorkspaceCardSelection } from "$lib/server/db/workspaces";

    type Props = WorkspaceCardSelection;

    let { title, slug, description, image, updatedAt }: Props = $props();
    let formattedUpdatedAt = $derived(formatDateTime(updatedAt));
    let updatedAtIso = $derived(toIsoDate(updatedAt));
    let imageUrl = $derived(resolve("/(app)/workspaces/[slug]/image", { slug }));
</script>

<a
    href={resolve("/(app)/workspaces/[slug]", { slug })}
    class="group/card block hover:scale-101 motion-safe:hover:transition-transform"
>
    <Card class="group-hover/card:shadow-lg pt-0">
        <CardHeader class="px-0">
            {#if image}
                <img src={imageUrl} alt="" class="aspect-video w-full object-cover" />
            {:else}
                <div class="aspect-video w-full bg-gray-100"></div>
            {/if}
        </CardHeader>

        <CardContent>
            <CardTitle>{title}</CardTitle>
            {#if description}
                <CardDescription class="line-clamp-2 whitespace-pre-line">
                    {description}
                </CardDescription>
            {/if}
        </CardContent>

        <CardContent>
            <CardDescription>
                Updated <time datetime={updatedAtIso}>{formattedUpdatedAt}</time>
            </CardDescription>

            <div class="ml-auto flex justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger class={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
                        <EllipsisIcon />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" side="top">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                {#snippet child()}
                                    <Button href="/workspaces/{slug}/edit" class="w-full justify-start" variant="ghost">
                                        Edit
                                    </Button>
                                {/snippet}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </CardContent>
    </Card>
</a>
