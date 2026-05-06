"use client";

import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/contexts/i18n-context";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { getSkillById } from "@/lib/mock-data";
import { SkillCard } from "@/components/skill/skill-card";
import { Bookmark } from "lucide-react";

export function MyFavoritesTab() {
  const { user } = useAuth();
  const { t } = useI18n();
  const key = user ? STORAGE_KEYS.bookmarks(user.email) : "ai-skills-hub-guest";
  const [bookmarkedIds] = useLocalStorage<string[]>(key, []);
  const skills = bookmarkedIds.map((id) => getSkillById(id)).filter(Boolean);

  if (skills.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Bookmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-foreground font-medium mb-1">{t.profile.noFavorites}</p>
        <p className="text-sm text-muted-foreground">{t.profile.noFavoritesDesc}</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {skills.map((skill) => skill && <SkillCard key={skill.id} skill={skill} />)}
    </div>
  );
}
