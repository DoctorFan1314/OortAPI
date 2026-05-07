"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useI18n } from "@/contexts/i18n-context";
import { useLocale } from "@/hooks/use-locale";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Comment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, MessageSquare, Pencil, Trash2, X, Check } from "lucide-react";

export function CommentSection({ skillId, skillTitle }: { skillId: string; skillTitle: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const locale = useLocale();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [, setTick] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load comments from global store
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.allComments);
      const all: Comment[] = raw ? JSON.parse(raw) : [];
      setComments(all.filter((c) => c.skillId === skillId));
    } catch { /* ignore */ }
  }, [skillId]);

  function handleSubmit() {
    if (!user) { toast(t.comments.loginToComment, "error"); return; }
    if (!content.trim()) { toast(t.comments.commentRequired, "error"); return; }

    const comment: Comment = {
      id: crypto.randomUUID(),
      skillId,
      userEmail: user.email,
      username: user.username,
      content: content.trim(),
      rating: rating || undefined,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    };

    // Save to global
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.allComments);
      const all: Comment[] = raw ? JSON.parse(raw) : [];
      all.unshift(comment);
      localStorage.setItem(STORAGE_KEYS.allComments, JSON.stringify(all));
    } catch { /* ignore */ }

    // Save to user-scoped
    try {
      const key = STORAGE_KEYS.comments(user.email);
      const raw = localStorage.getItem(key);
      const userComments: Comment[] = raw ? JSON.parse(raw) : [];
      userComments.unshift(comment);
      localStorage.setItem(key, JSON.stringify(userComments));
    } catch { /* ignore */ }

    // Track activity
    try {
      const actKey = STORAGE_KEYS.activity(user.email);
      const raw = localStorage.getItem(actKey);
      const activities = raw ? JSON.parse(raw) : [];
      activities.unshift({
        id: crypto.randomUUID(),
        type: "comment",
        skillId,
        targetTitle: skillTitle,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(actKey, JSON.stringify(activities.slice(0, 100)));
    } catch { /* ignore */ }

    setComments((prev) => [comment, ...prev]);
    setContent("");
    setRating(0);
    toast(t.comments.commentPublished, "success");
  }

  function handleLike(commentId: string) {
    if (!user) { toast(t.comments.loginToComment, "error"); return; }
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.allComments);
      const all: Comment[] = raw ? JSON.parse(raw) : [];
      const idx = all.findIndex((c) => c.id === commentId);
      if (idx === -1) return;
      const likedBy = all[idx].likedBy || [];
      if (likedBy.includes(user.email)) {
        all[idx].likedBy = likedBy.filter((e) => e !== user.email);
        all[idx].likes = Math.max(0, all[idx].likes - 1);
      } else {
        all[idx].likedBy = [...likedBy, user.email];
        all[idx].likes += 1;
      }
      localStorage.setItem(STORAGE_KEYS.allComments, JSON.stringify(all));
      setComments(all.filter((c) => c.skillId === skillId));
      setTick((t) => t + 1);
    } catch { /* ignore */ }
  }

  function handleEdit(commentId: string) {
    const c = comments.find((x) => x.id === commentId);
    if (!c) return;
    setEditingId(commentId);
    setEditContent(c.content);
  }

  function handleSaveEdit(commentId: string) {
    if (!editContent.trim()) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.allComments);
      const all: Comment[] = raw ? JSON.parse(raw) : [];
      const idx = all.findIndex((c) => c.id === commentId);
      if (idx !== -1) {
        all[idx].content = editContent.trim();
        localStorage.setItem(STORAGE_KEYS.allComments, JSON.stringify(all));
        setComments(all.filter((c) => c.skillId === skillId));
      }
      // Sync user-scoped
      if (user) {
        const key = STORAGE_KEYS.comments(user.email);
        const uRaw = localStorage.getItem(key);
        const userComments: Comment[] = uRaw ? JSON.parse(uRaw) : [];
        const uIdx = userComments.findIndex((c) => c.id === commentId);
        if (uIdx !== -1) {
          userComments[uIdx].content = editContent.trim();
          localStorage.setItem(key, JSON.stringify(userComments));
        }
      }
    } catch { /* ignore */ }
    setEditingId(null);
    setEditContent("");
    setTick((t) => t + 1);
  }

  function handleDelete(commentId: string) {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.allComments);
      const all: Comment[] = raw ? JSON.parse(raw) : [];
      const updated = all.filter((c) => c.id !== commentId);
      localStorage.setItem(STORAGE_KEYS.allComments, JSON.stringify(updated));
      setComments(updated.filter((c) => c.skillId === skillId));
      // Sync user-scoped
      if (user) {
        const key = STORAGE_KEYS.comments(user.email);
        const uRaw = localStorage.getItem(key);
        const userComments: Comment[] = uRaw ? JSON.parse(uRaw) : [];
        localStorage.setItem(key, JSON.stringify(userComments.filter((c) => c.id !== commentId)));
      }
      // Sync skill-scoped
      try {
        const skKey = STORAGE_KEYS.skillComments(skillId);
        const skRaw = localStorage.getItem(skKey);
        const skComments: Comment[] = skRaw ? JSON.parse(skRaw) : [];
        localStorage.setItem(skKey, JSON.stringify(skComments.filter((c) => c.id !== commentId)));
      } catch { /* ignore */ }
    } catch { /* ignore */ }
    setTick((t) => t + 1);
  }

  return (
    <div className="glass-card p-6 mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />{t.comments.commentCount.replace("{count}", String(comments.length))}
      </h2>

      {/* Comment form */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-1" role="radiogroup" aria-label={t.comments.rating}>
          <span className="text-sm text-muted-foreground mr-2">{t.comments.rating}：</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-0.5"
            >
              <Star className={`h-4 w-4 ${(hoverRating || rating) >= star ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`} />
            </button>
          ))}
          {rating > 0 && <span className="text-xs text-muted-foreground ml-1">{rating}/5</span>}
        </div>
        <Textarea
          placeholder={user ? t.comments.placeholder : t.comments.loginToComment}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50"
          disabled={!user}
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={!user || !content.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {t.comments.submitComment}
          </Button>
        </div>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">{t.comments.noComments}</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="border-t border-border pt-4 first:border-0 first:pt-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {c.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{c.username}</p>
                  <div className="flex items-center gap-2">
                    {c.rating && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: c.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                    )}
                    <time className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString(locale)}</time>
                  </div>
                </div>
              </div>
              {editingId === c.id ? (
                <div className="ml-11 space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                    className="bg-secondary border-border text-foreground text-sm"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(c.id)} className="flex items-center gap-1 text-xs text-primary hover:underline"><Check className="h-3 w-3" />{t.common.save}</button>
                    <button onClick={() => setEditingId(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:underline"><X className="h-3 w-3" />{t.common.cancel}</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground mb-2 ml-11">{c.content}</p>
              )}
              <div className="ml-11 flex items-center gap-3">
                <button
                  onClick={() => handleLike(c.id)}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    user && c.likedBy?.includes(user.email) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ThumbsUp className="h-3 w-3" />
                  {c.likes > 0 && c.likes}
                </button>
                {user && c.userEmail === user.email && (
                  <>
                    <button
                      onClick={() => handleEdit(c.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(c.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
              {deleteConfirmId === c.id && (
                <div className="ml-11 mt-2 flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{t.comments.deleteConfirm}</span>
                  <button onClick={() => { handleDelete(c.id); setDeleteConfirmId(null); }} className="text-red-400 hover:underline">{t.common.confirm}</button>
                  <button onClick={() => setDeleteConfirmId(null)} className="text-muted-foreground hover:underline">{t.common.cancel}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
