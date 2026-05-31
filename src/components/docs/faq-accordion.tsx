"use client";

import { useState, useRef, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Accordion context (for single-open behaviour)                      */
/* ------------------------------------------------------------------ */

interface AccordionCtx {
  openId: string | null;
  toggle: (id: string) => void;
}

const AccordionContext = createContext<AccordionCtx | null>(null);

/* ------------------------------------------------------------------ */
/*  FaqAccordion wrapper                                               */
/* ------------------------------------------------------------------ */

interface FaqAccordionProps {
  children: ReactNode;
  /** When true only one item can be open at a time. */
  single?: boolean;
  className?: string;
}

export function FaqAccordion({ children, single = false, className }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = useCallback(
    (id: string) => {
      setOpenId((prev) => (prev === id ? null : id));
    },
    [],
  );

  // If not single mode we don't need context at all — each item manages its own state.
  if (!single) {
    return <div className={cn("space-y-3", className)}>{children}</div>;
  }

  return (
    <AccordionContext.Provider value={{ openId, toggle }}>
      <div className={cn("space-y-3", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  FaqItem                                                            */
/* ------------------------------------------------------------------ */

interface FaqItemProps {
  question: string;
  children: ReactNode;
  /** Optional anchor id for deep-linking (e.g. `#install`). */
  id?: string;
  className?: string;
}

export function FaqItem({ question, children, id, className }: FaqItemProps) {
  const ctx = useContext(AccordionContext);

  // In single mode the context controls the open state; otherwise each item is independent.
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = ctx ? ctx.openId === id : localOpen;

  const toggle = useCallback(() => {
    if (ctx && id) {
      ctx.toggle(id);
    } else {
      setLocalOpen((v) => !v);
    }
  }, [ctx, id]);

  /* ---- animated height via ref ---- */
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver(() => {
      if (contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [children]);

  /* ---- deep-link: open item if hash matches on mount / hash change ---- */
  useEffect(() => {
    if (!id) return;

    const check = () => {
      if (window.location.hash === `#${id}`) {
        if (ctx && id) {
          // In single mode, open via context
          ctx.openId !== id && ctx.toggle(id);
        } else {
          setLocalOpen(true);
        }
        // Scroll into view after a brief delay so the expand animation starts first
        requestAnimationFrame(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    };

    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [id, ctx]);

  /* ---- click handler: toggle + update hash ---- */
  const handleClick = useCallback(() => {
    toggle();
    if (id) {
      history.replaceState(null, "", `#${id}`);
    }
  }, [toggle, id]);

  return (
    <div
      id={id}
      className={cn(
        "rounded-xl border border-border/50 bg-card/50 transition-colors",
        isOpen && "border-border",
        className,
      )}
    >
      {/* Question / trigger */}
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
        aria-expanded={isOpen}
        aria-controls={id ? `${id}-content` : undefined}
      >
        <span>{question}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Answer — smooth height transition */}
      <div
        id={id ? `${id}-content` : undefined}
        role="region"
        style={{ maxHeight: isOpen ? height : 0 }}
        className={cn(
          "overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        )}
      >
        <div ref={contentRef} className="px-5 pb-5 pt-0 text-sm text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
