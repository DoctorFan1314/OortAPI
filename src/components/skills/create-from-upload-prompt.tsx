"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, CheckCircle, X } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { useToast } from "@/contexts/toast-context";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { categories } from "@/lib/categories";
import type { Skill } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateFromUploadPrompt({ open, onClose, onCreated }: Props) {
  const { t } = useI18n();
  const { toast } = useToast();
  const DIFFICULTIES = [
    { key: "新手友好" as const, label: t.create.difficultyEasy },
    { key: "进阶" as const, label: t.create.difficultyMedium },
    { key: "高级" as const, label: t.create.difficultyHard },
  ];
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0].slug);
  const [difficulty, setDifficulty] = useState<"新手友好" | "进阶" | "高级">("新手友好");
  const [promptOnline, setPromptOnline] = useState("");
  const [promptLocal, setPromptLocal] = useState("");
  const [version, setVersion] = useState("v1.0");
  const [tags, setTags] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  if (!open) return null;

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = t.create.displayNameRequired;
    if (!description.trim()) errs.desc = t.create.descRequired;
    if (!promptOnline.trim() && !promptLocal.trim()) errs.prompt = t.create.promptRequired;
    return errs;
  }

  function handleSubmit() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const cat = categories.find((c) => c.slug === categorySlug) || categories[0];
    const tagsList = tags ? tags.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const skill: Skill = {
      id: `custom-prompt-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || title.trim(),
      description: description.trim(),
      category: cat.name,
      categorySlug: cat.slug,
      difficulty,
      rating: 0,
      usageCount: 0,
      lastUpdated: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
      version: version.trim() || "v1.0",
      tags: tagsList,
      featured: false,
      trending: false,
      beginner: difficulty === "新手友好",
      promptOnline: promptOnline.trim(),
      promptLocal: promptLocal.trim(),
      variables: [],
      beforeAfter: { input: "", outputs: [] },
      recommendedModels: [],
      usageStepsOnline: [],
      usageStepsLocal: [],
      likes: 0,
    };

    const stored = localStorage.getItem(STORAGE_KEYS.publishedPrompts);
    const published: Skill[] = stored ? JSON.parse(stored) : [];
    published.push(skill);
    localStorage.setItem(STORAGE_KEYS.publishedPrompts, JSON.stringify(published));

    setDone(true);
    toast(t.create.successTitle, "success");
    onCreated();
  }

  function reset() {
    setTitle(""); setSubtitle(""); setDescription("");
    setCategorySlug(categories[0].slug); setDifficulty("新手友好");
    setPromptOnline(""); setPromptLocal(""); setVersion("v1.0");
    setTags(""); setErrors({}); setDone(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={reset}>
      <div className="w-full max-w-2xl mx-4 rounded-2xl border border-border bg-card shadow-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
          <Upload className="h-5 w-5 text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">{t.create.customCreate}</h2>
          <button onClick={reset} className="ml-auto text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        {done ? (
          <div className="px-6 py-10 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
            <h3 className="text-lg font-semibold text-foreground">{t.create.successTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.create.successDesc}</p>
            <Button variant="outline" onClick={reset} className="border-border text-foreground">{t.common.confirm}</Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {/* Basic Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-foreground mb-1.5 block">{t.create.templateTitle} <span className="text-red-400">*</span></label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.create.templateTitlePlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
                {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="text-sm text-foreground mb-1.5 block">{t.create.templateSubtitle}</label>
                <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder={t.create.templateSubtitlePlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
              </div>
            </div>

            <div>
              <label className="text-sm text-foreground mb-1.5 block">{t.create.templateDesc} <span className="text-red-400">*</span></label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder={t.create.templateDescPlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 text-sm" />
              {errors.desc && <p className="text-xs text-red-400 mt-1">{errors.desc}</p>}
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-foreground mb-1.5 block">{t.create.templateCategory}</label>
                <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm text-foreground">
                  {categories.map((c) => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-foreground mb-1.5 block">{t.create.templateDifficulty}</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)} className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm text-foreground">
                  {DIFFICULTIES.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-foreground mb-1.5 block">{t.create.promptVersion}</label>
                <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="v1.0" className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 font-mono text-sm" />
              </div>
            </div>

            <div>
              <label className="text-sm text-foreground mb-1.5 block">{t.create.promptOnline} <span className="text-red-400">*</span></label>
              <Textarea value={promptOnline} onChange={(e) => setPromptOnline(e.target.value)} rows={5} placeholder={t.create.promptOnlinePlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 text-sm font-mono" />
              {errors.prompt && <p className="text-xs text-red-400 mt-1">{errors.prompt}</p>}
            </div>

            <div>
              <label className="text-sm text-foreground mb-1.5 block">{t.create.promptLocal}</label>
              <Textarea value={promptLocal} onChange={(e) => setPromptLocal(e.target.value)} rows={5} placeholder={t.create.promptLocalPlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 text-sm font-mono" />
            </div>

            <div>
              <label className="text-sm text-foreground mb-1.5 block">{t.create.templateTags}</label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t.create.templateTagsPlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
            </div>
          </div>
        )}

        {/* Footer */}
        {!done && (
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-border shrink-0">
            <Button variant="ghost" onClick={reset} className="text-muted-foreground">{t.common.cancel}</Button>
            <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {t.create.finish}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
