"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Download, Star, Package, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentSkillCard } from "@/components/agent-skill/agent-skill-card";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { useI18n } from "@/contexts/i18n-context";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { agentSkills, getPublishedSkills } from "@/lib/mock-agent-skills";
import { formatNumber } from "@/lib/utils";
import type { UserProfile, AgentSkill } from "@/lib/types";

export default function UserProfileClient({ username }: { username: string }) {
  const { t } = useI18n();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.users);
      if (stored) {
        const users: UserProfile[] = JSON.parse(stored);
        const found = users.find(
          (u) => u.username.toLowerCase() === username.toLowerCase()
        );
        setUser(found ?? null);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [username]);

  const publishedSkills = useMemo(() => {
    if (!user) return [];
    const mockMatch = agentSkills.filter(
      (s) =>
        s.author === `@${user.username}` ||
        s.developer === user.username
    );
    const userPublished = getPublishedSkills().filter(
      (s) =>
        s.author === `@${user.username}` ||
        s.developer === user.username
    );
    // Deduplicate by id
    const seen = new Set<string>();
    return [...mockMatch, ...userPublished].filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [user]);

  const totalDownloads = publishedSkills.reduce(
    (sum, s) => sum + (s.downloads || 0),
    0
  );
  const totalStars = publishedSkills.reduce(
    (sum, s) => sum + (s.stars || 0),
    0
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8 animate-pulse">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-20 w-20 bg-secondary rounded-full" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-secondary rounded" />
            <div className="h-4 w-32 bg-secondary rounded" />
          </div>
        </div>
        <div className="h-64 bg-secondary rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        <Breadcrumb items={[{ label: username }]} />
        <div className="text-center py-20">
          <div className="text-6xl mb-4">:(</div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            {t.userProfile.userNotFound}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t.notFound.description}
          </p>
          <Link href="/">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.userProfile.goBack}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <Breadcrumb items={[{ label: `@${user.username}` }]} />

      {/* Profile Header — glass card */}
      <div className="glass-card p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div className="h-20 w-20 shrink-0 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-3xl font-bold text-primary overflow-hidden">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Username */}
            <h1 className="text-2xl font-bold text-foreground mb-1">
              @{user.username}
            </h1>

            {/* Bio */}
            {user.bio && (
              <p className="text-muted-foreground mb-3 max-w-lg">{user.bio}</p>
            )}

            {/* Join date */}
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground/70 mb-4">
              <Calendar className="h-3.5 w-3.5" />
              {t.userProfile.joinedAt} {user.joinDate}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">
                  {formatNumber(publishedSkills.length)}
                </span>
                <span className="text-muted-foreground">
                  {t.userProfile.publishedCount}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Download className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">
                  {formatNumber(totalDownloads)}
                </span>
                <span className="text-muted-foreground">
                  {t.userProfile.totalDownloads}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">
                  {formatNumber(totalStars)}
                </span>
                <span className="text-muted-foreground">
                  {t.userProfile.totalStars}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Published Skills */}
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        {t.userProfile.publishedSkills}
      </h2>

      {publishedSkills.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {publishedSkills.map((skill: AgentSkill) => (
            <AgentSkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t.userProfile.noPublishedSkills}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.userProfile.noPublishedSkillsDesc}
          </p>
        </div>
      )}
    </div>
  );
}
