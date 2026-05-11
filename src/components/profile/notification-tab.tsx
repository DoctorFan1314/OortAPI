"use client";

import { useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { useI18n } from "@/contexts/i18n-context";
import { useLocale } from "@/hooks/use-locale";
import type { Notification } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/types";
import { Bell, MessageSquare, Sparkles, FileText, Heart, UserPlus, Info, Check, Filter } from "lucide-react";

type FilterType = "all" | "comment_reply" | "skill_update" | "submission_status" | "system";

function getFilters(t: Dictionary): { key: FilterType; label: string }[] {
  return [
    { key: "all", label: t.notificationFilters.all },
    { key: "comment_reply", label: t.notificationFilters.comments },
    { key: "skill_update", label: t.notificationFilters.skills },
    { key: "submission_status", label: t.notificationFilters.submissions },
    { key: "system", label: t.notificationFilters.system },
  ];
}

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "comment_reply": return <MessageSquare className="h-4 w-4 text-blue-400" />;
    case "skill_update": return <Sparkles className="h-4 w-4 text-purple-400" />;
    case "submission_status": return <FileText className="h-4 w-4 text-green-400" />;
    case "like": return <Heart className="h-4 w-4 text-red-400" />;
    case "follow": return <UserPlus className="h-4 w-4 text-cyan-400" />;
    case "system": return <Info className="h-4 w-4 text-yellow-400" />;
    default: return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

export function NotificationTab() {
  const { t } = useI18n();
  const locale = useLocale();
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll } = useNotifications();
  const [filter, setFilter] = useState<FilterType>("all");
  const [visibleCount, setVisibleCount] = useState(20);

  const filters = getFilters(t);

  const filtered = filter === "all"
    ? notifications
    : notifications.filter((n) => n.type === filter);

  const visible = filtered.slice(0, visibleCount);

  function timeAgo(timestamp: string) {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t.common.justNow;
    if (minutes < 60) return `${minutes}m ${t.common.ago}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${t.common.ago}`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ${t.common.ago}`;
    return new Date(timestamp).toLocaleDateString(locale);
  }

  if (notifications.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-foreground font-medium mb-1">{t.common.noNotifications}</p>
        <p className="text-sm text-muted-foreground">{t.common.comingSoon}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} {locale.startsWith("zh") ? "未读" : "unread"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Check className="h-3 w-3" />
              {t.common.markAllRead}
            </button>
          )}
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t.common.clearAll}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setVisibleCount(20); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filter === f.key
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-secondary text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <Filter className="h-3 w-3" />
            {f.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {visible.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-sm text-muted-foreground">{t.notificationFilters.emptyCategory}</p>
          </div>
        ) : (
          visible.map((n) => (
            <div
              key={n.id}
              onClick={() => { if (!n.read) markAsRead(n.id); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!n.read) markAsRead(n.id); } }}
              role="button"
              tabIndex={0}
              className={`glass-card p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                !n.read ? "border-l-2 border-l-primary bg-primary/5" : ""
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {getNotificationIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${!n.read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                <time className="text-[10px] text-muted-foreground/60 mt-1 block">{timeAgo(n.timestamp)}</time>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load more */}
      {visibleCount < filtered.length && (
        <div className="text-center pt-2">
          <button
            onClick={() => setVisibleCount((prev) => prev + 20)}
            className="text-xs text-primary hover:underline"
          >
            {t.common.loadMore} ({filtered.length - visibleCount} {t.common.remaining})
          </button>
        </div>
      )}
    </div>
  );
}
