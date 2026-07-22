<script lang="ts">
  import { APP_NAME } from "$app/env/public";
  import legoMe from "$lib/assets/lego-me.png?enhanced&w=64";
  import ThemeToggle from "$lib/components/theme-toggle.svelte";
  import * as Button from "$lib/components/ui/button";
  import { GitHubIcon } from "$lib/icons";

  const year = new Date().getFullYear();
</script>

<footer class="border-border flex items-center justify-between border-t p-5">
  <div class="flex items-center gap-2">
    <Button.Root
      variant="ghost"
      size="icon-sm"
      href="https://github.com/bobbymannino/sapere"
      title="Open GitHub repository"
      target="_blank"
      rel="noopener noreferrer"
    >
      <GitHubIcon class="size-5" />
    </Button.Root>

    <Button.Root
      variant="ghost"
      size="icon-sm"
      href="https://github.com/bobbymannino"
      title="Open GitHub profile"
      target="_blank"
      rel="noopener noreferrer"
    >
      <enhanced:img src={legoMe} alt="Bob Mannino" class="size-5 rounded-full object-cover" loading="lazy" />
    </Button.Root>
  </div>

  <ThemeToggle />

  <small class="text-muted-foreground">
    &copy; {year}
    {APP_NAME}
  </small>
</footer>
