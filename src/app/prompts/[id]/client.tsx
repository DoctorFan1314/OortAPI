"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { getSkillById } from "@/lib/mock-data";
import { COLORS } from "@/lib/theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Star, Users, Clock, Copy, Check, ThumbsUp, Bookmark, Share2, ArrowLeft, ChevronDown, ChevronUp, History } from "lucide-react";
import { useUserStorage } from "@/hooks/use-user-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useAuth } from "@/contexts/auth-context";
import { CommentSection } from "@/components/skill/comment-section";
import { SkillCard } from "@/components/skill/skill-card";
import { getRelatedSkills } from "@/lib/related-skills";
import { getVersions, initVersionForSkill } from "@/lib/prompt-versions";
import type { PromptVersion } from "@/lib/prompt-versions";
import { useI18n } from "@/contexts/i18n-context";
import { getDifficultyLabel } from "@/lib/utils";

function CopyButton({ text, label, copiedLabel, failedLabel }: { text: string; label: string; copiedLabel: string; failedLabel: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  }, [text]);
  return (
    <Button onClick={handleCopy} className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
      {copied ? <><Check className="h-4 w-4 mr-2" />{copiedLabel}</> : error ? <><Copy className="h-4 w-4 mr-2" />{failedLabel}</> : <><Copy className="h-4 w-4 mr-2" />{label}</>}
    </Button>
  );
}

