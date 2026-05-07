"use client";

import Link from "next/link";
import { Search, Zap, FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/contexts/i18n-context";
import { agentSkills } from "@/lib/mock-agent-skills";
import { skills } from "@/lib/mock-data";

export default function NotFound() {
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e?: React.KeyboardEvent) {
    if (e && e.key !== "Enter") return;
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  const hotSkills = agentSkills.filter(s => s.trending).slice(0, 4);
  const hotPrompts = skills.filter(s => s.trending).slice(0, 4);

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <div className="text-6xl font-bold text-primary mb-4">404</div>
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
      <div className="text-left mb-8">
        <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4" />{t.notFound.popularSkills}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {hotSkills.map(s => (
            <Link key={s.id} href={`/skills/${s.id}`} className="glass-card p-3 hover:bg-secondary transition-colors">
              <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
              <p className="text-xs text-muted-foreground truncate">{s.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Hot prompts */}
      <div className="text-left mb-10">
        <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" />{t.notFound.popularPrompts}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {hotPrompts.map(s => (
            <Link key={s.id} href={`/prompts/${s.id}`} className="glass-card p-3 hover:bg-secondary transition-colors">
              <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
              <p className="text-xs text-muted-foreground truncate">{s.subtitle}</p>
            </Link>
          ))}
        </div>
      </div>

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
