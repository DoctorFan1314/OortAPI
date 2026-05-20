"use client";

import { useEffect } from "react";

/**
 * Tracks global mouse position and sets CSS variables on `<html>`:
 *   --mouse-x: 0–1 (normalized clientX / innerWidth)
 *   --mouse-y: 0–1 (normalized clientY / innerHeight)
 * These drive the grid parallax and full-screen spotlight.
 */
export function useGlobalMousePosition() {
  useEffect(() => {
    let rafId = 0;
    const handler = (e: MouseEvent) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        document.documentElement.style.setProperty("--mouse-x", String(x));
        document.documentElement.style.setProperty("--mouse-y", String(y));
      });
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handler);
    };
  }, []);
}
