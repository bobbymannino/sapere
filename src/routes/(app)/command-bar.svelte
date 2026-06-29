<script lang="ts">
    import { onNavigate } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { page } from "$app/state";
    import type { WorkspaceCommandSelection } from "$db/workspaces";
    import * as Button from "$lib/components/ui/button";
    import * as Command from "$lib/components/ui/command";
    import * as Kbd from "$lib/components/ui/kbd";
    import { SearchIcon } from "$lib/icons";

    type Props = {
        workspaces: WorkspaceCommandSelection[];
    };

    let { workspaces }: Props = $props();

    let open = $state(false);

    function openCommandBar() {
        open = true;
    }

    function closeCommandBar() {
        open = false;
    }

    function onkeydown(e: KeyboardEvent) {
        if (e.metaKey && e.key === "k") {
            e.preventDefault();
            open = !open;
        }
    }

    onNavigate(closeCommandBar);
</script>

<svelte:window {onkeydown} />

<Button.Root
    type="button"
    variant="outline"
    aria-label="Open command bar"
    aria-keyshortcuts="Meta+K Control+K"
    onclick={openCommandBar}
>
    <SearchIcon />
    <span class="me-5 hidden can-hover:block">Search</span>
    <Kbd.Group class="hidden can-hover:block">
        <Kbd.Root>{page.data.isMac ? "⌘" : "Ctrl"}</Kbd.Root>
        <Kbd.Root>K</Kbd.Root>
    </Kbd.Group>
</Button.Root>

<Command.Dialog bind:open>
    <Command.Input placeholder="Type a command or search..." />
    <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        <Command.Group heading="Workspaces">
            <Command.Item>
                {#snippet child({ props })}
                    <a {...props} href={resolve("/(app)/workspaces")}>Workspaces</a>
                {/snippet}
            </Command.Item>
            {#each workspaces as w (w.id)}
                <Command.Item>
                    {#snippet child({ props })}
                        <a {...props} href={resolve("/(app)/workspaces/[slug]", { slug: w.slug })}>{w.title}</a>
                    {/snippet}
                </Command.Item>
            {/each}
        </Command.Group>
        <Command.Separator />
        <Command.Group heading="Account">
            <Command.Item>
                {#snippet child({ props })}
                    <a {...props} href={resolve("/(app)/account")}>Account</a>
                {/snippet}
            </Command.Item>
        </Command.Group>
    </Command.List>
</Command.Dialog>
