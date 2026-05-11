"use client";

import { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useI18n } from "@/contexts/i18n-context";
import { useLocale } from "@/hooks/use-locale";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { canPerformAction } from "@/lib/utils";
import type { Comment } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Star, ThumbsUp, MessageSquare, Pencil, Trash2, X, Check, Bold, Italic, Code, List, Reply } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";

const MarkdownRenderer = lazy(() =>
  import("@/components/shared/markdown-renderer").then((m) => ({ default: m.MarkdownRenderer }))
);

function CommentActions({
  liked,
  likeCount,
  onLike,
  onReply,
  onEdit,
  onDelete,
  isReply,
  t,
  size = "normal",
}: {
  liked: boolean;
  likeCount: number;
  onLike: () => void;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isReply?: boolean;
  t: Dictionary;
  size?: "normal" | "small";
}) {
  const iconSize = size === "small" ? "h-2.5 w-2.5" : "h-3 w-3";
  const textSize = size === "small" ? "text-[10px]" : "text-xs";

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onLike}
        aria-label={liked ? t.comments.likes : t.common.like}
        aria-pressed={liked}
        className={`flex items-center gap-1 ${textSize} transition-colors ${
          liked ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ThumbsUp className={iconSize} />
        {likeCount > 0 && likeCount}
      </button>
      {!isReply && onReply && (
        <button
          onClick={onReply}
          aria-label={t.comments.reply}
          className={`flex items-center gap-1 ${textSize} text-muted-foreground hover:text-foreground transition-colors`}
        >
          <Reply className={iconSize} />
          {t.comments.reply}
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          aria-label={t.common.edit}
          className={`flex items-center gap-1 ${textSize} text-muted-foreground hover:text-foreground transition-colors`}
        >
          <Pencil className={iconSize} />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          aria-label={t.common.delete}
          className={`flex items-center gap-1 ${textSize} text-muted-foreground hover:text-red-400 transition-colors`}
        >
          <Trash2 className={iconSize} />
        </button>
      )}
    </div>
  );
}

function EditForm({
  editContent,
  onChange,
  onSave,
  onCancel,
  t,
}: {
  editContent: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  t: Dictionary;
}) {
  return (
    <div className="space-y-2">
      <Textarea
        value={editContent}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="bg-secondary border-border text-foreground text-sm"
      />
      <div className="flex gap-2">
        <button onClick={onSave} className="flex items-center gap-1 text-xs text-primary hover:underline">
          <Check className="h-3 w-3" />{t.common.save}
        </button>
        <button onClick={onCancel} className="flex items-center gap-1 text-xs text-muted-foreground hover:underline">
          <X className="h-3 w-3" />{t.common.cancel}
        </button>
      </div>
    </div>
  );
}

export function CommentSection({ skillId, skillTitle }: { skillId: string; skillTitle: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const locale = useLocale();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [visibleCommentCount, setVisibleCommentCount] = useState(10);

  // Pre-compute reply map to avoid triple filter on every render
  const replyMap = useMemo(() => {
    const map = new Map<string, Comment[]>();
    comments.filter(c => c.parentId).forEach(r => {
      const list = map.get(r.parentId!) || [];
      list.push(r);
      map.set(r.parentId!, list);
    });
    return map;
  }, [comments]);

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
    if (!canPerformAction("comment", 3000)) { toast(t.rateLimit.tooFast, "error"); return; }

    const comment: Comment = {
      id: crypto.randomUUID(),
      skillId,
      userEmail: user.email,
      username: user.username,
      avatar: user.avatar,
      content: content.trim(),
      rating: rating || undefined,
      createdAt: new Date().toISOString(),
      parentId: replyingTo || undefined,
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
        commentId: comment.id,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(actKey, JSON.stringify(activities.slice(0, 100)));
    } catch { /* ignore */ }

    setComments((prev) => [comment, ...prev]);
    setContent("");
    setRating(0);
    setReplyingTo(null);
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
      const editedAt = new Date().toISOString();
      const raw = localStorage.getItem(STORAGE_KEYS.allComments);
      const all: Comment[] = raw ? JSON.parse(raw) : [];
      const idx = all.findIndex((c) => c.id === commentId);
      if (idx !== -1) {
        all[idx].content = editContent.trim();
        all[idx].editedAt = editedAt;
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
          userComments[uIdx].editedAt = editedAt;
          localStorage.setItem(key, JSON.stringify(userComments));
        }
      }
    } catch { /* ignore */ }
    setEditingId(null);
    setEditContent("");
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
      // 清理 activity
      try {
        if (user) {
          const actKey = STORAGE_KEYS.activity(user.email);
          const actRaw = localStorage.getItem(actKey);
          const activities = actRaw ? JSON.parse(actRaw) : [];
          const updatedActivities = activities.filter((a: { type: string; commentId?: string }) =>
            !(a.type === "comment" && a.commentId === commentId)
          );
          localStorage.setItem(actKey, JSON.stringify(updatedActivities));
        }
      } catch { /* ignore */ }
    } catch { /* ignore */ }
  }

  return (
    <div className="glass-card p-6 mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />{t.comments.commentCount.replace("{count}", String(comments.length))}
      </h2>

      {/* Comment form */}
      <div className="mb-6 space-y-3">
        {replyingTo && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
            <Reply className="h-3 w-3" />
            <span>{t.comments.replyingTo} @{comments.find(c => c.id === replyingTo)?.username || "user"}</span>
            <button onClick={() => { setReplyingTo(null); setContent(""); }} className="ml-auto flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />{t.comments.cancelReply}
            </button>
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground mr-2">{t.comments.rating}{locale.startsWith("zh") ? "：" : ":"}</span>
          <StarRating value={rating} onChange={setRating} />
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
        <p className="text-[10px] text-muted-foreground/50 mt-1">{t.comments.markdownHint || "Markdown supported: **bold**, *italic*, `code`, - lists"}</p>
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
          {comments.filter((c) => !c.parentId).slice(0, visibleCommentCount).map((c) => (
            <div key={c.id}>
              <div className="border-t border-border pt-4 first:border-0 first:pt-0">
                <div className="flex items-center gap-3 mb-2">
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.username} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {c.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <Link href={`/users/${encodeURIComponent(c.username)}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{c.username}</Link>
                    <div className="flex items-center gap-2">
                      {c.rating && (
                        <StarRating value={c.rating} readonly size={12} />
                      )}
                      <time className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString(locale)}</time>
                      {c.editedAt && (
                        <span className="text-xs text-muted-foreground/60">({t.common.edited})</span>
                      )}
                    </div>
                  </div>
                </div>
                {editingId === c.id ? (
                  <div className="ml-11">
                    <EditForm
                      editContent={editContent}
                      onChange={setEditContent}
                      onSave={() => handleSaveEdit(c.id)}
                      onCancel={() => setEditingId(null)}
                      t={t}
                    />
                  </div>
                ) : (
                  <div className="text-sm text-foreground mb-2 ml-11 prose prose-sm dark:prose-invert max-w-none">
                    <Suspense fallback={<div className="animate-pulse bg-secondary rounded h-4 w-3/4" />}>
                      <MarkdownRenderer content={c.content} />
                    </Suspense>
                  </div>
                )}
                <div className="ml-11 mt-1">
                  <CommentActions
                    liked={!!(user && c.likedBy?.includes(user.email))}
                    likeCount={c.likes}
                    onLike={() => handleLike(c.id)}
                    onReply={user ? () => { setReplyingTo(c.id); setContent(`@${c.username} `); } : undefined}
                    onEdit={user && c.userEmail === user.email ? () => handleEdit(c.id) : undefined}
                    onDelete={user && c.userEmail === user.email ? () => setDeleteConfirmId(c.id) : undefined}
                    isReply={false}
                    t={t}
                    size="normal"
                  />
                </div>
                {deleteConfirmId === c.id && (
                  <div className="ml-11 mt-2 flex items-center gap-2 text-xs" role="alert" aria-live="polite">
                    <span className="text-muted-foreground">{t.comments.deleteConfirm}</span>
                    <button onClick={() => { handleDelete(c.id); setDeleteConfirmId(null); }} className="text-red-400 hover:underline">{t.common.confirm}</button>
                    <button onClick={() => setDeleteConfirmId(null)} className="text-muted-foreground hover:underline">{t.common.cancel}</button>
                  </div>
                )}
              </div>

              {/* Replies */}
              {(replyMap.get(c.id) || []).length > 0 && (
                <div className="ml-8 pl-4 border-l-2 border-border/50 space-y-3 mt-2">
                  {(replyMap.get(c.id) || []).map((r) => (
                    <div key={r.id} className="pt-2">
                      <div className="flex items-center gap-3 mb-1">
                        {r.avatar ? (
                          <img src={r.avatar} alt={r.username} className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {r.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <Link href={`/users/${encodeURIComponent(r.username)}`} className="text-xs font-medium text-foreground hover:text-primary transition-colors">{r.username}</Link>
                          <time className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleDateString(locale)}</time>
                        </div>
                      </div>
                      {editingId === r.id ? (
                        <div className="ml-9">
                          <EditForm
                            editContent={editContent}
                            onChange={setEditContent}
                            onSave={() => handleSaveEdit(r.id)}
                            onCancel={() => setEditingId(null)}
                            t={t}
                          />
                        </div>
                      ) : (
                        <div className="text-xs text-foreground ml-9 prose prose-sm dark:prose-invert max-w-none">
                          <Suspense fallback={<div className="animate-pulse bg-secondary rounded h-4 w-3/4" />}>
                            <MarkdownRenderer content={r.content} />
                          </Suspense>
                        </div>
                      )}
                      <div className="ml-9 mt-1">
                        <CommentActions
                          liked={!!(user && r.likedBy?.includes(user.email))}
                          likeCount={r.likes}
                          onLike={() => handleLike(r.id)}
                          onEdit={user && r.userEmail === user.email ? () => handleEdit(r.id) : undefined}
                          onDelete={user && r.userEmail === user.email ? () => setDeleteConfirmId(r.id) : undefined}
                          isReply={true}
                          t={t}
                          size="small"
                        />
                      </div>
                      {deleteConfirmId === r.id && (
                        <div className="ml-9 mt-1 flex items-center gap-2 text-[10px]">
                          <span className="text-muted-foreground">{t.comments.deleteConfirm}</span>
                          <button onClick={() => { handleDelete(r.id); setDeleteConfirmId(null); }} className="text-red-400 hover:underline">{t.common.confirm}</button>
                          <button onClick={() => setDeleteConfirmId(null)} className="text-muted-foreground hover:underline">{t.common.cancel}</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
