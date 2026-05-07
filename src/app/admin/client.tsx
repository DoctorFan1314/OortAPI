"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/contexts/i18n-context";
import { useLocale } from "@/hooks/use-locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Submission, Comment } from "@/lib/types";
import { Shield, Users, BarChart3, MessageSquare, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import Link from "next/link";

const ADMIN_EMAILS = ["admin@aiskillshub.com"];

export default function AdminClient() {
  const { user } = useAuth();
  const { t } = useI18n();
  const locale = useLocale();
  const [tab, setTab] = useState<"pending" | "users" | "analytics" | "comments">("pending");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<{ email: string; username: string }[]>([]);
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});

  const TABS = [
    { key: "pending" as const, label: t.admin.pendingSubmissions, icon: <Clock className="h-4 w-4" /> },
    { key: "users" as const, label: t.admin.userManage, icon: <Users className="h-4 w-4" /> },
    { key: "analytics" as const, label: t.admin.skillAnalytics, icon: <BarChart3 className="h-4 w-4" /> },
    { key: "comments" as const, label: t.admin.commentManage, icon: <MessageSquare className="h-4 w-4" /> },
  ];

  useEffect(() => {
    // Load all submissions from all users
    try {
      const allSubs: Submission[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("ai-skills-hub-submissions-")) {
          const raw = localStorage.getItem(key);
          if (raw) allSubs.push(...JSON.parse(raw));
        }
      }
      setSubmissions(allSubs);
    } catch { /* ignore */ }

    // Load all comments
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.allComments);
      setComments(raw ? JSON.parse(raw) : []);
    } catch { /* ignore */ }

    // Load all users
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.users);
      const stored = raw ? JSON.parse(raw) : [];
      setUsers(stored.map((u: { email: string; username: string }) => ({ email: u.email, username: u.username })));
    } catch { /* ignore */ }
  }, []);

  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Shield className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-3">{t.admin.noAccess}</h1>
        <p className="text-muted-foreground mb-6">{t.admin.noAccessDesc}</p>
        <Link href="/"><Button variant="outline" className="border-border text-foreground hover:bg-secondary">{t.admin.backHome}</Button></Link>
      </div>
    );
  }

  function handleReview(id: string, status: "approved" | "rejected") {
    const note = reviewNote[id] || "";
    // Update localStorage first (read from source, not from state)
    try {
      const key = STORAGE_KEYS.submissions(
        submissions.find((s) => s.id === id)?.authorEmail || ""
      );
      const raw = localStorage.getItem(key);
      const list: Submission[] = raw ? JSON.parse(raw) : [];
      const updated = list.map((s) => (s.id === id ? { ...s, status, reviewNote: note } : s));
      localStorage.setItem(key, JSON.stringify(updated));
    } catch { /* ignore */ }
    // Then update state
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, reviewNote: note } : s))
    );
  }

  function handleDeleteComment(id: string) {
    setComments((prev) => prev.filter((c) => c.id !== id));
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.allComments);
      const list: Comment[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(STORAGE_KEYS.allComments, JSON.stringify(list.filter((c) => c.id !== id)));
    } catch { /* ignore */ }
  }

  const pendingSubs = submissions.filter((s) => s.status === "pending");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />{t.admin.title}
        </h1>
        <p className="text-muted-foreground">{t.admin.adminSubtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              tab === t.key ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {t.icon}{t.label}
            {t.key === "pending" && pendingSubs.length > 0 && (
              <Badge className="ml-1 bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-1.5">{pendingSubs.length}</Badge>
            )}
          </button>
        ))}
      </div>

      {tab === "pending" && (
        <div className="space-y-4">
          {pendingSubs.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-400/50 mx-auto mb-3" />
              <p className="text-muted-foreground">{t.admin.noPending}</p>
            </div>
          ) : (
            pendingSubs.map((s) => (
              <div key={s.id} className="glass-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-foreground font-semibold">{s.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{s.shortDesc}</p>
                    <p className="text-xs text-muted-foreground mt-2">{s.category} · {s.authorName} ({s.authorEmail}) · {new Date(s.submittedAt).toLocaleDateString(locale)}</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">{t.admin.pendingSubmissions}</Badge>
                </div>
                <div className="bg-secondary border border-border rounded-lg p-3 mb-3 max-h-32 overflow-y-auto">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">{s.promptOnline}</pre>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    value={reviewNote[s.id] || ""}
                    onChange={(e) => setReviewNote((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    placeholder={t.admin.reviewNotePlaceholder}
                    className="flex-1 h-9 px-3 text-sm bg-secondary border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => handleReview(s.id, "approved")} className="bg-green-600 text-white hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-1.5" />{t.admin.approve}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReview(s.id, "rejected")} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <XCircle className="h-4 w-4 mr-1.5" />{t.admin.reject}
                  </Button>
                </div>
              </div>
            ))
          )}
          {submissions.filter((s) => s.status !== "pending").length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">{t.admin.reviewed}</h2>
              <div className="space-y-3">
                {submissions.filter((s) => s.status !== "pending").map((s) => (
                  <div key={s.id} className="glass-card p-4 flex items-center justify-between">
                    <div>
                      <p className="text-foreground font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.authorName} · {new Date(s.submittedAt).toLocaleDateString(locale)}</p>
                    </div>
                    <Badge variant="secondary" className={s.status === "approved" ? "bg-green-400/10 text-green-400 border-green-400/20" : "bg-red-400/10 text-red-400 border-red-400/20"}>
                      {s.status === "approved" ? t.admin.approved : t.admin.rejected}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "users" && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t.admin.registeredUsers} ({users.length})</h2>
          {users.length === 0 ? (
            <p className="text-muted-foreground">{t.admin.noUsers}</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.email} className="flex items-center gap-3 p-3 rounded-lg bg-secondary border border-border">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium">{u.username}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  {ADMIN_EMAILS.includes(u.email) && (
                    <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary border-primary/20 text-[10px]">{t.admin.adminBadge}</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "analytics" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-bold text-foreground">{users.length}</p>
            <p className="text-sm text-muted-foreground mt-1">{t.admin.registeredUsers}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-bold text-foreground">{submissions.length}</p>
            <p className="text-sm text-muted-foreground mt-1">{t.admin.totalSubmissions}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-bold text-foreground">{comments.length}</p>
            <p className="text-sm text-muted-foreground mt-1">{t.admin.totalComments}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-bold text-foreground">{pendingSubs.length}</p>
            <p className="text-sm text-muted-foreground mt-1">{t.admin.pendingSubmissions}</p>
          </div>
        </div>
      )}

      {tab === "comments" && (
        <div className="space-y-3">
          {comments.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">{t.admin.noComments}</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="glass-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-foreground font-medium text-sm">{c.username}</p>
                    <p className="text-xs text-muted-foreground">{t.admin.skillPrefix}{c.skillId} · {new Date(c.createdAt).toLocaleDateString(locale)}</p>
                  </div>
                  <button onClick={() => handleDeleteComment(c.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{c.content}</p>
                {c.rating && <p className="text-xs text-yellow-400 mt-1">{"★".repeat(c.rating)}{"☆".repeat(5 - c.rating)}</p>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
