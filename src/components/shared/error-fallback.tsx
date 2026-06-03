"use client";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/contexts/i18n-context";

interface ErrorFallbackProps {
  error?: Error & { digest?: string };
  reset?: () => void;
}

function getErrorMessage(err: Error | undefined, t: ReturnType<typeof useI18n>["t"]): string {
  const msg = err?.message || "";
  if (msg.includes("401") || msg.includes("Unauthorized")) return t.error.sessionExpired;
  if (msg.includes("429") || msg.includes("Too Many Requests")) return t.error.rateLimited;
  if (msg.includes("500") || msg.includes("Internal Server")) return t.error.serverError;
  if (msg.includes("502") || msg.includes("503")) return t.error.serviceUnavailable;
  if (msg.includes("fetch") || msg.includes("NetworkError") || msg.includes("Failed to fetch")) return t.error.networkError;
  return msg || t.error.somethingWentWrong;
}

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  const { t } = useI18n();
  const displayMsg = getErrorMessage(error, t);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t.error.somethingWentWrong}</h2>
        <p className="text-muted-foreground mb-6 text-sm">{displayMsg}</p>
        <div className="flex gap-3 justify-center">
          {reset && (
            <button onClick={reset} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              {t.error.tryAgain}
            </button>
          )}
          <Link href="/" className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
            {t.error.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
