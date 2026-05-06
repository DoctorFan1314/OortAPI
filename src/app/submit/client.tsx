"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, CheckCircle } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useI18n } from "@/contexts/i18n-context";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Submission } from "@/lib/types";
import { categories } from "@/lib/categories";

const categoryOptions = categories.map((c) => ({ name: c.name, slug: c.slug }));

export default function SubmitClient() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const key = user ? STORAGE_KEYS.submissions(user.email) : "ai-skills-hub-submissions-guest";
  const [submissions, setSubmissions] = useLocalStorage<Submission[]>(key, []);
  const { toast } = useToast();
  const { t } = useI18n();

  function validate(fd: FormData): Record<string, string> {
    const errs: Record<string, string> = {};
    const name = (fd.get("name") as string)?.trim();
    const shortDesc = (fd.get("short-desc") as string)?.trim();
    const prompt = (fd.get("prompt-online") as string)?.trim();
    const usage = (fd.get("usage") as string)?.trim();

    if (!name) errs.name = t.submit.nameRequired;
    else if (name.length < 2) errs.name = t.submit.nameMinLength;
    if (!shortDesc) errs.shortDesc = t.submit.shortDescRequired;
    if (!selectedCategory) errs.category = t.submit.categoryRequired;
    if (!prompt) errs.promptOnline = t.submit.promptRequired;
    else if (prompt.length < 20) errs.promptOnline = t.submit.promptMinLength;
    if (!usage) errs.usage = t.submit.usageRequired;
    return errs;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs = validate(fd);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const submission: Submission = {
      id: Date.now().toString(36),
      name: (fd.get("name") as string).trim(),
      shortDesc: (fd.get("short-desc") as string).trim(),
      category: selectedCategory!,
      categorySlug: selectedSlug || "content",
      promptOnline: (fd.get("prompt-online") as string).trim(),
      promptLocal: (fd.get("prompt-local") as string)?.trim() || "",
      usage: (fd.get("usage") as string).trim(),
      submittedAt: new Date().toISOString(),
      authorEmail: user?.email || "",
      authorName: user?.username || "匿名用户",
      status: "pending",
      version: "v1.0",
    };

    setSubmissions((prev) => [...prev, submission]);
    setSubmitted(true);
    toast(t.submit.savedLocally, "success");
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-3">{t.submit.successTitle}</h1>
        <p className="text-muted-foreground mb-6">{t.submit.successDesc}</p>
        <Button onClick={() => setSubmitted(false)} variant="outline" className="border-border text-foreground hover:bg-secondary">{t.submit.continueSubmit}</Button>

        {submissions.length > 0 && (
          <div className="mt-10 text-left">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t.submit.mySubmissions} ({submissions.length})</h2>
            <div className="space-y-3">
              {submissions.map((s) => (
                <div key={s.id} className="glass-card p-4 text-left">
                  <p className="text-foreground font-medium">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{s.category} · {new Date(s.submittedAt).toLocaleDateString("zh-CN")}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.submit.title}</h1>
        <p className="text-muted-foreground">{t.submit.subtitle}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-foreground">{t.submit.basicInfo}</h2>
          <div>
            <label htmlFor="name" className="text-sm text-foreground mb-1.5 block">{t.submit.templateName} <span className="text-red-400">*</span></label>
            <Input id="name" name="name" required placeholder={t.submit.templateNamePlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="short-desc" className="text-sm text-foreground mb-1.5 block">{t.submit.shortDesc} <span className="text-red-400">*</span></label>
            <Input id="short-desc" name="short-desc" required placeholder={t.submit.shortDescPlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
            {errors.shortDesc && <p className="text-xs text-red-400 mt-1">{errors.shortDesc}</p>}
          </div>
          <div>
            <span className="text-sm text-foreground mb-2 block">{t.submit.category} <span className="text-red-400">*</span></span>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => { setSelectedCategory(cat.name); setSelectedSlug(cat.slug); }}
                  className={`px-4 py-1.5 text-sm rounded-md border transition-colors cursor-pointer ${
                    selectedCategory === cat.name
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-secondary text-muted-foreground border-border hover:border-primary/30 hover:text-primary hover:bg-primary/10"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category}</p>}
          </div>
        </div>
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-foreground">{t.submit.promptContent}</h2>
          <div>
            <label htmlFor="prompt-online" className="text-sm text-foreground mb-1.5 block">{t.submit.onlinePrompt} <span className="text-red-400">*</span></label>
            <Textarea id="prompt-online" name="prompt-online" required rows={8} placeholder={t.submit.onlinePlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 font-mono text-sm" />
            {errors.promptOnline && <p className="text-xs text-red-400 mt-1">{errors.promptOnline}</p>}
          </div>
          <div>
            <label htmlFor="prompt-local" className="text-sm text-foreground mb-1.5 block">{t.submit.localPrompt}</label>
            <Textarea id="prompt-local" name="prompt-local" rows={6} placeholder={t.submit.localPlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 font-mono text-sm" />
          </div>
          <div>
            <label htmlFor="usage" className="text-sm text-foreground mb-1.5 block">{t.submit.usage} <span className="text-red-400">*</span></label>
            <Textarea id="usage" name="usage" required rows={4} placeholder={t.submit.usagePlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 text-sm" />
            {errors.usage && <p className="text-xs text-red-400 mt-1">{errors.usage}</p>}
          </div>
        </div>
        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium h-12 text-base">
          <Send className="h-4 w-4 mr-2" />{t.submit.submitBtn}
        </Button>
      </form>
    </div>
  );
}
