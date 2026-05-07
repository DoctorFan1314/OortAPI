"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/i18n-context";

export default function SkillsError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">{t.error.title}</h1>
        <p className="text-muted-foreground text-sm mb-8">{t.error.description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => unstable_retry()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t.error.retry}
          </Button>
          <Link href="/skills">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t.agentSkills.title}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