export default function SkillDetailClient({ id }: { id: string }) {
  const skill = getSkillById(id);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [likedIds, setLikedIds] = useUserStorage<string[]>(STORAGE_KEYS.likes, []);
  const [bookmarkedIds, setBookmarkedIds] = useUserStorage<string[]>(STORAGE_KEYS.bookmarks, []);
  const [shareError, setShareError] = useState(false);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const { user } = useAuth();
  const { t } = useI18n();

  const liked = likedIds.includes(id);
  const bookmarked = bookmarkedIds.includes(id);

  const toggleLike = () => {
    setLikedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  const toggleBookmark = () => {
    setBookmarkedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  useEffect(() => {
    if (!skill || !user) return;
    try {
      const key = STORAGE_KEYS.activity(user.email);
      const raw = localStorage.getItem(key);
      const activities = raw ? JSON.parse(raw) : [];
      activities.unshift({
        id: Date.now().toString(36),
        type: "view",
        skillId: id,
        targetTitle: skill.title,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(activities.slice(0, 100)));
    } catch { /* ignore */ }
  }, [id, skill, user]);

  useEffect(() => {
    if (!skill) return;
    initVersionForSkill(skill);
    setVersions(getVersions(skill.id));
  }, [skill]);

  if (!skill) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg">{t.promptDetail.notFound}</p>
        <Link href="/prompts" className="text-primary mt-4 inline-block hover:underline">{t.promptDetail.backToList}</Link>
      </div>
    );
  }

  const color = COLORS.category[skill.categorySlug] || COLORS.primary;
  const relatedSkills = getRelatedSkills(skill);

  const buildPrompt = (template: string) => {
    let result = template;
    for (const [key, value] of Object.entries(variableValues)) {
      if (value) result = result.replaceAll(`{{${key}}}`, value);
    }
    return result;
  };

  const promptOnline = buildPrompt(skill.promptOnline);
  const promptLocal = buildPrompt(skill.promptLocal);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: skill?.title, url }); } catch { /* user cancelled share */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareError(false);
      } catch {
        setShareError(true);
        setTimeout(() => setShareError(false), 3000);
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <Link href="/prompts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />{t.promptDetail.backToList}
      </Link>

      {/* Hero */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs border" style={{ color, borderColor: `${color}30`, backgroundColor: `${color}10` }}>{skill.category}</Badge>
          <Badge variant="secondary" className="text-xs bg-secondary border-border text-muted-foreground">{getDifficultyLabel(skill.difficulty, t)}</Badge>
          <span className="text-xs text-muted-foreground">{skill.version}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{skill.title}</h1>
        <p className="text-muted-foreground leading-relaxed mb-4">{skill.subtitle}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />{skill.rating}/5</span>
          <span className="flex items-center gap-1"><Users className="h-4 w-4" />{skill.usageCount}+ {t.prompts.usageCount}</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{skill.lastUpdated}</span>
        </div>
      </div>

      {/* Prompt copy */}
      <div className="glass-card p-6 mb-8 glow-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">{t.promptDetail.copyPrompt}</h2>
        <Tabs defaultValue="online">
          <TabsList className="bg-secondary border border-border mb-4">
            <TabsTrigger value="online" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground">{t.promptDetail.onlineVersion}</TabsTrigger>
            <TabsTrigger value="local" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground">{t.promptDetail.localVersion}</TabsTrigger>
          </TabsList>
          <TabsContent value="online">
            <p className="text-xs text-muted-foreground mb-3">{t.promptDetail.onlineDesc}</p>
            <div className="bg-secondary border border-border rounded-lg p-4 mb-4 max-h-64 overflow-y-auto scrollbar-hide">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">{promptOnline}</pre>
            </div>
            <CopyButton text={promptOnline} label={t.promptDetail.copyPrompt} copiedLabel={t.common.copied} failedLabel={t.promptDetail.copyFailed} />
          </TabsContent>
          <TabsContent value="local">
            <p className="text-xs text-muted-foreground mb-3">{t.promptDetail.localDesc}</p>
            <div className="bg-secondary border border-border rounded-lg p-4 mb-4 max-h-64 overflow-y-auto scrollbar-hide">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">{promptLocal}</pre>
            </div>
            <CopyButton text={promptLocal} label={t.promptDetail.copyPrompt} copiedLabel={t.common.copied} failedLabel={t.promptDetail.copyFailed} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Variable form */}
      {skill.variables.length > 0 && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t.promptDetail.variables}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t.promptDetail.variablesDesc}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {skill.variables.map((v) => (
              <div key={v.name}>
                <label className="text-sm text-foreground mb-1.5 block">{v.name}{v.required && <span className="text-red-400 ml-1">*</span>}</label>
                <Input placeholder={v.placeholder} value={variableValues[v.name] || ""} onChange={(e) => setVariableValues((prev) => ({ ...prev, [v.name]: e.target.value }))} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Before/After */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">{t.promptDetail.beforeAfter}</h2>
        <div className="mb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">{t.promptDetail.input}</p>
          <div className="bg-secondary border border-border rounded-lg p-4 text-sm text-foreground">{skill.beforeAfter.input}</div>
        </div>
        {skill.beforeAfter.outputs.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">{t.promptDetail.output}</p>
            {skill.beforeAfter.outputs.length > 1 ? (
              <Tabs defaultValue="0">
                <TabsList className="bg-secondary border border-border mb-3">
                  {skill.beforeAfter.outputs.map((o, i) => (
                    <TabsTrigger key={i} value={String(i)} className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground text-xs">{o.model}</TabsTrigger>
                  ))}
                </TabsList>
                {skill.beforeAfter.outputs.map((o, i) => (
                  <TabsContent key={i} value={String(i)}>
                    <div className="bg-gradient-to-b from-primary/5 to-transparent border border-primary/20 rounded-lg p-4 max-h-96 overflow-y-auto scrollbar-hide">
                      <pre className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{o.text}</pre>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="bg-gradient-to-b from-primary/5 to-transparent border border-primary/20 rounded-lg p-4 max-h-96 overflow-y-auto scrollbar-hide">
                <pre className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{skill.beforeAfter.outputs[0].text}</pre>
              </div>
            )}
          </div>
        )}
        <div className="mt-4 text-xs text-muted-foreground/60">{t.promptDetail.temperature}：0.7 | {t.promptDetail.effectNote}</div>
      </div>

      {/* Usage Steps */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">{t.promptDetail.usage}</h2>
        <Tabs defaultValue="online">
          <TabsList className="bg-secondary border border-border mb-4">
            <TabsTrigger value="online" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground">{t.promptDetail.onlinePlatform}</TabsTrigger>
            <TabsTrigger value="local" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground">{t.promptDetail.localModel}</TabsTrigger>
          </TabsList>
          <TabsContent value="online">
            <ol className="space-y-2">
              {skill.usageStepsOnline.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </TabsContent>
          <TabsContent value="local">
            <ol className="space-y-2">
              {skill.usageStepsLocal.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </TabsContent>
        </Tabs>
      </div>

      {/* Recommended Models */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">{t.promptDetail.models}（{t.promptDetail.modelsYear}）</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]" aria-label={t.promptDetail.modelsTableLabel}>
            <caption className="sr-only">{t.promptDetail.modelsTableCaption}</caption>
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 text-muted-foreground font-medium">{t.promptDetail.modelName}</th>
                <th className="text-left py-3 pr-4 text-muted-foreground font-medium">{t.promptDetail.modelStrengths}</th>
                <th className="text-left py-3 pr-4 text-muted-foreground font-medium">{t.promptDetail.modelUseCase}</th>
                <th className="text-left py-3 text-muted-foreground font-medium">{t.promptDetail.modelAudience}</th>
              </tr>
            </thead>
            <tbody>
              {skill.recommendedModels.map((model, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4 text-foreground font-medium">{model.name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{model.strengths}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{model.useCase}</td>
                  <td className="py-3 text-muted-foreground">{model.audience}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced tips */}
      {skill.advancedTips && skill.advancedTips.length > 0 && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t.promptDetail.advancedTips}</h2>
          <ul className="space-y-2">
            {skill.advancedTips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground"><span className="text-primary">•</span>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Version History */}
      {versions.length > 0 && (
        <div className="glass-card p-6 mb-8">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => setShowVersions(!showVersions)}
          >
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <History className="h-5 w-5" />{t.promptDetail.versionHistory}
            </h2>
            {showVersions ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
          </button>
          {showVersions && (
            <div className="mt-4 space-y-3">
              {versions.map((v) => (
                <div key={v.id} className="flex items-start gap-4 p-3 rounded-lg bg-secondary border border-border">
                  <div className="flex-shrink-0 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono font-medium">{v.version}</div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{v.changelog}</p>
                    <p className="text-xs text-muted-foreground mt-1">{v.updatedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comments */}
      <CommentSection skillId={id} skillTitle={skill.title} />

      {/* Related Skills */}
      {relatedSkills.length > 0 && (
        <div className="mt-12 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-5">{t.promptDetail.relatedSkills}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedSkills.map((s) => (
              <SkillCard key={s.id} skill={s} />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mb-12">
        <Button variant="outline" size="sm" className={`border-border ${liked ? "text-primary border-primary/30" : "text-muted-foreground"} hover:bg-secondary`} onClick={toggleLike} aria-label={t.common.like}>
          <ThumbsUp className={`h-4 w-4 mr-1.5 ${liked ? "fill-current" : ""}`} />{skill.likes + (liked ? 1 : 0)}
        </Button>
        <Button variant="outline" size="sm" className={`border-border ${bookmarked ? "text-yellow-400 border-yellow-400/30" : "text-muted-foreground"} hover:bg-secondary`} onClick={toggleBookmark} aria-label={t.common.bookmark}>
          <Bookmark className={`h-4 w-4 mr-1.5 ${bookmarked ? "fill-current" : ""}`} />{t.common.bookmark}
        </Button>
        <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-secondary" onClick={handleShare} aria-label={t.common.share}>
          <Share2 className="h-4 w-4 mr-1.5" />{shareError ? t.promptDetail.copyFailed : t.common.share}
        </Button>
      </div>
    </div>
  );
}
