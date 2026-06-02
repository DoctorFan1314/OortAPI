"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import "swagger-ui-react/swagger-ui.css";
import "./swagger-reset.css";

// Dynamic import to avoid SSR issues with swagger-ui
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

// Suppress React strict mode warnings from swagger-ui-react internals
function SwaggerUIWrapper(props: Record<string, unknown>) {
  const origError = useRef<typeof console.error>(undefined);
  useEffect(() => {
    origError.current = console.error;
    console.error = (...args: unknown[]) => {
      if (typeof args[0] === "string" && args[0].includes("UNSAFE_componentWillReceiveProps")) return;
      origError.current?.(...args);
    };
    return () => { console.error = origError.current!; };
  }, []);
  return <SwaggerUI {...props} />;
}

export function ApiReferenceContent() {
  const { t } = useI18n();
  const L = t.apiDocs;
  const [spec, setSpec] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSpec = () => {
    setLoading(true);
    setError(false);
    fetch("/api/docs/openapi.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => { setSpec(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { loadSpec(); }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {L.backToDocs}
        </Link>
        <h1 className="text-2xl font-bold mb-6">{L.onlineDebug}</h1>
        <div className="rounded-xl border border-border/50 overflow-hidden bg-white dark:bg-zinc-900">
          {error ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <p className="text-sm">{t.common.errorTitle}</p>
              <button onClick={loadSpec} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border hover:bg-muted transition-colors">
                <RefreshCw className="h-3.5 w-3.5" /> {t.common.retry}
              </button>
            </div>
          ) : loading ? (
            <div className="h-96 flex items-center justify-center text-muted-foreground">
              {t.common.loading}
            </div>
          ) : spec ? (
            <div className="[&_.swagger-ui]:bg-transparent [&_.swagger-ui_.topbar]:hidden [&_.swagger-ui_.info]:text-foreground [&_.swagger-ui_.scheme-container]:bg-transparent [&_.swagger-ui_.scheme-container]:border-b [&_.swagger-ui_.opblock]:border-border/50 [&_.swagger-ui_.opblock-tag]:text-foreground [&_.swagger-ui_.opblock-summary-description]:text-muted-foreground">
              <SwaggerUIWrapper spec={spec} docExpansion="list" defaultModelsExpandDepth={0} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
