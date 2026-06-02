"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { BookOpen, Plus, Trash2, X, Save, FileText } from "lucide-react";

interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: number;
}

const STORAGE_KEY = "oortapi-prompt-library";

function loadTemplates(): PromptTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTemplates(templates: PromptTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

interface PromptLibraryProps {
  onSelect: (content: string) => void;
  open: boolean;
  onClose: () => void;
}

export function PromptLibrary({ onSelect, open, onClose }: PromptLibraryProps) {
  const { lang } = useI18n();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [newName, setNewName] = useState("");
  const [newContent, setNewContent] = useState("");

  useEffect(() => { if (open) setTemplates(loadTemplates()); }, [open]);

  const addTemplate = () => {
    if (!newName.trim() || !newContent.trim()) return;
    const tpl: PromptTemplate = { id: Date.now().toString(36), name: newName.trim(), content: newContent.trim(), createdAt: Date.now() };
    const next = [...templates, tpl];
    setTemplates(next);
    saveTemplates(next);
    setNewName(""); setNewContent("");
  };

  const deleteTemplate = (id: string) => {
    const next = templates.filter((t) => t.id !== id);
    setTemplates(next);
    saveTemplates(next);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label={lang === "zh" ? "提示词模板" : "Prompt Templates"} onClick={onClose}>
      <div className="bg-card border border-border/70 rounded-xl p-5 max-w-md w-full mx-auto shadow-2xl max-h-[80vh] flex flex-col animate-page-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />{lang === "zh" ? "提示词模板" : "Prompt Templates"}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors" aria-label={lang === "zh" ? "关闭" : "Close"}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        {/* Template list */}
        <div className="flex-1 overflow-y-auto space-y-1 min-h-0 mb-3">
          {templates.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">{lang === "zh" ? "暂无模板，创建一个吧" : "No templates yet. Create one below."}</p>
          ) : (
            templates.map((tpl) => (
              <div key={tpl.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors group">
                <button onClick={() => { onSelect(tpl.content); onClose(); }} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-foreground truncate">{tpl.name}</span>
                </button>
                <button onClick={() => deleteTemplate(tpl.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all p-0.5" aria-label="Delete"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))
          )}
        </div>

        {/* Add new template */}
        <div className="space-y-2 pt-3 border-t border-border/30">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={lang === "zh" ? "模板名称" : "Template name"} className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs focus:border-primary focus:outline-none" />
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder={lang === "zh" ? "提示词内容" : "Prompt content"} rows={3} className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-xs font-mono resize-none focus:border-primary focus:outline-none" />
          <button onClick={addTemplate} disabled={!newName.trim() || !newContent.trim()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save className="h-3 w-3" />{lang === "zh" ? "保存模板" : "Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
}
