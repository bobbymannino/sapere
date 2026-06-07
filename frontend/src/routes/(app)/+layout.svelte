<script lang="ts">
  import Header from "./header.svelte";

  let { children } = $props();
</script>

<div class="min-h-dvh">
  <Header />

  <main class="">
    {@render children()}
  </main>
</div>
