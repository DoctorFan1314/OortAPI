"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";

type Theme = "dark" | "light" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: Theme): "dark" | "light" {
  return theme === "system" ? getSystemTheme() : theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(STORAGE_KEYS.theme) as Theme) || getSystemTheme();
    }
    return "dark";
  });
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const stored = (localStorage.getItem(STORAGE_KEYS.theme) as Theme) || getSystemTheme();
      return resolveTheme(stored);
    }
    return "dark";
  });
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMountRef = useRef(true);

  // Apply theme when it changes
  // On mount, isInitial=true so no transition animation plays
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    if (typeof window !== "undefined") {
      const isInitial = isInitialMountRef.current;
      isInitialMountRef.current = false;
      applyTheme(resolved, isInitial, transitionTimeoutRef);
    }
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        const resolved = getSystemTheme();
        setResolvedTheme(resolved);
        applyTheme(resolved, false, transitionTimeoutRef);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.theme, newTheme);
    // resolvedTheme and DOM updates are handled by the useEffect above
  }, []);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(resolved: "dark" | "light", isInitial: boolean, timeoutRef?: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) {
  const root = document.documentElement;
  const isDark = resolved === "dark";
  // Only apply transition on explicit user-initiated theme change, not on initial load
  if (!isInitial) {
    root.style.transition = "background-color 0.3s, color 0.3s, border-color 0.3s";
  }
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  if (!isInitial) {
    // Clear any pending transition cleanup timeout before setting a new one
    if (timeoutRef?.current) clearTimeout(timeoutRef.current);
    // Remove transition after it completes to avoid interfering with other animations
    const id = setTimeout(() => {
      root.style.transition = "";
      if (timeoutRef) timeoutRef.current = null;
    }, 350);
    if (timeoutRef) timeoutRef.current = id;
  }
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
