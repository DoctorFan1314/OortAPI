"use client";

import { useRef, useCallback } from "react";

/**
 * Attach to a card element. On mousemove, sets CSS variables
 * `--spotlight-x` and `--spotlight-y` (0–1) on the element,
 * which the `.glass-card::before` pseudo-element uses to position
 * the spotlight radial gradient.
 */
export function useSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      el.style.setProperty("--spotlight-x", String(Math.min(Math.max(x, 0), 1)));
      el.style.setProperty("--spotlight-y", String(Math.min(Math.max(y, 0), 1)));
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Optional: reset to center for clean transition out
    const el = ref.current;
    if (el) {
      el.style.setProperty("--spotlight-x", "0.5");
      el.style.setProperty("--spotlight-y", "0.5");
    }
  }, []);

  return { ref, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}
