<script lang="ts">
    import { invalidateAll, onNavigate, refreshAll } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { page } from "$app/state";
    import type { WorkspaceCommandSelection } from "$db/workspaces";
    import { authClient } from "$lib/auth-client";
    import type { CommandBarActionCommand, CommandBarCommand } from "$lib/command-bar";
    import * as Button from "$lib/components/ui/button";
    import * as Command from "$lib/components/ui/command";
    import * as Kbd from "$lib/components/ui/kbd";
    import { setDocumentPinnedCommand } from "$lib/documents.remote";
    import { ErrorIcon, SearchIcon, SpinnerIcon } from "$lib/icons";
    import { flushSync } from "svelte";
    import CommandBarItem from "./command-bar-item.svelte";

    type Props = {
        workspaces: Promise<WorkspaceCommandSelection[]>;
    };

    let { workspaces }: Props = $props();

    let input: null | HTMLInputElement = $state(null);
    let open = $state(false);
    let pendingCommandId: string | null = $state(null);
    let commandError: string | null = $state(null);

    function openCommandBar() {
        flushSync(() => {
            open = true;
        });
        input?.focus({ preventScroll: true });
    }

    function closeCommandBar() {
        open = false;
    }

    function onkeydown(e: KeyboardEvent) {
        if (((page.data.isMac && e.metaKey) || (!page.data.isMac && e.ctrlKey)) && e.key === "k") {
            e.preventDefault();
            if (open) closeCommandBar();
            else openCommandBar();
        }
    }

    async function runCommandAction(command: CommandBarActionCommand) {
        if (pendingCommandId !== null) return;

        pendingCommandId = command.id;
        commandError = null;

        try {
            switch (command.action.type) {
                case "set-document-pinned":
                    await setDocumentPinnedCommand({
                        documentId: command.action.documentId,
                        pinned: command.action.pinned,
                    });
                    await refreshAll({ includeLoadFunctions: true });
                    break;
                case "sign-out":
                    await authClient.signOut();
                    await invalidateAll();
                    break;
            }
        } catch (caught) {
            commandError = caught instanceof Error ? caught.message : "Failed to run command";
        } finally {
            pendingCommandId = null;
        }
    }

    onNavigate(closeCommandBar);

    const customCommands = $derived(
        page.data.commands?.reduce(
            (acc, c) => {
                const r = acc[c.group] ?? [];
                acc[c.group] = [...r, c];
                return acc;
            },
            {} as Record<string, CommandBarCommand[]>,
        ) ?? {},
    );
</script>

<svelte:window {onkeydown} />

<Button.Root
    type="button"
    variant="outline"
    aria-label="Open command bar"
    aria-keyshortcuts="Meta+K Control+K"
    onclick={openCommandBar}
    class="hidden can-hover:flex"
>
    <SearchIcon />
    <span class="me-5">Search</span>
    <Kbd.Group>
        <Kbd.Root>{page.data.isMac ? "⌘" : "Ctrl"}</Kbd.Root>
        <Kbd.Root>K</Kbd.Root>
    </Kbd.Group>
</Button.Root>
<Button.Root
    type="button"
    variant="outline"
    size="icon"
    aria-label="Open command bar"
    onclick={openCommandBar}
    class="can-hover:hidden"
>
    <SearchIcon />
</Button.Root>

<Command.Dialog bind:open>
    <Command.Input placeholder="Type a command or search..." bind:ref={input} autofocus />
    <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        {#if commandError}
            <Command.Item disabled>
                <ErrorIcon class="text-destructive" />
                <span>{commandError}</span>
            </Command.Item>
            <Command.Separator />
        {/if}

        {#each Object.entries(customCommands) as [group, commands] (group)}
            <Command.Group heading={group}>
                {#each commands as c (c.id)}
                    <CommandBarItem
                        command={c}
                        {group}
                        pending={pendingCommandId === c.id}
                        disabled={pendingCommandId !== null}
                        onAction={runCommandAction}
                    />
                {/each}
            </Command.Group>

            <Command.Separator />
        {/each}

        <Command.Group heading="Workspaces">
            <CommandBarItem
                command={{
                    id: "workspaces",
                    group: "Workspace",
                    label: "Workspaces",
                    icon: "workspace",
                    href: resolve("/(app)/workspaces"),
                }}
            />
            {#await workspaces}
                <Command.Item disabled>
                    <SpinnerIcon class="animate-spin" />
                    <span>Loading workspaces...</span>
                </Command.Item>
            {:then workspaces}
                {#each workspaces as w (w.id)}
                    <CommandBarItem
                        command={{
                            id: w.id,
                            group: "Workspace",
                            label: w.title,
                            icon: "workspace",
                            href: resolve("/(app)/workspaces/[slug]", { slug: w.slug }),
                        }}
                    />
                {/each}
            {/await}
        </Command.Group>

        <Command.Separator />

        {#await workspaces}
            <Command.Group heading="Documents">
                <Command.Item disabled>
                    <SpinnerIcon class="animate-spin" />
                    <span>Loading documents...</span>
                </Command.Item>
                <Command.Separator />
            </Command.Group>
        {:then workspaces}
            {#if workspaces.length}
                <Command.Group heading="Documents">
                    {#each workspaces as w (w.id)}
                        <CommandBarItem
                            command={{
                                id: `${w.id}-documents`,
                                group: "Documents",
                                label: w.title,
                                icon: "markdown",
                                href: resolve("/(app)/workspaces/[slug]/documents", { slug: w.slug }),
                            }}
                        />
                    {/each}
                    <Command.Separator />
                </Command.Group>
            {/if}
        {/await}

        <Command.Group heading="Account">
            <CommandBarItem
                command={{
                    id: "account",
                    group: "Account",
                    label: "Account",
                    icon: "user",
                    href: resolve("/(app)/account"),
                }}
            />
            <CommandBarItem
                command={{
                    id: "sign-out",
                    group: "Account",
                    label: "Sign out",
                    icon: "exit",
                    action: { type: "sign-out" },
                }}
                pending={pendingCommandId === "sign-out"}
                disabled={pendingCommandId !== null}
                onAction={runCommandAction}
            />
        </Command.Group>
    </Command.List>
</Command.Dialog>
