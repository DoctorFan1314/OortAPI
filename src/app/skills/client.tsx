"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { skills } from "@/lib/mock-data";
import { SkillCard } from "@/components/skill/skill-card";
import { categories } from "@/lib/categories";

const difficulties = ["全部", "新手友好", "进阶", "高级"];

export default function SkillsClient() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("全部");
  const [difficulty, setDifficulty] = useState("全部");
  const [sortBy, setSortBy] = useState<"trending" | "rating" | "newest">("trending");

  const filtered = useMemo(() => {
    let result = [...skills];
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (category !== "全部") result = result.filter((s) => s.categorySlug === category);
    if (difficulty !== "全部") result = result.filter((s) => s.difficulty === difficulty);
    if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "newest") result.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
    else result.sort((a, b) => b.usageCount - a.usageCount);
    return result;
  }, [query, category, difficulty, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">技能市场</h1>
        <p className="text-[#8b949e]">探索 {skills.length}+ 个精选实测LLM技能模板</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
          <Input
            placeholder="搜索技能模板..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-[#8b949e]"
          />
        </div>

        <div className="space-y-3 md:space-y-0 md:flex md:flex-wrap md:gap-4 md:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#8b949e]" id="category-label">分类：</span>
            <button onClick={() => setCategory("全部")} role="radio" aria-checked={category === "全部"} aria-labelledby="category-label" className={`px-3 py-1 text-sm rounded-md transition-colors ${category === "全部" ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30" : "text-[#8b949e] hover:text-white hover:bg-white/5"}`}>
              全部
            </button>
            {categories.map((c) => (
              <button key={c.slug} onClick={() => setCategory(c.slug)} role="radio" aria-checked={category === c.slug} className={`px-3 py-1 text-sm rounded-md transition-colors ${category === c.slug ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30" : "text-[#8b949e] hover:text-white hover:bg-white/5"}`}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#8b949e]" id="difficulty-label">难度：</span>
            {difficulties.map((d) => (
              <button key={d} onClick={() => setDifficulty(d)} role="radio" aria-checked={difficulty === d} aria-labelledby="difficulty-label" className={`px-3 py-1 text-sm rounded-md transition-colors ${difficulty === d ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30" : "text-[#8b949e] hover:text-white hover:bg-white/5"}`}>
                {d}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 md:ml-auto">
            <span className="text-sm text-[#8b949e]" id="sort-label">排序：</span>
            {([{ key: "trending" as const, label: "最热" }, { key: "rating" as const, label: "评分" }, { key: "newest" as const, label: "最新" }]).map((s) => (
              <button key={s.key} onClick={() => setSortBy(s.key)} role="radio" aria-checked={sortBy === s.key} aria-labelledby="sort-label" className={`px-3 py-1 text-sm rounded-md transition-colors ${sortBy === s.key ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30" : "text-[#8b949e] hover:text-white hover:bg-white/5"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#8b949e] text-lg mb-2">未找到匹配的技能模板</p>
          <p className="text-[#8b949e]/60 text-sm">尝试调整搜索词或筛选条件</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
