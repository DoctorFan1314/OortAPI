"use client";

import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/contexts/i18n-context";
import { useLocale } from "@/hooks/use-locale";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { UserActivity } from "@/lib/types";
import { ThumbsUp, Bookmark, MessageSquare, Send, Eye, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import type { Dictionary } from "@/lib/i18n/types";

function getTypeConfig(t: Dictionary) {
  return {
    like: { icon: ThumbsUp, color: "text-red-400", bg: "bg-red-400/10", label: t.profile.likedLabel },
    bookmark: { icon: Bookmark, color: "text-yellow-400", bg: "bg-yellow-400/10", label: t.profile.bookmarkedLabel },
    comment: { icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-400/10", label: t.profile.commentedLabel },
    submit: { icon: Send, color: "text-primary", bg: "bg-primary/10", label: t.profile.submittedLabel },
    view: { icon: Eye, color: "text-muted-foreground", bg: "bg-secondary", label: t.profile.viewedLabel },
    copy: { icon: Copy, color: "text-green-400", bg: "bg-green-400/10", label: t.profile.copiedPrompt },
  } as const;
}

export function ActivityTimeline() {
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

  const typeConfig = getTypeConfig(t);

  const recentlyViewed = activities.filter((a) => a.type === "view").slice(0, 10);

  if (activities.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Eye className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">{t.profile.noActivity}</p>
        <p className="text-sm text-muted-foreground/60">{t.profile.noActivityDesc}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t.profile.recentlyViewed}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t.profile.recentlyViewedDesc}</p>
          <div className="space-y-2">
            {recentlyViewed.map((activity) => (
              <div key={activity.id} className="glass-card p-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {activity.targetTitle || activity.skillId}
                  </p>
                </div>
                <time className="text-xs text-muted-foreground shrink-0">
                  {new Date(activity.timestamp).toLocaleDateString(locale)}
                </time>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-foreground mb-4">{t.profile.recentActivity}</h2>
      <div className="space-y-3">
        {activities.slice(0, visibleCount).map((activity) => {
          const config = typeConfig[activity.type] || typeConfig.view;
          const Icon = config.icon;
          return (
            <div key={activity.id} className="glass-card p-3 flex items-center gap-3">
              <div className={`h-8 w-8 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">
                  {config.label}
                  {activity.targetTitle && <span className="text-muted-foreground"> — {activity.targetTitle}</span>}
                </p>
              </div>
              <time className="text-xs text-muted-foreground shrink-0">
                {new Date(activity.timestamp).toLocaleDateString(locale)}
              </time>
            </div>
          );
        })}
      </div>
      {activities.length > visibleCount && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setVisibleCount((c) => c + 20)} className="border-border text-muted-foreground hover:bg-secondary">
            {t.common.loadMore} <span className="ml-1 text-xs text-muted-foreground/60">({activities.length - visibleCount} {t.common.remaining})</span>
          </Button>
        </div>
      )}
    </div>
  );
}
