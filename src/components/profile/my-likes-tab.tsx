"use client";

import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/contexts/i18n-context";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { getSkillById } from "@/lib/mock-data";
import { SkillCard } from "@/components/skill/skill-card";
import { Heart } from "lucide-react";

export function MyLikesTab() {
  const { user } = useAuth();
  const { t } = useI18n();
  const key = user ? STORAGE_KEYS.likes(user.email) : "ai-skills-hub-guest";
  const [likedIds] = useLocalStorage<string[]>(key, []);
  const skills = likedIds.map((id) => getSkillById(id)).filter(Boolean);

  if (skills.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-foreground font-medium mb-1">{t.profile.noLikes}</p>
        <p className="text-sm text-muted-foreground">{t.profile.noLikesDesc}</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {skills.map((skill) => skill && <SkillCard key={skill.id} skill={skill} />)}
    </div>
  );
}
