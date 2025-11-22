// frontend/src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

/**
 * ThemeContext
 *
 * - Persists preference in localStorage ("theme" = "light" | "dark" | "system")
 * - Applies `dark` class on document.documentElement for Tailwind `dark:` utilities.
 * - Supports "system" (follows prefers-color-scheme).
 * - Smooth CSS transition helper toggled briefly when switching.
 *
 * Usage:
 * const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
 *
 * theme: "light" | "dark" | "system"   // user's choice
 * resolvedTheme: "light" | "dark"      // actual applied theme
 */

const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

const STORAGE_KEY = "theme"; // localStorage key

// small util: read system preference
const getSystemTheme = () =>
  typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw || "system";
    } catch {
      return "system";
    }
  });

  // resolvedTheme = actual applied (light/dark)
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const initial = (() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw || raw === "system") return getSystemTheme();
        return raw;
      } catch {
        return getSystemTheme();
      }
    })();
    return initial;
  });

  // helper to update DOM class and optionally animate
  const applyTheme = useCallback((target) => {
    try {
      const root = document.documentElement;
      // add small transition to prevent abrupt flash
      root.classList.add("theme-transition");
      window.setTimeout(() => root.classList.remove("theme-transition"), 300);

      if (target === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } catch (err) {
      // noop
    }
  }, []);

  // handle system changes (if theme === 'system')
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        const sys = getSystemTheme();
        setResolvedTheme(sys);
        applyTheme(sys);
      }
    };
    if (mq && mq.addEventListener) {
      mq.addEventListener("change", handler);
    } else if (mq && mq.addListener) {
      mq.addListener(handler);
    }
    return () => {
      if (mq && mq.removeEventListener) {
        mq.removeEventListener("change", handler);
      } else if (mq && mq.removeListener) {
        mq.removeListener(handler);
      }
    };
  }, [theme, applyTheme]);

  // whenever `theme` changes, persist + apply
  useEffect(() => {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    setResolvedTheme(resolved);
    applyTheme(resolved);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore write errors
    }
  }, [theme, applyTheme]);

  // toggle helper
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === "dark") return "light";
      if (prev === "light") return "system";
      return "dark";
    });
  }, []);

  const setTheme = useCallback((value) => {
    // allowed values: "dark" | "light" | "system"
    if (!["dark", "light", "system"].includes(value)) return;
    setThemeState(value);
  }, []);

  // ensure CSS helper class exists: you should add this in globals.css:
  // .theme-transition { transition: background-color 150ms ease, color 150ms ease; }
  // Tailwind users: you can add `.theme-transition` utilities in globals.css if needed.

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
