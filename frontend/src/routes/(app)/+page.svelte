<script lang="ts">
  import { resolve } from "$app/paths";
  import Button from "$lib/components/button.svelte";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<div class="bg-mantle text-txt stack m-6 p-4">
  <h1>Welcome, {data.user.username}</h1>
  <Button href={resolve("/logout")} variant="destructive" data-sveltekit-preload-data="off">Logout</Button>
</div>

{#each { length: 10 }}
  <div class="p-4">
    <h1>Title</h1>
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores architecto nisi sunt, repellendus mollitia
      amet modi ex, illo neque illum maiores voluptatum eum distinctio, consectetur eos omnis suscipit eligendi corrupti
      odio vel odit. Quis vero ea numquam ratione saepe tempore, veritatis quisquam natus, minima nisi rem iure
      repellat! Voluptate, dolore!
    </p>
  </div>
{/each}
