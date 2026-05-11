"use client";

import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/contexts/i18n-context";
import { useLocale } from "@/hooks/use-locale";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { getSkillById } from "@/lib/mock-data";
import { getAgentSkillById } from "@/lib/mock-agent-skills";
import type { Comment } from "@/lib/types";
import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";

export function MyCommentsTab() {
  const { user } = useAuth();
  const { t } = useI18n();
  const locale = useLocale();
  const [comments, setComments] = useState<Comment[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.comments(user.email));
      if (raw) setComments(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [user?.email]);
  if (!user) return null;

  const handleDelete = (id: string, skillId: string) => {
    const updated = comments.filter((c) => c.id !== id);
    setComments(updated);
    localStorage.setItem(STORAGE_KEYS.comments(user.email), JSON.stringify(updated));
    // Also remove from global
    try {
      const allRaw = localStorage.getItem(STORAGE_KEYS.allComments);
      const all: Comment[] = allRaw ? JSON.parse(allRaw) : [];
      localStorage.setItem(STORAGE_KEYS.allComments, JSON.stringify(all.filter((c) => c.id !== id)));
    } catch { /* ignore */ }
    // Also remove from per-skill comments
    try {
      const skillRaw = localStorage.getItem(STORAGE_KEYS.skillComments(skillId));
      const skillComments: Comment[] = skillRaw ? JSON.parse(skillRaw) : [];
      localStorage.setItem(STORAGE_KEYS.skillComments(skillId), JSON.stringify(skillComments.filter((c) => c.id !== id)));
    } catch { /* ignore */ }
  };

  if (comments.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-foreground font-medium mb-1">{t.profile.noComments}</p>
        <p className="text-sm text-muted-foreground">{t.profile.noCommentsDesc}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.slice(0, visibleCount).map((c) => {
        const prompt = getSkillById(c.skillId);
        const agent = getAgentSkillById(c.skillId);
        const href = agent ? `/skills/${c.skillId}` : `/prompts/${c.skillId}`;
        const title = agent?.name || prompt?.title || c.skillId;
        return (
          <div key={c.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <Link href={href} className="text-sm text-primary hover:underline truncate">
                {title}
              </Link>
              <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(c.id, c.skillId)} className="text-muted-foreground hover:text-destructive shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-foreground mb-1">{c.content}</p>
            <time className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString(locale)}</time>
          </div>
        );
      })}
      {comments.length > visibleCount && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setVisibleCount((c) => c + 10)} className="border-border text-muted-foreground hover:bg-secondary">
            {t.common.loadMore} <span className="ml-1 text-xs text-muted-foreground/60">({comments.length - visibleCount} {t.common.remaining})</span>
          </Button>
        </div>
      )}
    </div>
  );
}
