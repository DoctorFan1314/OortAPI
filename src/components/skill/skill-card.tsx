"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Star, Users, ArrowRight } from "lucide-react";
import type { Skill } from "@/lib/types";
import { COLORS } from "@/lib/theme";
import { getDifficultyLabel } from "@/lib/utils";
import { useI18n } from "@/contexts/i18n-context";

export function SkillCard({ skill }: { skill: Skill }) {
  const color = COLORS.category[skill.categorySlug] || COLORS.primary;
  const router = useRouter();
  const { t } = useI18n();

  return (
    <Link href={`/prompts/${skill.id}`}>
      <div className="glass-card glass-card-hover p-5 h-full cursor-pointer group flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <Badge
            variant="secondary"
            className="text-xs border"
            style={{ color, borderColor: `${color}30`, backgroundColor: `${color}10` }}
          >
            {skill.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            <span>{skill.rating}</span>
          </div>
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {skill.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">{skill.subtitle}</p>
        {skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {skill.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                role="link"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); router.push(`/tags/${encodeURIComponent(tag)}`); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); router.push(`/tags/${encodeURIComponent(tag)}`); } }}
                className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground/80 border border-border hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {skill.usageCount}+
            </span>
            <span>{getDifficultyLabel(skill.difficulty, t)}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
