<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import type { RecentWorkspaceSelection } from "$db/workspaces";
  import * as Dropdown from "$lib/components/ui/dropdown-menu";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { getRecentWorkspaceDocuments } from "$lib/documents.remote";
  import { EllipsisIcon, MarkdownIcon, PencilIcon, SpinnerIcon } from "$lib/icons";

  let { slug, title, id, index }: RecentWorkspaceSelection & { index?: number } = $props();

  let hasOpenedDropdown = $state(false);

  function dropdownOpenChange() {
    hasOpenedDropdown = true;
  }
</script>

<Sidebar.MenuSubItem class="group/menu-item" {index}>
  <Sidebar.MenuSubButton
    isActive={page.url.pathname === `/workspaces/${slug}`}
    href={resolve("/(app)/workspaces/[slug]", { slug })}
    class="pr-8"
  >
    <span>{title}</span>
  </Sidebar.MenuSubButton>
  <Dropdown.Root onOpenChange={dropdownOpenChange}>
    <Dropdown.Trigger>
      {#snippet child({ props })}
        <Sidebar.MenuAction {...props} showOnHover aria-label={`Open ${title} menu`} class="top-1 right-0.5">
          <EllipsisIcon />
        </Sidebar.MenuAction>
      {/snippet}
    </Dropdown.Trigger>

    <Dropdown.Content side="right" align="start" class="w-64">
      <Dropdown.Group>
        <Dropdown.GroupHeading>Documents</Dropdown.GroupHeading>

        {#if hasOpenedDropdown}
          {#await getRecentWorkspaceDocuments(id)}
            <Dropdown.Item disabled>
              <SpinnerIcon class="animate-spin" />
              <span>Loading...</span>
            </Dropdown.Item>
          {:then documents}
            {#each documents as document (document.id)}
              <Dropdown.Item>
                {#snippet child({ props })}
                  <a
                    {...props}
                    href={resolve("/(app)/workspaces/[slug]/documents/[docSlug]", {
                      slug: document.workspaceSlug,
                      docSlug: document.slug,
                    })}
                    class={[props.class, "cursor-pointer"]}
                  >
                    <span>{document.title}</span>
                  </a>
                {/snippet}
              </Dropdown.Item>
            {:else}
              <Dropdown.Item disabled>
                <span>No recent documents</span>
              </Dropdown.Item>
            {/each}
          {/await}
        {/if}

        <Dropdown.Item>
          {#snippet child({ props })}
            <a
              {...props}
              href={resolve("/(app)/workspaces/[slug]/documents", { slug })}
              class={[props.class, "cursor-pointer"]}
            >
              <MarkdownIcon />
              <span>All documents</span>
            </a>
          {/snippet}
        </Dropdown.Item>
      </Dropdown.Group>

      <Dropdown.Separator />

      <Dropdown.Group>
        <Dropdown.GroupHeading>Actions</Dropdown.GroupHeading>

        <Dropdown.Item>
          {#snippet child({ props })}
            <a
              {...props}
              href={resolve("/(app)/workspaces/[slug]/edit", { slug })}
              class={[props.class, "cursor-pointer"]}
            >
              <PencilIcon />
              <span>Edit</span>
            </a>
          {/snippet}
        </Dropdown.Item>
      </Dropdown.Group>
    </Dropdown.Content>
  </Dropdown.Root>
</Sidebar.MenuSubItem>
