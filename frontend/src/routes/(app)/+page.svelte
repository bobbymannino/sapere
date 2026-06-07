<script lang="ts">
  import { resolve } from "$app/paths";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<div class="p-6 stack">
  <h1>Workspaces</h1>

  <ol class='stack'>
    {#each data.workspaces.items as w (w.id)}
        {const href = resolve("/workspaces/[slug]", { slug: `${w.slug}-${w.id}` })}
      <li>
        <a {href} class='rounded-md p-6 border border-crust bg-mantle block hover:scale-102 motion-safe:not-hover:transition-transform'>
            <h3>
                {w.title}
            </h3>
            {#if w.description}
                <p>{w.description}</p>
            {/if}
            <p>
                <small>Created {w.createdAt.toLocaleString()} • Updated {w.updatedAt.toLocaleString()}</small>
            </p>
        </a>
      </li>
    {/each}
  </ol>
</div>
