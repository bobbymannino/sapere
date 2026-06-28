<script lang="ts">
    import { refreshAll } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import CardContent from "$lib/components/ui/card/card-content.svelte";
    import CardDescription from "$lib/components/ui/card/card-description.svelte";
    import CardFooter from "$lib/components/ui/card/card-footer.svelte";
    import CardHeader from "$lib/components/ui/card/card-header.svelte";
    import CardTitle from "$lib/components/ui/card/card-title.svelte";
    import Card from "$lib/components/ui/card/card.svelte";
    import DialogContent from "$lib/components/ui/dialog/dialog-content.svelte";
    import DialogDescription from "$lib/components/ui/dialog/dialog-description.svelte";
    import DialogFooter from "$lib/components/ui/dialog/dialog-footer.svelte";
    import DialogHeader from "$lib/components/ui/dialog/dialog-header.svelte";
    import DialogTitle from "$lib/components/ui/dialog/dialog-title.svelte";
    import Dialog from "$lib/components/ui/dialog/dialog.svelte";
    import DropdownMenuContent from "$lib/components/ui/dropdown-menu/dropdown-menu-content.svelte";
    import DropdownMenuGroup from "$lib/components/ui/dropdown-menu/dropdown-menu-group.svelte";
    import DropdownMenuItem from "$lib/components/ui/dropdown-menu/dropdown-menu-item.svelte";
    import DropdownMenuLabel from "$lib/components/ui/dropdown-menu/dropdown-menu-label.svelte";
    import DropdownMenuTrigger from "$lib/components/ui/dropdown-menu/dropdown-menu-trigger.svelte";
    import DropdownMenu from "$lib/components/ui/dropdown-menu/dropdown-menu.svelte";
    import OptimizedImage from "$lib/components/optimized-image.svelte";
    import { formatDateTime, toIsoDate } from "$lib/date-format";
    import { EllipsisIcon, PictureIcon, SpinnerIcon, TrashIcon } from "$lib/icons";
    import type { WorkspaceCardSelection } from "$lib/server/db/workspaces";
    import { deleteWorkspaceCommand } from "$lib/workspaces.remote";

    type Props = WorkspaceCardSelection;

    let { id, title, slug, description, image, updatedAt }: Props = $props();
    let deleteOpen = $state(false);
    let deleteError = $state(null as string | null);
    let deleting = $derived(deleteWorkspaceCommand.pending > 0);
    let formattedUpdatedAt = $derived(formatDateTime(updatedAt));
    let updatedAtIso = $derived(toIsoDate(updatedAt));
    let imageUrl = $derived(`${resolve("/(app)/workspaces/[slug]/image", { slug })}?v=${updatedAt.getTime()}`);

    function openDeleteDialog() {
        deleteError = null;
        deleteOpen = true;
    }

    async function confirmDelete() {
        deleteError = null;

        try {
            await deleteWorkspaceCommand(id);
            deleteOpen = false;
            await refreshAll({ includeLoadFunctions: true });
        } catch (error) {
            deleteError = error instanceof Error ? error.message : "Failed to delete workspace";
        }
    }
</script>

<Card
    class="group/card h-full relative pt-0 hover:scale-101 motion-safe:hover:transition-transform hover:shadow-lg focus-within:ring-3 focus-within:border-ring focus-within:ring-ring/30"
>
    <a href={resolve("/(app)/workspaces/[slug]", { slug })} class="absolute inset-0 rounded-inherit z-10">
        <span class="sr-only">Open {title} workspace</span>
    </a>

    {#if image}
        <OptimizedImage src={imageUrl} alt="{title} thumbnail" class="aspect-video w-full" />
    {:else}
        <div class="bg-muted aspect-video flex-center">
            <PictureIcon class="text-muted-foreground" />
        </div>
    {/if}

    <CardHeader>
        <CardTitle>{title}</CardTitle>
    </CardHeader>

    {#if description}
        <CardContent>
            <CardDescription class="line-clamp-2 whitespace-pre-line">
                {description}
            </CardDescription>
        </CardContent>
    {/if}

    <CardFooter class="flex items-center justify-between mbs-auto">
        <CardDescription class="text-xs">
            Updated <time datetime={updatedAtIso}>{formattedUpdatedAt}</time>
        </CardDescription>

        <DropdownMenu>
            <DropdownMenuTrigger
                class={buttonVariants({ variant: "ghost", size: "icon-sm", class: "z-20" })}
                aria-label={`Open actions for ${title}`}
            >
                <EllipsisIcon />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" side="top">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        {#snippet child({ props })}
                            <a
                                {...props}
                                href={resolve("/(app)/workspaces/[slug]/edit", { slug })}
                                class={[props.class, "cursor-pointer"]}
                            >
                                Edit
                            </a>
                        {/snippet}
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onclick={openDeleteDialog}>Delete</DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>

        <Dialog bind:open={deleteOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete workspace?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete {title}. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                {#if deleteError}
                    <p class="text-destructive text-sm">{deleteError}</p>
                {/if}

                <DialogFooter>
                    <Button type="button" variant="outline" disabled={deleting} onclick={() => (deleteOpen = false)}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" disabled={deleting} onclick={confirmDelete}>
                        {#if deleting}
                            <SpinnerIcon class="animate-spin" />
                        {:else}
                            <TrashIcon />
                        {/if}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </CardFooter>
</Card>
