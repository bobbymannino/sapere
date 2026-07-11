<script lang="ts">
  import Logo from "$lib/components/logo.svelte";
  import Card from "$lib/components/ui/card/card.svelte";

  import SiteFooter from "../site-footer.svelte";

  let { children } = $props();
</script>

<main class="grid min-h-svh grid-rows-[1fr_auto]">
  <div class="flex-center flex-col gap-5 p-5">
    <Logo class="text-primary w-20" />
    <Card class="w-full max-w-lg">
      {@render children()}
    </Card>
  </div>
  <SiteFooter />
</main>
