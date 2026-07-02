<script lang="ts">
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { APP_NAME } from "$app/env/public";
    import { authClient } from "$lib/auth-client";
    import * as Collapsible from "$lib/components/ui/collapsible";
    import * as Sidebar from "$lib/components/ui/sidebar";
    import * as Dropdown from "$lib/components/ui/dropdown-menu";
    import {
        ChevronDownIcon,
        ChevronUpIcon,
        EllipsisIcon,
        ExitIcon,
        MarkdownIcon,
        SpinnerIcon,
        UserIcon,
        WorkspaceIcon,
    } from "$lib/icons";
    import Logo from "$lib/components/logo.svelte";
    import type { RecentWorkspaceSelection } from "$lib/server/db/workspaces";
    import type { RecentDocumentSelection } from "$lib/server/db/documents";
    import { page } from "$app/state";
    import RecentWorkspace from "./app-sidebar-recent-workspace.svelte";

    type Props = {
        username: string;
        recentWorkspaces: Promise<RecentWorkspaceSelection[]>;
        recentDocuments: Promise<RecentDocumentSelection[]>;
    };

    let { username, recentWorkspaces, recentDocuments }: Props = $props();

    let pending = $state(false);

    async function signOut() {
        pending = true;
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => goto(resolve("/(auth)/login"), { invalidateAll: true }),
            },
        });
        pending = false;
    }
</script>

<Sidebar.Root>
    <Sidebar.Header class="flex-row items-center py-3 px-5">
        <Logo class="w-5" />
        <span class="font-heading text-lg font-bold">
            {APP_NAME}
        </span>
    </Sidebar.Header>

    <Sidebar.Content>
        <Sidebar.Group>
            <Sidebar.GroupContent>
                <Sidebar.Menu>
                    <Collapsible.Root open class="group/collapsible">
                        <Sidebar.Group>
                            <Sidebar.GroupLabel>
                                {#snippet child({ props })}
                                    <Collapsible.Trigger {...props}>
                                        <WorkspaceIcon class="me-3" />
                                        Workspaces
                                        <ChevronDownIcon
                                            class="ms-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
                                        />
                                    </Collapsible.Trigger>
                                {/snippet}
                            </Sidebar.GroupLabel>

                            <Collapsible.Content>
                                <Sidebar.GroupContent>
                                    {#await recentWorkspaces}
                                        {#each { length: 4 }}
                                            <Sidebar.MenuItem>
                                                <Sidebar.MenuSkeleton />
                                            </Sidebar.MenuItem>
                                        {/each}
                                    {:then recentWorkspaces}
                                        {#each recentWorkspaces as w (w.id)}
                                            <RecentWorkspace {...w} />
                                        {/each}
                                    {/await}
                                    <Sidebar.MenuItem>
                                        <Sidebar.MenuButton isActive={page.url.pathname === "/workspaces"}>
                                            {#snippet child({ props })}
                                                <a {...props} href={resolve("/(app)/workspaces")}>
                                                    <span>All Workspaces</span>
                                                </a>
                                            {/snippet}
                                        </Sidebar.MenuButton>
                                    </Sidebar.MenuItem>
                                </Sidebar.GroupContent>
                            </Collapsible.Content>
                        </Sidebar.Group>
                    </Collapsible.Root>

                    <Sidebar.Separator />

                    <Collapsible.Root open class="group/collapsible">
                        <Sidebar.Group>
                            <Sidebar.GroupLabel>
                                {#snippet child({ props })}
                                    <Collapsible.Trigger {...props}>
                                        <MarkdownIcon class="me-3" />
                                        Documents
                                        <ChevronDownIcon
                                            class="ms-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
                                        />
                                    </Collapsible.Trigger>
                                {/snippet}
                            </Sidebar.GroupLabel>

                            <Collapsible.Content>
                                <Sidebar.GroupContent>
                                    {#await recentDocuments}
                                        {#each { length: 4 } as _, index (index)}
                                            <Sidebar.MenuItem>
                                                <Sidebar.MenuSkeleton />
                                            </Sidebar.MenuItem>
                                        {/each}
                                    {:then recentDocuments}
                                        {#each recentDocuments as document (document.id)}
                                            <Sidebar.MenuItem>
                                                <Sidebar.MenuButton
                                                    isActive={page.url.pathname ===
                                                        `/workspaces/${document.workspaceSlug}/documents/${document.slug}`}
                                                >
                                                    {#snippet child({ props })}
                                                        <a
                                                            {...props}
                                                            href={resolve(
                                                                "/(app)/workspaces/[slug]/documents/[docSlug]",
                                                                {
                                                                    slug: document.workspaceSlug,
                                                                    docSlug: document.slug,
                                                                },
                                                            )}
                                                        >
                                                            <span>{document.title}</span>
                                                        </a>
                                                    {/snippet}
                                                </Sidebar.MenuButton>
                                            </Sidebar.MenuItem>
                                        {:else}
                                            <Sidebar.MenuItem>
                                                <Sidebar.MenuButton aria-disabled="true">
                                                    No Documents
                                                </Sidebar.MenuButton>
                                            </Sidebar.MenuItem>
                                        {/each}
                                    {/await}
                                </Sidebar.GroupContent>
                            </Collapsible.Content>
                        </Sidebar.Group>
                    </Collapsible.Root>
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>
    </Sidebar.Content>

    <Sidebar.Footer>
        <Sidebar.Menu>
            <Sidebar.MenuItem>
                <Dropdown.Root>
                    <Dropdown.Trigger>
                        {#snippet child({ props })}
                            <Sidebar.MenuButton
                                {...props}
                                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                {username}
                                <ChevronUpIcon class="ms-auto" />
                            </Sidebar.MenuButton>
                        {/snippet}
                    </Dropdown.Trigger>
                    <Dropdown.Content side="top" class="w-(--bits-dropdown-menu-anchor-width)">
                        <Dropdown.Group>
                            <Dropdown.Item>
                                {#snippet child({ props })}
                                    <a
                                        {...props}
                                        href={resolve("/(app)/account")}
                                        class={[props.class, "cursor-pointer"]}
                                    >
                                        <UserIcon />
                                        Account
                                    </a>
                                {/snippet}
                            </Dropdown.Item>
                            <Dropdown.Item onclick={signOut} variant="destructive" disabled={pending}>
                                {#if pending}
                                    <SpinnerIcon class="animate-spin" />
                                {:else}
                                    <ExitIcon />
                                {/if}
                                <span>Sign out</span>
                            </Dropdown.Item>
                        </Dropdown.Group>
                    </Dropdown.Content>
                </Dropdown.Root>
            </Sidebar.MenuItem>
        </Sidebar.Menu>
    </Sidebar.Footer>

    <Sidebar.Rail />
</Sidebar.Root>
