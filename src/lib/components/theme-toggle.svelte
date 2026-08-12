<script lang="ts">
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import { pop } from "$lib/actions/pop";
  import { DarkModeIcon, MoonIcon, SunIcon } from "$lib/icons";
  import { isThemeMode, type ThemeMode } from "$lib/theme";
  import { setMode, userPrefersMode } from "mode-watcher";

  let systemIcon: HTMLElement | null = $state(null);
  let darkIcon: HTMLElement | null = $state(null);
  let lightIcon: HTMLElement | null = $state(null);

  function selectThemeMode(mode: string) {
    if (isThemeMode(mode)) {
      setMode(mode);
    }
  }

  function keepSelectedThemeMode(event: Event, mode: ThemeMode) {
    if (userPrefersMode.current === mode) {
      event.preventDefault();
    }
  }

  function keepSelectedThemeModeFromKeyboard(event: KeyboardEvent, mode: ThemeMode) {
    if (event.key !== "Enter" && event.key !== " ") return;
    keepSelectedThemeMode(event, mode);
  }
</script>

<ToggleGroup.Root
  aria-label="Theme toggle"
  type="single"
  variant="outline"
  size="sm"
  value={userPrefersMode.current}
  onValueChange={selectThemeMode}
>
  <ToggleGroup.Item
    onclick={(event) => {
      keepSelectedThemeMode(event, "system");
      if (systemIcon) pop(systemIcon);
    }}
    onkeydown={(event) => keepSelectedThemeModeFromKeyboard(event, "system")}
    aria-label="Use system theme"
    value="system"
  >
    <span bind:this={systemIcon} class="inline-flex"><DarkModeIcon /></span>
  </ToggleGroup.Item>
  <ToggleGroup.Item
    onclick={(event) => {
      keepSelectedThemeMode(event, "dark");
      if (darkIcon) pop(darkIcon);
    }}
    onkeydown={(event) => keepSelectedThemeModeFromKeyboard(event, "dark")}
    aria-label="Use dark theme"
    value="dark"
  >
    <span bind:this={darkIcon} class="inline-flex"><MoonIcon /></span>
  </ToggleGroup.Item>
  <ToggleGroup.Item
    onclick={(event) => {
      keepSelectedThemeMode(event, "light");
      if (lightIcon) pop(lightIcon);
    }}
    onkeydown={(event) => keepSelectedThemeModeFromKeyboard(event, "light")}
    aria-label="Use light theme"
    value="light"
  >
    <span bind:this={lightIcon} class="inline-flex"><SunIcon /></span>
  </ToggleGroup.Item>
</ToggleGroup.Root>
