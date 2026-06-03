"use client";

import Link from "next/link";
import { Search, Zap, FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/contexts/i18n-context";

function getFallbackSkills(t: ReturnType<typeof useI18n>["t"]) {
  return [
    { id: "find-skills", name: t.notFound.skillFindSkills, description: t.notFound.skillFindSkillsDesc },
    { id: "frontend-design", name: t.notFound.skillFrontendDesign, description: t.notFound.skillFrontendDesignDesc },
    { id: "web-search", name: t.notFound.skillWebSearch, description: t.notFound.skillWebSearchDesc },
    { id: "agent-reach", name: t.notFound.skillAgentReach, description: t.notFound.skillAgentReachDesc },
  ];
}

function getFallbackPrompts(t: ReturnType<typeof useI18n>["t"]) {
  return [
    { id: "xiaohongshu-notes", title: t.notFound.promptXhsNotes, subtitle: t.notFound.promptXhsNotesDesc },
    { id: "weekly-report", title: t.notFound.promptWeeklyReport, subtitle: t.notFound.promptWeeklyReportDesc },
    { id: "code-review", title: t.notFound.promptCodeReview, subtitle: t.notFound.promptCodeReviewDesc },
    { id: "meeting-summary", title: t.notFound.promptMeetingSummary, subtitle: t.notFound.promptMeetingSummaryDesc },
  ];
}

export default function NotFound() {
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const skills = getFallbackSkills(t);
  const prompts = getFallbackPrompts(t);

  function handleSearch(e?: React.KeyboardEvent) {
    if (e && e.key !== "Enter") return;
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <img src="/logo-icon.svg" alt="" className="h-24 w-24 mx-auto mb-6 opacity-60" />
      <div className="text-7xl font-extrabold gradient-text mb-2">404</div>
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center">
          <Search className="h-7 w-7 text-primary/60" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-3">{t.notFound.title}</h1>
      <p className="text-muted-foreground mb-8">{t.notFound.description}</p>

      {/* Search box */}
      <div className="relative max-w-md mx-auto mb-10">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.notFound.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="pl-10 bg-secondary border-border text-foreground"
          aria-label={t.notFound.searchPlaceholder}
        />
      </div>

      {/* Hot skills */}
      {skills.length > 0 && (
        <div className="text-left mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />{t.notFound.popularSkills}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {skills.map(s => (
              <Link key={s.id} href={`/skills/${s.id}`} className="glass-card p-3 hover:bg-secondary transition-colors">
                <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground truncate">{s.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hot prompts */}
      {prompts.length > 0 && (
        <div className="text-left mb-10">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />{t.notFound.popularPrompts}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {prompts.map(s => (
              <Link key={s.id} href={`/prompts/${s.id}`} className="glass-card p-3 hover:bg-secondary transition-colors">
                <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
                <p className="text-xs text-muted-foreground truncate">{s.subtitle}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/">
          <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
            <Home className="h-4 w-4 mr-2" />{t.notFound.backHome}
          </Button>
        </Link>
        <Link href="/skills">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Zap className="h-4 w-4 mr-2" />{t.notFound.browseSkills}
          </Button>
        </Link>
        <Link href="/prompts">
          <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
            <FileText className="h-4 w-4 mr-2" />{t.notFound.browsePrompts}
          </Button>
        </Link>
      </div>
    </div>
  );
}
