<script lang="ts">
    import { invalidateAll, onNavigate, refreshAll } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { page } from "$app/state";
    import type { WorkspaceCommandSelection } from "$db/workspaces";
    import { authClient } from "$lib/auth-client";
    import type { CommandBarAction, CommandBarCommand } from "$lib/command-bar";
    import * as Button from "$lib/components/ui/button";
    import * as Command from "$lib/components/ui/command";
    import * as Kbd from "$lib/components/ui/kbd";
    import { setDocumentPinnedCommand } from "$lib/documents.remote";
    import {
        ErrorIcon,
        ExitIcon,
        MarkdownIcon,
        PencilIcon,
        PinIcon,
        PlusIcon,
        SearchIcon,
        SpinnerIcon,
        type IconComponent,
        UnpinIcon,
        UserIcon,
        WorkspaceIcon,
    } from "$lib/icons";
    import { flushSync } from "svelte";

    type Props = {
        workspaces: Promise<WorkspaceCommandSelection[]>;
    };

    type ActionCommand = Extract<CommandBarCommand, { action: CommandBarAction }>;

    let { workspaces }: Props = $props();

    let input: null | HTMLInputElement = $state(null);
    let open = $state(false);
    let signingOut = $state(false);
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

    async function signOut() {
        signingOut = true;
        try {
            await authClient.signOut();
            await invalidateAll();
        } finally {
            signingOut = false;
        }
    }

    function isActionCommand(command: CommandBarCommand): command is ActionCommand {
        return "action" in command;
    }

    function getCommandIcon(icon: CommandBarCommand["icon"]): IconComponent {
        switch (icon) {
            case "workspace":
                return WorkspaceIcon;
            case "markdown":
                return MarkdownIcon;
            case "new":
                return PlusIcon;
            case "edit":
                return PencilIcon;
            case "pin":
                return PinIcon;
            case "unpin":
                return UnpinIcon;
        }
    }

    async function runCommandAction(command: ActionCommand) {
        if (pendingCommandId !== null) return;

        pendingCommandId = command.id;
        commandError = null;

        try {
            switch (command.action.type) {
                case "set-document-pinned":
                    await setDocumentPinnedCommand({
                        workspaceSlug: command.action.workspaceSlug,
                        documentSlug: command.action.documentSlug,
                        pinned: command.action.pinned,
                    });
                    await refreshAll({ includeLoadFunctions: true });
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

{#snippet commandContent(c: CommandBarCommand, group: string)}
    {@const Icon = getCommandIcon(c.icon)}
    {#if pendingCommandId === c.id}
        <SpinnerIcon class="animate-spin opacity-20" />
    {:else}
        <Icon class="opacity-20" />
    {/if}
    <span>{c.label}</span>
    <span class="ms-auto opacity-20">{group}</span>
{/snippet}

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
                    {#if "href" in c}
                        <Command.Item>
                            {#snippet child({ props })}
                                <a {...props} href={c.href}>
                                    {@render commandContent(c, group)}
                                </a>
                            {/snippet}
                        </Command.Item>
                    {:else if isActionCommand(c)}
                        <Command.Item onclick={() => void runCommandAction(c)} disabled={pendingCommandId !== null}>
                            {#snippet child({ props })}
                                <button
                                    type="button"
                                    {...props}
                                    class={[props.class, "w-full"]}
                                    disabled={pendingCommandId !== null}
                                >
                                    {@render commandContent(c, group)}
                                </button>
                            {/snippet}
                        </Command.Item>
                    {/if}
                {/each}
            </Command.Group>

            <Command.Separator />
        {/each}

        <Command.Group heading="Workspaces">
            <Command.Item>
                {#snippet child({ props })}
                    <a {...props} href={resolve("/(app)/workspaces")}>
                        <WorkspaceIcon class="opacity-20" />
                        <span>Workspaces</span>
                        <span class="ms-auto opacity-20">Workspace</span>
                    </a>
                {/snippet}
            </Command.Item>
            {#await workspaces}
                <Command.Item disabled>
                    <SpinnerIcon class="animate-spin" />
                    <span>Loading workspaces...</span>
                </Command.Item>
            {:then workspaces}
                {#each workspaces as w (w.id)}
                    <Command.Item>
                        {#snippet child({ props })}
                            <a {...props} href={resolve("/(app)/workspaces/[slug]", { slug: w.slug })}>
                                <WorkspaceIcon class="opacity-20" />
                                <span>{w.title}</span>
                                <span class="ms-auto opacity-20">Workspace</span>
                            </a>
                        {/snippet}
                    </Command.Item>
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
                        <Command.Item>
                            {#snippet child({ props })}
                                <a {...props} href={resolve("/(app)/workspaces/[slug]/documents", { slug: w.slug })}>
                                    <MarkdownIcon class="opacity-20" />
                                    <span>{w.title}</span>
                                    <span class="ms-auto opacity-20">Documents</span>
                                </a>
                            {/snippet}
                        </Command.Item>
                    {/each}
                    <Command.Separator />
                </Command.Group>
            {/if}
        {/await}

        <Command.Group heading="Account">
            <Command.Item>
                {#snippet child({ props })}
                    <a {...props} href={resolve("/(app)/account")}>
                        <UserIcon class="opacity-20" />
                        <span>Account</span>
                        <span class="ms-auto opacity-20">Account</span>
                    </a>
                {/snippet}
            </Command.Item>
            <Command.Item onclick={signOut} disabled={signingOut}>
                {#snippet child({ props })}
                    <button type="button" {...props} class={[props.class, "w-full"]}>
                        {#if signingOut}<SpinnerIcon class="animate-spin" />{:else}<ExitIcon class="opacity-20" />{/if}
                        <span>Sign out</span>
                        <span class="ms-auto opacity-20">Account</span>
                    </button>
                {/snippet}
            </Command.Item>
        </Command.Group>
    </Command.List>
</Command.Dialog>
