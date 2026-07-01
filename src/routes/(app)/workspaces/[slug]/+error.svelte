<script lang="ts">
    import { resolve } from "$app/paths";
    import { page } from "$app/state";
    import Empty from "$lib/components/empty.svelte";
    import Meta from "$lib/components/meta.svelte";
    import { Button } from "$lib/components/ui/button";
    import { ChevronLeftIcon, ErrorIcon, WorkspaceIcon } from "$lib/icons";

    let isNotFound = $derived(page.status === 404);
    let title = $derived(isNotFound ? "Workspace not found" : "Workspace unavailable");
    let description = $derived(
        isNotFound
            ? "This workspace may have been deleted, renamed, or you may not have access to it."
            : (page.error?.message ?? "The workspace could not be loaded."),
    );
    let icon = $derived(isNotFound ? WorkspaceIcon : ErrorIcon);
</script>

<Meta {title} {description} robots="noindex,nofollow" />

<section class="flex-center min-h-[calc(100svh-9rem)] p-5">
    <div class="w-full max-w-lg">
        <Empty {title} {description} {icon} color="destructive">
            <div class="flex flex-wrap justify-center gap-2">
                <Button href={resolve("/(app)/workspaces")}>
                    <ChevronLeftIcon data-icon="inline-start" />
                    Workspaces
                </Button>
                <Button variant="outline" href={page.url.pathname}>Try again</Button>
            </div>
        </Empty>
    </div>
</section>
