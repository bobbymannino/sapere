<script lang="ts">
  import { APP_NAME } from "$app/env/public";
  import ThemeToggle from "$lib/components/theme-toggle.svelte";
  import * as Button from "$lib/components/ui/button";
  import { GitHubIcon } from "$lib/icons";

  const year = new Date().getFullYear();
</script>

<footer class="border-border flex items-center justify-between border-t p-5">
  <Button.Root
    variant="ghost"
    size="icon-sm"
    href="https://github.com/bobbymannino/sapere"
    title="Open GitHub repository"
    target="_blank"
    rel="noopener noreferrer"
  >
    <GitHubIcon />
  </Button.Root>

  <ThemeToggle />

  <small class="text-muted-foreground">
    &copy; {year}
    {APP_NAME}
  </small>
</footer>
