"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Zap, BookOpen } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { agentSkills } from "@/lib/mock-agent-skills";
import { skills } from "@/lib/mock-data";

export default function NotFound() {
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const hotSkills = agentSkills.slice(0, 3);
  const hotPrompts = skills.slice(0, 3);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/skills?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-lg w-full">
        <p className="text-7xl font-bold text-primary mb-4">404</p>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t.notFound.title}</h1>
        <p className="text-muted-foreground mb-8">{t.notFound.description}</p>

        {/* Search box */}
        <form onSubmit={handleSearch} className="relative max-w-sm mx-auto mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.notFound.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          />
        </form>

        {/* Hot links */}
        <div className="grid sm:grid-cols-2 gap-6 text-left mb-10">
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              {t.notFound.popularSkills}
            </h2>
            <div className="space-y-2">
              {hotSkills.map((s) => (
                <Link
                  key={s.id}
                  href={`/skills/${s.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-colors text-sm text-muted-foreground hover:text-foreground"
                >
                  <span className="text-base">{s.avatar || s.name.charAt(0)}</span>
                  <span className="truncate">{s.title}</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              {t.notFound.popularPrompts}
            </h2>
            <div className="space-y-2">
              {hotPrompts.map((s) => (
                <Link
                  key={s.id}
                  href={`/prompts/${s.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-colors text-sm text-muted-foreground hover:text-foreground"
                >
                  <span className="truncate">{s.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
              <ArrowLeft className="h-4 w-4 mr-2" />{t.notFound.backHome}
            </Button>
          </Link>
          <Link href="/skills">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
              {t.notFound.browseSkills}
            </Button>
          </Link>
          <Link href="/prompts">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
              {t.notFound.browsePrompts}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
