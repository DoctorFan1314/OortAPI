"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { Command, X } from "lucide-react";

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const s = t.shortcuts;

  const shortcuts = [
    { keys: ["Ctrl", "K"], desc: s.openCommandPalette },
    { keys: ["?"], desc: s.keyboardShortcuts },
    { keys: ["Ctrl", "Enter"], desc: s.sendMessage },
    { keys: ["Shift", "Enter"], desc: s.newLine },
    { keys: ["Esc"], desc: s.closeDialog },
    { keys: ["/"], desc: s.focusSearch },
  ];

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen((p) => !p);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={s.title} onClick={() => setOpen(false)}>
      <div className="bg-card border border-border/70 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-page-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">{s.title}</h2>
          <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground" aria-label={t.common.close}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((sc) => (
            <div key={sc.keys.join("-")} className="flex items-center justify-between py-1.5">
              <span className="text-xs text-foreground">{sc.desc}</span>
              <div className="flex items-center gap-1">
                {sc.keys.map((k) => (
                  <span key={k} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-muted text-muted-foreground border border-border/50">
                    {k === "Ctrl" ? <><Command className="h-2.5 w-2.5 mr-0.5" />{k}</> : k}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-4 text-center">
          {s.pressAgainToClose}
        </p>
      </div>
    </div>
  );
}
