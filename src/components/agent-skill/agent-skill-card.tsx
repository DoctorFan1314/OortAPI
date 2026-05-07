"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Download, Star, Copy, Check, Terminal } from "lucide-react";
import { useState } from "react";
import type { AgentSkill } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export function AgentSkillCard({ skill }: { skill: AgentSkill }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="glass-card glass-card-hover p-5 h-full cursor-pointer group flex flex-col relative overflow-hidden">
      {skill.trending && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Popular
          </span>
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-lg">
          {skill.avatar || skill.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center gap-2 mb-0.5 pr-20">
            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors min-w-0">
              {skill.name}
            </h3>
            {skill.authorBadge && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-400 border-blue-500/20 border shrink-0">
                {skill.authorBadge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{skill.author}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
        {skill.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {skill.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground/80 border border-border"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Download className="h-3 w-3" />
          {formatNumber(skill.downloads)}
        </span>
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          {formatNumber(skill.stars)}
        </span>
        <span className="text-muted-foreground/60">{skill.lastUpdated}</span>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label={copied ? "Copied" : `Copy install command for ${skill.name}`}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/80 border border-border group/install cursor-pointer hover:border-primary/30 transition-colors"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          navigator.clipboard.writeText(skill.installCommand).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            navigator.clipboard.writeText(skill.installCommand).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        }}
      >
        <Terminal className="h-3 w-3 text-muted-foreground shrink-0" />
        <code className="text-xs text-muted-foreground truncate flex-1 font-mono">{skill.installCommand}</code>
        {copied ? <Check className="h-3 w-3 text-green-400 shrink-0" /> : <Copy className="h-3 w-3 text-muted-foreground/60 group-hover/install:text-muted-foreground shrink-0" />}
      </div>

      <Link href={`/skills/${skill.id}`} className="absolute inset-0" aria-label={skill.title}>
        <span className="sr-only">View {skill.title}</span>
      </Link>
    </div>
  );
}
