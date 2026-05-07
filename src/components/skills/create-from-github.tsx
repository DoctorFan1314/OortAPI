"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GitFork, CheckCircle, Loader2, ArrowRight, ArrowLeft, Package } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { useToast } from "@/contexts/toast-context";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { AgentSkill } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

// Mock: parse a github URL into skill candidates
function mockParseGithub(url: string): { name: string; title: string; description: string; version: string }[] {
  const parts = url.replace(/\/$/, "").split("/");
  const repo = parts[parts.length - 1] || "my-skills";
  const owner = parts[parts.length - 2] || "user";
  return [
    { name: repo, title: `${repo} — Primary Skill`, description: `Auto-parsed skill from ${owner}/${repo}`, version: "1.0.0" },
    { name: `${repo}-utils`, title: `${repo} Utilities`, description: `Helper utilities for ${repo}`, version: "0.1.0" },
    { name: `${repo}-config`, title: `${repo} Configuration`, description: `Configuration presets for ${repo}`, version: "0.1.0" },
  ];
}

export function CreateFromGithub({ open, onClose, onCreated }: Props) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [githubUrl, setGithubUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsedSkills, setParsedSkills] = useState<{ name: string; title: string; description: string; version: string }[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);

  if (!open) return null;

  function handleParse() {
    if (!githubUrl.trim()) {
      setUrlError(t.create.githubUrlRequired);
      return;
    }
    if (!githubUrl.includes("github.com")) {
      setUrlError(t.create.githubUrlRequired);
      return;
    }
    setUrlError("");
    setParsing(true);
    setTimeout(() => {
      const results = mockParseGithub(githubUrl);
      setParsedSkills(results);
      setSelected(new Set([0])); // pre-select first
      setParsing(false);
      setStep(2);
    }, 1500);
  }

  function handleConfirm() {
    if (selected.size === 0) {
      toast(t.create.selectAtLeastOne, "error");
      return;
    }
    const stored = localStorage.getItem(STORAGE_KEYS.publishedSkills);
    const published: AgentSkill[] = stored ? JSON.parse(stored) : [];
    const parts = githubUrl.replace(/\/$/, "").split("/");
    const owner = parts[parts.length - 2] || "user";

    for (const idx of selected) {
      const s = parsedSkills[idx];
      published.push({
        id: `gh-${Date.now()}-${idx}`,
        name: s.name,
        title: s.title,
        description: s.description,
        avatar: "📦",
        author: `@${owner}`,
        developer: owner,
        downloads: 0,
        stars: 0,
        lastUpdated: new Date().toISOString().slice(0, 10),
        collection: "Community",
        category: "Skills 管理",
        categorySlug: "skills-management",
        installCommand: `npx skills add @${owner}/${s.name}`,
        readme: `# ${s.name}\n\n${s.description}\n\nImported from ${githubUrl}`,
        license: "MIT",
        version: s.version,
        files: { "SKILL.md": `# ${s.name}\n\n${s.description}`, "index.ts": `// ${s.name} entry point` },
        demoInput: "",
        demoOutput: "",
        triggers: [],
        tags: ["imported", "github"],
        featured: false,
        trending: false,
      });
    }

    localStorage.setItem(STORAGE_KEYS.publishedSkills, JSON.stringify(published));
    setDone(true);
    toast(t.create.importSuccess, "success");
    onCreated();
  }

  function reset() {
    setStep(1);
    setGithubUrl("");
    setUrlError("");
    setParsedSkills([]);
    setSelected(new Set());
    setDone(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={reset}>
      <div className="w-full max-w-lg mx-4 rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <GitFork className="h-5 w-5 text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">{t.create.importGithub}</h2>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            {[1, 2, 3].map((s) => (
              <span key={s} className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{s}</span>
            ))}
          </div>
        </div>

        {/* Step 1: Enter URL */}
        {step === 1 && !done && !parsing && (
          <div className="px-6 py-6 space-y-4">
            <p className="text-sm text-muted-foreground">{t.create.githubUrlPlaceholder}</p>
            <div>
              <label className="text-sm text-foreground mb-1.5 block">{t.create.githubUrl} <span className="text-red-400">*</span></label>
              <Input
                value={githubUrl}
                onChange={(e) => { setGithubUrl(e.target.value); setUrlError(""); }}
                placeholder="https://github.com/user/repo"
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 font-mono text-sm"
              />
              {urlError && <p className="text-xs text-red-400 mt-1">{urlError}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={reset} className="text-muted-foreground">{t.common.cancel}</Button>
              <Button onClick={handleParse} disabled={parsing} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {parsing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.create.parsing}</> : <>{t.create.parse} <ArrowRight className="h-4 w-4 ml-1" /></>}
              </Button>
            </div>
          </div>
        )}

        {/* Parsing state */}
        {step === 1 && parsing && (
          <div className="px-6 py-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-primary mx-auto animate-spin" />
            <p className="text-sm text-foreground">{t.create.parsing}</p>
            <p className="text-xs text-muted-foreground">{t.create.parsingDesc}</p>
          </div>
        )}

        {/* Step 2: Select skills */}
        {step === 2 && !done && (
          <div className="px-6 py-6 space-y-4">
            <p className="text-sm text-muted-foreground">{t.create.selectSkills}</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {parsedSkills.map((s, i) => (
                <label key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(i)}
                    onChange={(e) => {
                      const next = new Set(selected);
                      if (e.target.checked) next.add(i); else next.delete(i);
                      setSelected(next);
                    }}
                    className="mt-1 h-4 w-4 rounded border-border accent-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-medium text-foreground">{s.name}</span>
                      <span className="text-xs text-muted-foreground">v{s.version}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-between gap-2 pt-2">
              <Button variant="ghost" onClick={() => setStep(1)} className="text-muted-foreground"><ArrowLeft className="h-4 w-4 mr-1" />{t.create.back}</Button>
              <Button onClick={handleConfirm} disabled={selected.size === 0} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t.create.confirmCreate}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {done && (
          <div className="px-6 py-10 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
            <h3 className="text-lg font-semibold text-foreground">{t.create.successTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.create.successDesc}</p>
            <div className="flex justify-center gap-2 pt-2">
              <Button variant="outline" onClick={reset} className="border-border text-foreground">{t.common.confirm}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
