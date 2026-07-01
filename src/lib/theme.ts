export type ThemeMode = "system" | "dark" | "light";

export function isThemeMode(value?: string): value is ThemeMode {
  return value === "system" || value === "dark" || value === "light";
}
