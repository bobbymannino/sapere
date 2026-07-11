<script lang="ts">
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import { DarkModeIcon, MoonIcon, SunIcon } from "$lib/icons";
  import { isThemeMode, type ThemeMode } from "$lib/theme";
  import { setMode, userPrefersMode } from "mode-watcher";

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
    onclick={(event) => keepSelectedThemeMode(event, "system")}
    onkeydown={(event) => keepSelectedThemeModeFromKeyboard(event, "system")}
    aria-label="Use system theme"
    value="system"
  >
    <DarkModeIcon />
  </ToggleGroup.Item>
  <ToggleGroup.Item
    onclick={(event) => keepSelectedThemeMode(event, "dark")}
    onkeydown={(event) => keepSelectedThemeModeFromKeyboard(event, "dark")}
    aria-label="Use dark theme"
    value="dark"
  >
    <MoonIcon />
  </ToggleGroup.Item>
  <ToggleGroup.Item
    onclick={(event) => keepSelectedThemeMode(event, "light")}
    onkeydown={(event) => keepSelectedThemeModeFromKeyboard(event, "light")}
    aria-label="Use light theme"
    value="light"
  >
    <SunIcon />
  </ToggleGroup.Item>
</ToggleGroup.Root>
