"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Send, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useToast } from "@/contexts/toast-context";
import { useI18n } from "@/contexts/i18n-context";
import { useLocale } from "@/hooks/use-locale";
import type { Submission } from "@/lib/types";

export default function SubmitStatusClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const locale = useLocale();
  const key = user ? STORAGE_KEYS.submissions(user.email) : "ai-skills-hub-submissions-guest";
  const [submissions, setSubmissions] = useLocalStorage<Submission[]>(key, []);

  const STATUS_MAP: Record<Submission["status"], { label: string; icon: React.ReactNode; color: string }> = {
    pending: { label: t.submit.statusPending, icon: <Clock className="h-4 w-4" />, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
    approved: { label: t.submit.statusApproved, icon: <CheckCircle className="h-4 w-4" />, color: "text-green-400 bg-green-400/10 border-green-400/20" },
    rejected: { label: t.submit.statusRejected, icon: <XCircle className="h-4 w-4" />, color: "text-red-400 bg-red-400/10 border-red-400/20" },
  };

  function handleDelete(id: string) {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    toast(t.submit.recordDeleted);
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg mb-4">{t.submit.loginToView}</p>
        <Link href="/login">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">{t.common.login}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <Link href="/submit" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />{t.submit.backToSubmit}
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.submit.viewHistory}</h1>
        <p className="text-muted-foreground">{t.submit.viewHistoryDesc}</p>
      </div>

      {submissions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Send className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-4">{t.submit.noSubmissionsYet}</p>
          <Link href="/submit">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">{t.submit.goToSubmit}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => {
            const status = STATUS_MAP[s.status];
            return (
              <div key={s.id} className="glass-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-foreground font-semibold">{s.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{s.shortDesc}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                    {status.icon}{status.label}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{s.category} · {s.version} · {new Date(s.submittedAt).toLocaleDateString(locale)}</span>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />{t.common.delete}
                  </button>
                </div>
                {s.reviewNote && (
                  <div className="mt-3 p-3 rounded-lg bg-secondary border border-border text-sm text-muted-foreground">
                    <span className="text-foreground font-medium">{t.submit.reviewNoteLabel}</span>{s.reviewNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
