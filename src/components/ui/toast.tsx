"use client";

import { useToast } from "@/contexts/toast-context";
import { useI18n } from "@/contexts/i18n-context";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const { t: i18n } = useI18n();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="glass-card px-4 py-3 flex items-center gap-3 min-w-[280px] shadow-lg"
        >
          <span className={`text-sm flex-1 ${t.type === "error" ? "text-red-400" : t.type === "success" ? "text-[#00d4ff]" : "text-white"}`}>
            {t.message}
          </span>
          <button onClick={() => dismiss(t.id)} className="text-[#8b949e] hover:text-white" aria-label={i18n.common.close}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
