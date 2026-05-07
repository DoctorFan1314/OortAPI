"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, CheckCircle, FileCode, X } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { useToast } from "@/contexts/toast-context";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { AgentSkill } from "@/lib/types";

const ICONS = ["📦", "🔧", "🌐", "📊", "⚡", "🤖", "📧", "🔍", "🛠️", "💡", "🎯", "🚀"];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateFromUpload({ open, onClose, onCreated }: Props) {
  const { t } = useI18n();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SKILL_TYPES = [
    t.create.skillTypeWebDev,
    t.create.skillTypeCodeExec,
    t.create.skillTypeFileProc,
    t.create.skillTypeDataAnalysis,
    t.create.skillTypeMultiPlatform,
    t.create.skillTypeCommunication,
    t.create.skillTypeOther,
  ];
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [owner, setOwner] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [description, setDescription] = useState("");
  const [skillType, setSkillType] = useState(SKILL_TYPES[0]);
  const [tags, setTags] = useState("");
  const [icon, setIcon] = useState("📦");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  if (!open) return null;

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") reset();
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, handleEscape]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setFileContent(text);
    };
    reader.readAsText(file);
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t.create.nameRequired;
    if (!displayName.trim()) errs.displayName = t.create.displayNameRequired;
    if (!owner.trim()) errs.owner = t.create.ownerRequired;
    if (!description.trim()) errs.desc = t.create.descRequired;
    if (!fileName) errs.file = t.create.fileRequired;
    return errs;
  }

  function handleSubmit() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const tagsList = tags ? tags.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const skill: AgentSkill = {
      id: `custom-${crypto.randomUUID()}`,
      name: name.trim(),
      title: displayName.trim(),
      description: description.trim(),
      avatar: icon,
      author: `@${owner.trim()}`,
      developer: owner.trim(),
      downloads: 0,
      stars: 0,
      lastUpdated: new Date().toISOString().slice(0, 10),
      collection: "Community",
      category: skillType,
      categorySlug: skillType.toLowerCase().replace(/\s+/g, "-"),
      installCommand: `npx skills add @${owner.trim()}/${name.trim()}`,
      readme: fileContent || `# ${name.trim()}\n\n${description.trim()}`,
      license: "MIT",
      version: "1.0.0",
      files: { [fileName || "SKILL.md"]: fileContent || `# ${name.trim()}` },
      demoInput: "",
      demoOutput: "",
      triggers: [],
      tags: tagsList,
      featured: false,
      trending: false,
    };

    const stored = localStorage.getItem(STORAGE_KEYS.publishedSkills);
    const published: AgentSkill[] = stored ? JSON.parse(stored) : [];
    published.push(skill);
    localStorage.setItem(STORAGE_KEYS.publishedSkills, JSON.stringify(published));

    setDone(true);
    toast(t.create.successTitle, "success");
    onCreated();
  }

  function reset() {
    setName(""); setDisplayName(""); setSourceUrl(""); setOwner("");
    setIsPublic(true); setDescription(""); setSkillType(SKILL_TYPES[0]);
    setTags(""); setIcon("📦"); setFileName(""); setFileContent("");
    setErrors({}); setDone(false);
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
            <h3 className="text-sm font-semibold text-foreground">{t.create.englishName}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-foreground mb-1.5 block">{t.create.englishName} <span className="text-red-400">*</span></label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="web-scraper" className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 font-mono text-sm" />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-sm text-foreground mb-1.5 block">{t.create.displayName} <span className="text-red-400">*</span></label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t.create.displayNamePlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
                {errors.displayName && <p className="text-xs text-red-400 mt-1">{errors.displayName}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-foreground mb-1.5 block">{t.create.sourceUrl}</label>
                <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder={t.create.sourceUrlPlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 text-sm" />
              </div>
              <div>
                <label className="text-sm text-foreground mb-1.5 block">{t.create.owner} <span className="text-red-400">*</span></label>
                <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder={t.create.ownerPlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
                {errors.owner && <p className="text-xs text-red-400 mt-1">{errors.owner}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm text-foreground mb-1.5 block">{t.create.isPublic}</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${isPublic ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-border"}`}
                >
                  {t.create.publicLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${!isPublic ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-border"}`}
                >
                  {t.create.privateLabel}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-foreground mb-1.5 block">{t.create.description} <span className="text-red-400">*</span></label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder={t.create.descriptionPlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 text-sm" />
              {errors.desc && <p className="text-xs text-red-400 mt-1">{errors.desc}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-foreground mb-1.5 block">{t.create.skillType}</label>
                <select value={skillType} onChange={(e) => setSkillType(e.target.value)} className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm text-foreground">
                  {SKILL_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-foreground mb-1.5 block">{t.create.customTags}</label>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t.create.customTagsPlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
              </div>
            </div>

            <div>
              <label className="text-sm text-foreground mb-1.5 block">{t.create.icon}</label>
              <div>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-secondary hover:border-primary/30 transition-colors"
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs text-muted-foreground">{t.create.changeIcon}</span>
                </button>
                {showIconPicker && (
                  <div className="mt-2 p-3 rounded-lg border border-border bg-card shadow-xl grid grid-cols-6 gap-2">
                    {ICONS.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => { setIcon(ic); setShowIconPicker(false); }}
                        className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg hover:bg-secondary transition-colors ${icon === ic ? "bg-primary/10 ring-1 ring-primary/30" : ""}`}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* File upload */}
            <div>
              <label className="text-sm text-foreground mb-1.5 block">{t.create.skillFile} <span className="text-red-400">*</span></label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 px-4 py-6 rounded-lg border border-dashed border-border bg-secondary/50 hover:border-primary/30 transition-colors cursor-pointer text-center"
              >
                <div className="flex-1">
                  {fileName ? (
                    <div className="flex items-center gap-2 justify-center">
                      <FileCode className="h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground">{fileName}</span>
                      <button onClick={(e) => { e.stopPropagation(); setFileName(""); setFileContent(""); }} className="text-muted-foreground hover:text-red-400">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                      <p className="text-sm text-muted-foreground">{t.create.noFileSelected}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{t.create.uploadHint}</p>
                    </>
                  )}
                </div>
              </div>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".md,.ts,.js,.json,.py,.txt,.yaml,.yml" />
              {errors.file && <p className="text-xs text-red-400 mt-1">{errors.file}</p>}
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
