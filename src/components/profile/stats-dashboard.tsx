"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/contexts/i18n-context";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { FileText, Heart, Bookmark, MessageSquare } from "lucide-react";

export function StatsDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState({ submissions: 0, likes: 0, bookmarks: 0, comments: 0 });

  useEffect(() => {
    if (!user) return;
    const getLen = (key: string): number => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw).length : 0;
      } catch { return 0; }
    };
    setStats({
      submissions: getLen(STORAGE_KEYS.submissions(user.email)),
      likes: getLen(STORAGE_KEYS.likes(user.email)),
      bookmarks: getLen(STORAGE_KEYS.bookmarks(user.email)),
      comments: getLen(STORAGE_KEYS.comments(user.email)),
    });
  }, [user?.email]);

  if (!user) return null;

  const statItems = [
    { label: t.profile.stats.submissions, value: stats.submissions, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
    { label: t.profile.stats.likes, value: stats.likes, icon: Heart, color: "text-red-400", bg: "bg-red-400/10" },
    { label: t.profile.stats.bookmarks, value: stats.bookmarks, icon: Bookmark, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: t.profile.stats.comments, value: stats.comments, icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="glass-card p-4 text-center">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${stat.bg} mb-2`}>
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground transition-all duration-300">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
