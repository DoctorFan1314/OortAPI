"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { CopyButton } from "@/components/shared/copy-button";

export function BaseUrlDisplay() {
  const { t } = useI18n();
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const openaiUrl = origin ? `${origin}/api/v1` : "https://your-domain.com/api/v1";
  const anthropicUrl = origin ? `${origin}/api` : "https://your-domain.com/api";

  return (
    <div className="grid sm:grid-cols-2 gap-4 mb-4">
      <div className="rounded-lg border border-border/50 p-4">
        <div className="text-xs font-medium text-emerald-400 mb-2">{t.apiDocs.openaiProtocol}</div>
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono text-foreground break-all flex-1 select-all">{openaiUrl}</code>
          <CopyButton text={openaiUrl} className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors" />
        </div>
      </div>
      <div className="rounded-lg border border-border/50 p-4">
        <div className="text-xs font-medium text-amber-400 mb-2">{t.apiDocs.anthropicProtocol}</div>
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono text-foreground break-all flex-1 select-all">{anthropicUrl}</code>
          <CopyButton text={anthropicUrl} className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors" />
        </div>
      </div>
    </div>
  );
}
