"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook that returns a ref — when the element scrolls into view,
 * it gets the "visible" class which triggers the CSS fadeInUp animation.
 */
export function useScrollIn<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return { ref, visible };
}
