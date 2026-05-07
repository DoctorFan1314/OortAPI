"use client";

import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/contexts/i18n-context";
import { useLocale } from "@/hooks/use-locale";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Submission } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/types";
import { FileText } from "lucide-react";

function getStatusConfig(t: Dictionary) {
  return {
    pending: { label: t.submit.statusPending, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
    approved: { label: t.submit.statusApproved, color: "text-green-400", bg: "bg-green-400/10 border-green-400/30" },
    rejected: { label: t.submit.statusRejected, color: "text-red-400", bg: "bg-red-400/10 border-red-400/30" },
  };
}

export function MySubmissionsTab() {
  const { user } = useAuth();
  const { t } = useI18n();
  const locale = useLocale();
  const statusConfig = getStatusConfig(t);
  const key = user ? STORAGE_KEYS.submissions(user.email) : "ai-skills-hub-guest";
  const [submissions] = useLocalStorage<Submission[]>(key, []);

  if (submissions.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-foreground font-medium mb-1">{t.profile.noSubmissions}</p>
        <p className="text-sm text-muted-foreground">{t.profile.noSubmissionsDesc}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((s) => {
        const status = statusConfig[s.status];
        return (
          <div key={s.id} className="glass-card p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-medium truncate">{s.name}</p>
              <p className="text-sm text-muted-foreground">{s.category} · {new Date(s.submittedAt).toLocaleDateString(locale)}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full border ${status.bg} ${status.color} shrink-0`}>
              {status.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
