"use client";

import { useToast } from "@/contexts/toast-context";
import { useI18n } from "@/contexts/i18n-context";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const { t: i18n } = useI18n();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 flex flex-col gap-2" style={{ zIndex: "var(--z-toast)" }} aria-live="polite" role="status">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`glass-card px-4 py-3 flex items-center gap-3 min-w-[280px] shadow-lg border-l-2 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            t.type === "error" ? "border-l-destructive" : t.type === "success" ? "border-l-primary" : t.type === "warning" ? "border-l-orange-500" : "border-l-blue-500"
          }`}
        >
          <span className={`text-sm flex-1 ${t.type === "error" ? "text-destructive" : t.type === "success" ? "text-primary" : t.type === "warning" ? "text-orange-500" : "text-foreground"}`}>
            {t.message}
          </span>
          <button onClick={() => dismiss(t.id)} className="text-muted-foreground hover:text-foreground" aria-label={i18n.common.close}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
