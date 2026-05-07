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
import { Star, ThumbsUp, MessageSquare } from "lucide-react";

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
      id: Date.now().toString(36),
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
        id: Date.now().toString(36),
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

  return (
    <div className="glass-card p-6 mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />{t.comments.commentCount.replace("{count}", String(comments.length))}
      </h2>

      {/* Comment form */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground mr-2">{t.comments.rating}：</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
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
              <p className="text-sm text-foreground mb-2 ml-11">{c.content}</p>
              <div className="ml-11">
                <button
                  onClick={() => handleLike(c.id)}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    user && c.likedBy?.includes(user.email) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ThumbsUp className="h-3 w-3" />
                  {c.likes > 0 && c.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
