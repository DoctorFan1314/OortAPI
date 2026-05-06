"use client";

import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/contexts/i18n-context";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { getSkillById } from "@/lib/mock-data";
import type { UserActivity } from "@/lib/types";
import { Eye, Copy, Clock } from "lucide-react";
import Link from "next/link";

export function UsageHistoryTab() {
  const { user } = useAuth();
  const { t } = useI18n();
  if (!user) return null;

  let activities: UserActivity[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.activity(user.email));
    activities = raw ? JSON.parse(raw) : [];
  } catch { /* ignore */ }

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
      {viewAndCopy.slice(0, 50).map((a) => {
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
                    <Link href={`/prompts/${a.skillId}`} className="text-primary hover:underline">{a.targetTitle || a.skillId}</Link>
                  </>
                )}
              </p>
            </div>
            <time className="text-xs text-muted-foreground shrink-0">
              {new Date(a.timestamp).toLocaleDateString("zh-CN")}
            </time>
          </div>
        );
      })}
    </div>
  );
}
