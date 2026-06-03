"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { cn } from "@/lib/utils";

type Vote = "yes" | "no";

function storageKey(pathname: string) {
  const cleaned = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return `docs_feedback_${cleaned}`;
}

export function FeedbackPrompt() {
  const pathname = usePathname();
  const { lang } = useI18n();
  const [vote, setVote] = useState<Vote | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Restore previous feedback from localStorage, reset on navigation
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey(pathname));
      if (stored) {
        const data = JSON.parse(stored) as { vote: Vote; comment?: string };
        setVote(data.vote);
        setComment(data.comment ?? "");
        setSubmitted(true);
      } else {
        setVote(null);
        setComment("");
        setSubmitted(false);
      }
    } catch {
      // ignore parse errors
    }
  }, [pathname]);

  const handleVote = useCallback(
    (v: Vote) => {
      setVote(v);
      if (v === "yes") {
        try {
          localStorage.setItem(storageKey(pathname), JSON.stringify({ vote: v }));
        } catch {
          // storage full or unavailable
        }
        setSubmitted(true);
      }
      // "no" stays in the comment state until user submits or dismisses
    },
    [pathname],
  );

  const handleSubmitComment = useCallback(() => {
    try {
      localStorage.setItem(
        storageKey(pathname),
        JSON.stringify({ vote: "no", comment: comment.trim() }),
      );
    } catch {
      // storage full or unavailable
    }
    setSubmitted(true);
  }, [pathname, comment]);

  // Already submitted — show thanks
  if (submitted) {
    return (
      <div className="border-t border-border pt-6 mt-8 flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Check className="h-4 w-4 text-green-500" />
          {lang === "zh" ? "感谢你的反馈！" : "Thanks for your feedback!"}
        </span>
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-6 mt-8 flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">
        {lang === "zh" ? "这个页面有帮助吗？" : "Was this page helpful?"}
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleVote("yes")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            vote === "yes" && "bg-accent text-accent-foreground",
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          {lang === "zh" ? "是" : "Yes"}
        </button>

        <button
          type="button"
          onClick={() => handleVote("no")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            vote === "no" && "bg-accent text-accent-foreground",
          )}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          {lang === "zh" ? "否" : "No"}
        </button>
      </div>

      {vote === "no" && !submitted && (
        <div className="flex w-full max-w-sm flex-col gap-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              lang === "zh"
                ? "告诉我们哪里可以改进（可选）…"
                : "Tell us how we can improve (optional)…"
            }
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
          <button
            type="button"
            onClick={handleSubmitComment}
            className="self-end rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {lang === "zh" ? "提交" : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
}
