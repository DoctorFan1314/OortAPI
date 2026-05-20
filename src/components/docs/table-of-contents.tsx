"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const pathname = usePathname();
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll("h2, h3")).map((h) => {
      const text = h.textContent || "";
      const id = h.id || text.toLowerCase().replace(/\s+/g, "-");
      if (!h.id) h.id = id;
      return { id, text, level: h.tagName === "H2" ? 2 : 3 };
    });
    setItems(headings);

    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!best || entry.boundingClientRect.top < best.boundingClientRect.top) {
              best = entry;
            }
          }
        }
        if (best) setActiveId(best.target.id);
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [pathname]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <nav className="hidden xl:block w-56 shrink-0" aria-label="Table of contents">
      <div className="sticky top-24 space-y-1">
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          On this page
        </p>
        {items.map((item, i) => (
          <button
            key={`${item.id}-${i}`}
            onClick={() => scrollTo(item.id)}
            className={cn(
              "block w-full text-left text-xs transition-colors py-1 border-l-2",
              item.level === 3 ? "pl-4" : "pl-2",
              activeId === item.id
                ? "text-primary border-primary font-medium"
                : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground/30"
            )}
          >
            {item.text}
          </button>
        ))}
      </div>
    </nav>
  );
}
