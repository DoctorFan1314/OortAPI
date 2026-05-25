"use client";

import { useToast } from "@/contexts/toast-context";
import { useI18n } from "@/contexts/i18n-context";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const { t: i18n } = useI18n();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-20 right-4 flex flex-col gap-2" style={{ zIndex: "var(--z-toast)" }} aria-live="polite" role="status">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`glass-card px-4 py-3 flex items-center gap-3 min-w-[280px] shadow-lg border-l-2 ${
            t.type === "error" ? "border-l-destructive animate-shake" : t.type === "success" ? "border-l-primary animate-bounce-in" : "border-l-blue-500 animate-page-fade-in"
          }`}
        >
          <span className={`text-sm flex-1 ${t.type === "error" ? "text-destructive" : t.type === "success" ? "text-primary" : t.type === "warning" ? "text-orange-500" : "text-foreground"}`}>
            {t.message}
          </span>
          {t.action && (
            <button onClick={() => { t.action?.onClick(); dismiss(t.id); }} className="text-xs font-medium text-primary hover:text-primary/80 shrink-0 px-2 py-1 rounded hover:bg-primary/5 transition-colors">
              {t.action.label}
            </button>
          )}
          <button onClick={() => dismiss(t.id)} className="text-muted-foreground hover:text-foreground" aria-label={i18n.common.close}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
