"use client";

import { useToast } from "@/contexts/toast-context";
import { useI18n } from "@/contexts/i18n-context";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const { t: i18n } = useI18n();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" aria-live="polite" role="status">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`glass-card px-4 py-3 flex items-center gap-3 min-w-[280px] shadow-lg border-l-2 ${
            t.type === "error" ? "border-l-red-400" : t.type === "success" ? "border-l-primary" : t.type === "warning" ? "border-l-yellow-400" : "border-l-blue-400"
          }`}
          role="alert"
        >
          <span className={`text-sm flex-1 ${t.type === "error" ? "text-red-400" : t.type === "success" ? "text-primary" : t.type === "warning" ? "text-yellow-400" : "text-foreground"}`}>
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
