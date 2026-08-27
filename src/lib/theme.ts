import { mode, setMode, systemPrefersMode } from "mode-watcher";
import { tick } from "svelte";
import { prefersReducedMotion } from "svelte/motion";

export type ThemeMode = "system" | "dark" | "light";

export function isThemeMode(value?: string): value is ThemeMode {
  return value === "system" || value === "dark" || value === "light";
}

/** Where the theme reveal circle grows from, in viewport coordinates. */
export type RevealOrigin = { x: number; y: number };

/**
 * Applies the given theme mode, revealing it with a circle that grows from
 * `origin` (the viewport centre by default) until it covers the screen. The
 * circle itself is animated by the `theme-reveal` keyframes in `layout.css`;
 * this only feeds it the geometry.
 *
 * Falls back to an instant change when the resolved theme isn't actually
 * changing, when the user prefers reduced motion, or when the browser has no
 * view transitions.
 */
export function setModeWithReveal(newMode: ThemeMode, origin?: RevealOrigin) {
  const nextTheme = newMode === "system" ? systemPrefersMode.current : newMode;

  if (
    nextTheme === mode.current ||
    prefersReducedMotion.current ||
    typeof document.startViewTransition !== "function"
  ) {
    setMode(newMode);
    return;
  }

  const { x, y } = origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  const { style } = document.documentElement;
  style.setProperty("--reveal-x", `${x}px`);
  style.setProperty("--reveal-y", `${y}px`);
  style.setProperty("--reveal-radius", `${radius}px`);

  document.startViewTransition(async () => {
    setMode(newMode);
    await tick();
  });
}
