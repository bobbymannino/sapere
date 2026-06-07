<script lang="ts">
  import { resolve } from "$app/paths";
  import PlaceholderIcon from "$lib/icons/placeholder-icon.svelte";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<div class="stack h-full p-6">
  <h1>Workspaces</h1>

  {#if data.workspaces.items.length === 0}
    <div class="stack my-auto items-center">
      <div class="text-primary bg-primary/10 w-fit rounded-full p-3 md:p-4">
        <PlaceholderIcon class="size-6 md:size-12" />
      </div>
      <h2>Empty</h2>
      <p>It seems you have no workspaces, maybe clear some filters</p>
    </div>
  {:else}
    <ol class="stack">
      {#each data.workspaces.items as w (w.id)}
        {const href = resolve("/workspaces/[slug]", { slug: `${w.slug}-${w.id}` })}
        <li>
          <a
            {href}
            class="border-crust bg-mantle block rounded-md border p-6 hover:scale-102 motion-safe:not-hover:transition-transform"
          >
            <h3>
              {w.title}
            </h3>
            {#if w.description}
              <p>{w.description}</p>
            {/if}
            <p>
              <small
                >Created {w.createdAt.toLocaleString()} • Updated
                {w.updatedAt.toLocaleString()}</small
              >
            </p>
          </a>
        </li>
      {/each}
    </ol>
  {/if}
</div>
