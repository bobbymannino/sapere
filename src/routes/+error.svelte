<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import Empty from "$lib/components/empty.svelte";
  import Meta from "$lib/components/meta.svelte";
  import { Button } from "$lib/components/ui/button";
  import { ChevronLeftIcon, CircleErrorIcon } from "$lib/icons";

  let isNotFound = $derived(page.status === 404);
  let title = $derived(isNotFound ? "Page not found" : "Something went wrong");
  let description = $derived(
    isNotFound
      ? "The page you are looking for does not exist or has moved."
      : (page.error?.message ?? "An unexpected error occurred."),
  );
</script>

<Meta {title} {description} robots="noindex,nofollow" />

<main class="flex-center min-h-svh p-5">
  <div class="w-full max-w-lg">
    <Empty {title} {description} icon={CircleErrorIcon} color="destructive">
      <div class="flex flex-wrap justify-center gap-2">
        <Button href={resolve("/(app)/workspaces")}>
          <ChevronLeftIcon data-icon="inline-start" />
          Workspaces
        </Button>
        <Button variant="outline" href={page.url.pathname}>Try again</Button>
      </div>
    </Empty>
  </div>
</main>
