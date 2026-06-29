<script lang="ts">
    import { onNavigate } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { page } from "$app/state";
    import * as Button from "$lib/components/ui/button";
    import * as Command from "$lib/components/ui/command";
    import * as Kbd from "$lib/components/ui/kbd";
    import { SearchIcon } from "$lib/icons";

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
    class="min-w-24 justify-start"
    aria-label="Open command bar"
    aria-keyshortcuts="Meta+K Control+K"
    onclick={openCommandBar}
>
    <SearchIcon />
    <span class="can-hover:not-sr-only sr-only me-5!">Search</span>
    <Kbd.Group class="hidden can-hover:inline">
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
