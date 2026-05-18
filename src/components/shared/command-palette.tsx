"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Command } from "lucide-react";
import { getCommandItems } from "@/lib/commands";
import { useI18n } from "@/contexts/i18n-context";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const { t } = useI18n();

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
    previousFocusRef.current?.focus();
  }, []);

  const handleOpen = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    setOpen(true);
    setSelectedIdx(0);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const items = useMemo(() => getCommandItems({ push: (url: string) => { router.push(url); handleClose(); } }, t), [t, router, handleClose]);

  const filtered = useMemo(() => query.trim()
    ? items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : items, [query, items]);

  const grouped = useMemo(() => filtered.reduce<Record<string, typeof items>>((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {}), [filtered]);

  const flatFiltered = filtered;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        // Don't open palette when typing in input fields
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
        e.preventDefault();
        handleOpen();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleOpen]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { handleClose(); }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, flatFiltered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && flatFiltered[selectedIdx]) {
        flatFiltered[selectedIdx].action();
        handleClose();
      }
      // Focus trap: Tab cycles within the palette
      if (e.key === "Tab") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, flatFiltered, selectedIdx, handleClose]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-center pt-[15vh]" style={{ zIndex: "var(--z-command)" }} onClick={handleClose} role="dialog" aria-modal="true" aria-label={t.commandPalette.searchPlaceholder}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" aria-hidden="true" />
      <div
        ref={containerRef}
        className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-slideDown"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.commandPalette.searchPlaceholder}
            role="combobox"
            aria-expanded={true}
            aria-controls="cmd-listbox"
            aria-activedescendant={flatFiltered.length > 0 ? `cmd-${selectedIdx}` : undefined}
            className="flex-1 h-12 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-muted-foreground bg-secondary border border-border rounded">
            ESC
          </kbd>
        </div>
        <div id="cmd-listbox" role="listbox" aria-label={t.commandPalette.searchPlaceholder} className="max-h-72 overflow-y-auto p-2">
          {flatFiltered.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">{t.commandPalette.noResults}</p>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} role="group" aria-label={category}>
                <p className="text-xs text-muted-foreground/60 px-3 py-1.5 uppercase tracking-wider">{category}</p>
                {items.map((item) => {
                  const idx = flatFiltered.indexOf(item);
                  return (
                    <button
                      key={`${category}-${item.label}`}
                      id={`cmd-${idx}`}
                      role="option"
                      aria-selected={idx === selectedIdx}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                        idx === selectedIdx ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
                      }`}
                      onClick={() => { item.action(); handleClose(); }}
                      onMouseEnter={() => setSelectedIdx(idx)}
                    >
                      <span className="truncate">{item.label}</span>
                      {idx === selectedIdx && <ArrowRight className="h-3.5 w-3.5 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted-foreground">
          <span>{t.commandPalette.navigationHint}</span>
          <span className="flex items-center gap-1"><Command className="h-3 w-3" />{t.commandPalette.shortcutHint}</span>
        </div>
      </div>
    </div>
  );
}
