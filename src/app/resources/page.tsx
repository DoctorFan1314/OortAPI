"use client";

import Link from "next/link";
import { BookOpen, Puzzle, LayoutGrid, TrendingUp, Tags, Send, ArrowRight, Search, X } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";

interface CountsData {
  skills?: number;
  prompts?: number;
}

const SECTIONS = [
  { href: "/skills", icon: Puzzle, zh: "Agent 技能市场", en: "Agent Skills", zhDesc: "可执行的 AI 技能，一键安装赋予 AI 行动力", enDesc: "Executable AI skills — install and give AI real action power", countKey: "skills" as const },
  { href: "/prompts", icon: BookOpen, zh: "Prompt 模板", en: "Prompt Templates", zhDesc: "28+ 高质量模板，覆盖编程、写作、分析等场景", enDesc: "28+ quality templates for coding, writing, analysis", countKey: "prompts" as const },
  { href: "/categories", icon: LayoutGrid, zh: "分类浏览", en: "Categories", zhDesc: "按方向浏览 Prompt 模板", enDesc: "Browse prompts by category" },
  { href: "/trending", icon: TrendingUp, zh: "排行榜", en: "Trending", zhDesc: "热门 Prompt 模板排行", enDesc: "Trending prompt templates" },
  { href: "/tags", icon: Tags, zh: "标签云", en: "Tags", zhDesc: "通过标签发现内容", enDesc: "Discover content through tags" },
  { href: "/submit", icon: Send, zh: "提交模板", en: "Submit", zhDesc: "分享你的 Prompt 模板", enDesc: "Share your prompt templates" },
];

export default function ResourcesPage() {
  const { lang } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: counts } = useSWR<CountsData>("/api/stats", dashboardSWRConfig);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const q = searchQuery.toLowerCase();
    return SECTIONS.filter(s => {
      const label = s[lang];
      const desc = s[`${lang}Desc` as 'zhDesc' | 'enDesc'];
      return label.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    });
  }, [searchQuery, lang]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {lang === "zh" ? "资源中心" : "Resource Hub"}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          {lang === "zh"
            ? "Prompt 模板和 Agent 技能，帮助你更好地使用 AI"
            : "Prompt templates and Agent skills to help you get more from AI"
          }
        </p>
        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={lang === "zh" ? "搜索资源..." : "Search resources..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 pr-9 bg-secondary border-border text-foreground"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">{lang === "zh" ? "未找到匹配的资源" : "No matching resources found"}</p>
        </div>
      ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <Link key={s.href} href={s.href} className="glass-card glass-card-hover p-6 rounded-xl group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{s[lang]}</h3>
              {"countKey" in s && counts && (counts as any)[s.countKey!] > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
                  {(counts as any)[s.countKey!]}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{s[`${lang}Desc` as 'zhDesc' | 'enDesc']}</p>
            <span className="text-primary text-sm flex items-center gap-1 group-hover:underline">
              {lang === "zh" ? "前往" : "Go"} <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}
