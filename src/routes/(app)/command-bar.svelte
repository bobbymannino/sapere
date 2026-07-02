<script lang="ts">
    import { invalidateAll, onNavigate } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { page } from "$app/state";
    import type { WorkspaceCommandSelection } from "$db/workspaces";
    import { authClient } from "$lib/auth-client";
    import * as Button from "$lib/components/ui/button";
    import * as Command from "$lib/components/ui/command";
    import * as Kbd from "$lib/components/ui/kbd";
    import { MarkdownIcon, SearchIcon, SpinnerIcon, WorkspaceIcon } from "$lib/icons";
    import { flushSync } from "svelte";

    type Props = {
        workspaces: Promise<WorkspaceCommandSelection[]>;
    };

    let { workspaces }: Props = $props();

    let input: null | HTMLInputElement = $state(null);
    let open = $state(false);
    let signingOut = $state(false);

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
    <Command.Input placeholder="Type a command or search..." bind:ref={input} autofocus />
    <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        <Command.Group heading="Workspaces">
            <Command.Item>
                {#snippet child({ props })}
                    <a {...props} href={resolve("/(app)/workspaces")}>Workspaces</a>
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
            {/await}
        </Command.Group>
        <Command.Separator />
        <Command.Group heading="Account">
            <Command.Item>
                {#snippet child({ props })}
                    <a {...props} href={resolve("/(app)/account")}>Account</a>
                {/snippet}
            </Command.Item>
            <Command.Item onclick={signOut} disabled={signingOut}>
                {#if signingOut}<SpinnerIcon class="animate-spin" />{/if}
                <span>Sign out</span>
            </Command.Item>
        </Command.Group>
    </Command.List>
</Command.Dialog>
