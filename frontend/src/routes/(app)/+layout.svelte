<script lang="ts">
  import Header from "./header.svelte";

  let { children } = $props();
</script>

<div class="min-h-svh grid-cols-[16rem_1fr] md:grid">
  <Header />

  <main class="">
    {@render children()}
  </main>
</div>
