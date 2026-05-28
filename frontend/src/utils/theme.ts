export type AppTheme = "light" | "dark";

const THEME_STORAGE_KEY = "appTheme";

export function getStoredTheme(): AppTheme {
  return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

export function applyTheme(theme: AppTheme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function toggleThemeValue(theme: AppTheme): AppTheme {
  return theme === "dark" ? "light" : "dark";
}
