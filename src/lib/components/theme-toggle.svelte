<script lang="ts">
  import { pop } from "$lib/actions/pop";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import { DarkModeIcon, type IconComponent, MoonIcon, SunIcon } from "$lib/icons";
  import { isThemeMode, type RevealOrigin, setModeWithReveal, type ThemeMode } from "$lib/theme";
  import { userPrefersMode } from "mode-watcher";

  const options: { mode: ThemeMode; label: string; icon: IconComponent }[] = [
    { mode: "system", label: "Use system theme", icon: DarkModeIcon },
    { mode: "dark", label: "Use dark theme", icon: MoonIcon },
    { mode: "light", label: "Use light theme", icon: SunIcon },
  ];

  let icons: HTMLElement[] = [];

  /** Set on activation, then consumed by the value change it triggers. */
  let revealOrigin: RevealOrigin | undefined;

  function selectThemeMode(mode: string) {
    if (isThemeMode(mode)) {
      setModeWithReveal(mode, revealOrigin);
    }
  }

  function activate(event: MouseEvent & { currentTarget: HTMLElement }, mode: ThemeMode, index: number) {
    // Re-selecting the current mode would clear the toggle group's value.
    if (userPrefersMode.current === mode) event.preventDefault();

    // Keyboard activation reports a click at (0, 0), so use the button instead.
    if (event.detail === 0) {
      const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
      revealOrigin = { x: left + width / 2, y: top + height / 2 };
    } else {
      revealOrigin = { x: event.clientX, y: event.clientY };
    }

    const icon = icons[index];
    if (icon) pop(icon);
  }

  function keepSelectedThemeModeFromKeyboard(event: KeyboardEvent, mode: ThemeMode) {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (userPrefersMode.current === mode) event.preventDefault();
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
  {#each options as option, index (option.mode)}
    <ToggleGroup.Item
      onclick={(event) => activate(event, option.mode, index)}
      onkeydown={(event) => keepSelectedThemeModeFromKeyboard(event, option.mode)}
      aria-label={option.label}
      value={option.mode}
    >
      <span bind:this={icons[index]} class="inline-flex"><option.icon /></span>
    </ToggleGroup.Item>
  {/each}
</ToggleGroup.Root>
