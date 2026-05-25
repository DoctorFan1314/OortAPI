"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { Command, X } from "lucide-react";

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);
  const { lang } = useI18n();
  const locale = lang || "en";

  const shortcuts = [
    { keys: ["Ctrl", "K"], desc: locale === "zh" ? "打开命令面板" : "Open command palette" },
    { keys: ["?"], desc: locale === "zh" ? "键盘快捷键" : "Keyboard shortcuts" },
    { keys: ["Ctrl", "Enter"], desc: locale === "zh" ? "发送消息" : "Send message" },
    { keys: ["Shift", "Enter"], desc: locale === "zh" ? "换行" : "New line" },
    { keys: ["Esc"], desc: locale === "zh" ? "关闭对话框" : "Close dialog/menu" },
    { keys: ["/"], desc: locale === "zh" ? "搜索" : "Focus search" },
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="bg-card border border-border/70 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-page-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">{locale === "zh" ? "键盘快捷键" : "Keyboard Shortcuts"}</h2>
          <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground" aria-label={locale === "zh" ? "关闭" : "Close"}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.keys.join("-")} className="flex items-center justify-between py-1.5">
              <span className="text-xs text-foreground">{s.desc}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <span key={k} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-muted text-muted-foreground border border-border/50">
                    {k === "Ctrl" ? <><Command className="h-2.5 w-2.5 mr-0.5" />{k}</> : k}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-4 text-center">
          {locale === "zh" ? "按 ? 再次关闭此面板" : "Press ? again to close"}
        </p>
      </div>
    </div>
  );
}
