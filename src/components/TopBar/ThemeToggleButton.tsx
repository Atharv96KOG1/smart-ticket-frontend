import type { Theme } from "../../types/theme";

interface ThemeToggleButtonProps {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggleButton({ theme, onToggle }: ThemeToggleButtonProps) {
  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={theme === "light"}
      onClick={onToggle}
    >
      <span className="theme-icon theme-icon-sun" aria-hidden="true">
        ☀️
      </span>
      <span className="theme-icon theme-icon-moon" aria-hidden="true">
        🌙
      </span>
    </button>
  );
}
