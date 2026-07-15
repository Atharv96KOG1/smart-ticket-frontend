import { useCallback, useEffect, useState } from "react";
import { THEME_KEY } from "../constants/storage";
import type { Theme } from "../types/theme";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Keep the document attribute (used by styles.css) in sync with state.
  // The inline pre-paint script in index.html sets the initial attribute
  // before React mounts to avoid a flash of the wrong theme; this effect
  // takes over from there.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
