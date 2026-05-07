"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ProfileHeader } from "@/components/profile/profile-header";
import { StatsDashboard } from "@/components/profile/stats-dashboard";
import { ActivityTimeline } from "@/components/profile/activity-timeline";
import { MyFavoritesTab } from "@/components/profile/my-favorites-tab";
import { MyLikesTab } from "@/components/profile/my-likes-tab";
import { MySubmissionsTab } from "@/components/profile/my-submissions-tab";
import { MyCommentsTab } from "@/components/profile/my-comments-tab";
import { UsageHistoryTab } from "@/components/profile/usage-history-tab";
import { SettingsTab } from "@/components/profile/settings-tab";
import { useI18n } from "@/contexts/i18n-context";
import { useSearchParams, useRouter } from "next/navigation";
import { User, Heart, Bookmark, FileText, MessageSquare, Clock, Settings } from "lucide-react";

type TabId = "overview" | "favorites" | "likes" | "submissions" | "comments" | "history" | "settings";

export default function ProfileClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const tabFromUrl = searchParams.get("tab") as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(
    tabFromUrl && ["overview", "favorites", "likes", "submissions", "comments", "history", "settings"].includes(tabFromUrl)
      ? tabFromUrl
      : "overview"
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", activeTab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [activeTab]);

  const tabs = [
    { id: "overview" as const, label: t.profile.overview, icon: User },
    { id: "favorites" as const, label: t.profile.favorites, icon: Bookmark },
    { id: "likes" as const, label: t.profile.likes, icon: Heart },
    { id: "submissions" as const, label: t.profile.submissions, icon: FileText },
    { id: "comments" as const, label: t.profile.comments, icon: MessageSquare },
    { id: "history" as const, label: t.profile.history, icon: Clock },
    { id: "settings" as const, label: t.profile.settings, icon: Settings },
  ];

  return (
    <AuthGuard>
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
        <ProfileHeader />

        <div role="tablist" className="flex gap-1 overflow-x-auto scrollbar-hide mb-8 border-b border-border pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                id={`tab-${tab.id}`}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === "overview" && (
            <div className="space-y-8">
              <StatsDashboard />
              <ActivityTimeline />
            </div>
          )}
          {activeTab === "favorites" && <MyFavoritesTab />}
          {activeTab === "likes" && <MyLikesTab />}
          {activeTab === "submissions" && <MySubmissionsTab />}
          {activeTab === "comments" && <MyCommentsTab />}
          {activeTab === "history" && <UsageHistoryTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </AuthGuard>
  );
}
