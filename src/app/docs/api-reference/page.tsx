"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "swagger-ui-react/swagger-ui.css";
import "./swagger-reset.css";

// Dynamic import to avoid SSR issues with swagger-ui
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiReferencePage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch("/api/docs/openapi.json")
      .then((res) => res.json())
      .then(setSpec)
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          返回文档首页
        </Link>
        <h1 className="text-2xl font-bold mb-6">API 在线调试</h1>
        <div className="rounded-xl border border-border/50 overflow-hidden bg-white dark:bg-zinc-900">
          {spec ? (
            <div className="[&_.swagger-ui]:bg-transparent [&_.swagger-ui_.topbar]:hidden [&_.swagger-ui_.info]:text-foreground [&_.swagger-ui_.scheme-container]:bg-transparent [&_.swagger-ui_.scheme-container]:border-b [&_.swagger-ui_.opblock]:border-border/50 [&_.swagger-ui_.opblock-tag]:text-foreground [&_.swagger-ui_.opblock-summary-description]:text-muted-foreground">
              <SwaggerUI spec={spec} docExpansion="list" defaultModelsExpandDepth={0} />
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-muted-foreground">
              加载中...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
