"use client";

import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/contexts/i18n-context";
import { useLocale } from "@/hooks/use-locale";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { getSkillById } from "@/lib/mock-data";
import { getAgentSkillById } from "@/lib/mock-agent-skills";
import type { UserActivity } from "@/lib/types";
import { Eye, Copy, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function UsageHistoryTab() {
  const { user } = useAuth();
  const { t } = useI18n();
  const locale = useLocale();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.activity(user.email));
      if (raw) setActivities(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [user?.email]);
  if (!user) return null;

  const viewAndCopy = activities.filter((a) => a.type === "view" || a.type === "copy");

  if (viewAndCopy.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-foreground font-medium mb-1">{t.profile.noHistory}</p>
        <p className="text-sm text-muted-foreground">{t.profile.noHistoryDesc}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {viewAndCopy.slice(0, visibleCount).map((a) => {
        const Icon = a.type === "copy" ? Copy : Eye;
        const label = a.type === "copy" ? t.profile.copiedLabel : t.profile.viewedSkill;
        return (
          <div key={a.id} className="glass-card p-3 flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${a.type === "copy" ? "bg-green-400/10" : "bg-secondary"}`}>
              <Icon className={`h-4 w-4 ${a.type === "copy" ? "text-green-400" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                {label}
                {a.skillId && (
                  <>
                    {" — "}
                    <Link href={getAgentSkillById(a.skillId) ? `/skills/${a.skillId}` : `/prompts/${a.skillId}`} className="text-primary hover:underline">{a.targetTitle || a.skillId}</Link>
                  </>
                )}
              </p>
            </div>
            <time className="text-xs text-muted-foreground shrink-0">
              {new Date(a.timestamp).toLocaleDateString(locale)}
            </time>
          </div>
        );
      })}
      {viewAndCopy.length > visibleCount && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setVisibleCount((c) => c + 20)} className="border-border text-muted-foreground hover:bg-secondary">
            {t.common.loadMore} <span className="ml-1 text-xs text-muted-foreground/60">({viewAndCopy.length - visibleCount} {t.common.remaining})</span>
          </Button>
        </div>
      )}
    </div>
  );
}
