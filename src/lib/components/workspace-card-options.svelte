<script lang="ts">
    import * as Dropdown from "$lib/components/ui/dropdown-menu";
    import * as Button from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";
    import { EllipsisIcon, MarkdownIcon, PencilIcon, TrashIcon, SpinnerIcon, PinIcon, UnpinIcon } from "$lib/icons";
    import { resolve } from "$app/paths";
    import type { WorkspaceCardSelection } from "$db/workspaces";
    import { deleteWorkspaceCommand, setWorkspacePinnedCommand } from "$lib/workspaces.remote";
    import { refreshAll } from "$app/navigation";

    type Props = WorkspaceCardSelection & {
        onEdit?: (workspace: WorkspaceCardSelection) => void;
    };

    let { onEdit, ...workspace }: Props = $props();
    let { id, slug, title, pinnedAt } = $derived(workspace);

    type DeleteStatus = {
        error: string | null;
        modalOpen: boolean;
        isDeleting: boolean;
    };

    let deleteStatus: DeleteStatus = $state({
        error: null,
        modalOpen: false,
        isDeleting: false,
    });
    let isPinning = $state(false);

    async function deleteWorkspace() {
        deleteStatus = {
            error: null,
            modalOpen: true,
            isDeleting: true,
        };

        try {
            await deleteWorkspaceCommand(id);
            await refreshAll({ includeLoadFunctions: true });
            deleteStatus = {
                error: null,
                modalOpen: false,
                isDeleting: false,
            };
        } catch (error) {
            deleteStatus.error = error instanceof Error ? error.message : "Failed to delete workspace";
        }
    }

    function onEditClick(e: MouseEvent & { currentTarget: HTMLAnchorElement }) {
        if (
            !onEdit ||
            innerWidth < 640 || // bail if the screen is too small
            e.shiftKey || // or the link is opened in a new window
            e.metaKey ||
            e.ctrlKey || // or a new tab (mac: metaKey, win/linux: ctrlKey)
            e.button === 1 // mouse wheel
        )
            return;

        e.preventDefault();
        onEdit({ ...workspace });
    }

    async function togglePinned() {
        isPinning = true;
        try {
            await setWorkspacePinnedCommand({
                pinned: !pinnedAt,
                workspaceId: id,
            });
            await refreshAll({ includeLoadFunctions: true });
        } finally {
            isPinning = false;
        }
    }
</script>

<Dropdown.Root>
    <Dropdown.Trigger
        class={Button.buttonVariants({ variant: "ghost", size: "icon-sm", class: "z-20" })}
        aria-label={`Open actions for ${title}`}
    >
        <EllipsisIcon />
    </Dropdown.Trigger>

    <Dropdown.Content align="end" side="top">
        <Dropdown.Label>Actions</Dropdown.Label>
        <Dropdown.Group>
            <Dropdown.Item>
                {#snippet child({ props })}
                    <a
                        {...props}
                        href={resolve("/(app)/workspaces/[slug]/documents", { slug })}
                        class={[props.class, "cursor-pointer"]}
                    >
                        <MarkdownIcon />
                        <span>Documents</span>
                    </a>
                {/snippet}
            </Dropdown.Item>
            <Dropdown.Item>
                {#snippet child({ props })}
                    <a
                        {...props}
                        href={resolve("/(app)/workspaces/[slug]/edit", { slug })}
                        class={[props.class, "cursor-pointer"]}
                        onclick={onEditClick}
                    >
                        <PencilIcon />
                        <span>Edit</span>
                    </a>
                {/snippet}
            </Dropdown.Item>
            <Dropdown.Item onclick={togglePinned} disabled={isPinning}>
                {#if isPinning}
                    <SpinnerIcon class="animate-spin" />
                {:else if pinnedAt}
                    <UnpinIcon />
                {:else}
                    <PinIcon />
                {/if}
                <span>{pinnedAt ? "Unpin" : "Pin"}</span>
            </Dropdown.Item>
            <Dropdown.Item variant="destructive" onclick={() => (deleteStatus.modalOpen = true)}>
                <TrashIcon />
                <span>Delete</span>
            </Dropdown.Item>
        </Dropdown.Group>
    </Dropdown.Content>
</Dropdown.Root>

<Dialog.Root bind:open={deleteStatus.modalOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Delete workspace?</Dialog.Title>
            <Dialog.Description>
                This will permanently delete {title}. This action cannot be undone.
            </Dialog.Description>
        </Dialog.Header>

        {#if deleteStatus.error}
            <p class="text-destructive text-sm">{deleteStatus.error}</p>
        {/if}

        <Dialog.Footer>
            <Button.Root
                type="button"
                variant="outline"
                disabled={deleteStatus.isDeleting}
                onclick={() => (deleteStatus.modalOpen = false)}
            >
                Cancel
            </Button.Root>
            <Button.Root
                type="button"
                variant="destructive"
                disabled={deleteStatus.isDeleting}
                onclick={deleteWorkspace}
            >
                {#if deleteStatus.isDeleting}
                    <SpinnerIcon class="animate-spin" />
                {:else}
                    <TrashIcon />
                {/if}
                Delete
            </Button.Root>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
