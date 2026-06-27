<script lang="ts">
    import { page } from "$app/state";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import SidebarTrigger from "$lib/components/ui/sidebar/sidebar-trigger.svelte";
</script>

{#if page.data.breadcrumbs?.length}
    <header class="p-5">
        <Breadcrumb.Root>
            <Breadcrumb.List>
                <Breadcrumb.Item>
                    <SidebarTrigger />
                </Breadcrumb.Item>
                {#each page.data.breadcrumbs as b (b)}
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item>
                        {#if b.href}
                            <Breadcrumb.Link href={b.href}>{b.label}</Breadcrumb.Link>
                        {:else}
                            <Breadcrumb.Page>{b.label}</Breadcrumb.Page>
                        {/if}
                    </Breadcrumb.Item>
                {/each}
            </Breadcrumb.List>
        </Breadcrumb.Root>
    </header>
{/if}
