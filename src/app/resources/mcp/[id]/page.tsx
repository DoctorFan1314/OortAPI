"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { Cloud, Rocket, Copy, Check, ArrowLeft, Wrench, ExternalLink, Server, Tag } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { useToast } from "@/contexts/toast-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getResourceById, type ResourceItem } from "@/lib/resource-registry";
import Link from "next/link";

export default function McpDetailPage() {
  const { lang, t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const [copied, setCopied] = useState(false);

  const item = getResourceById(params.id as string);

  if (!item || item.type !== "mcp") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">{lang === "zh" ? "未找到该 MCP 服务" : "MCP service not found"}</p>
        <Link href="/resources/mcp" className="text-primary text-sm hover:underline mt-2 inline-block">
          {lang === "zh" ? "返回 MCP 广场" : "Back to MCP Square"}
        </Link>
      </div>
    );
  }

  const handleActivate = () => {
    router.push(`/dashboard/playground?source=hub&type=mcp&id=${item.id}`);
  };

  const handleCopyTools = async () => {
    if (!item.requiredTools) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(item.requiredTools, null, 2));
      setCopied(true);
      toast(t.resourceHub.copiedSuccess, "success");
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const name = lang === "zh" ? item.nameZh : item.name;
  const desc = lang === "zh" ? item.descriptionZh : item.description;
  const categoryLabel = item.mcpCategory ? (t.resourceHub[`mcpCat${item.mcpCategory.charAt(0).toUpperCase() + item.mcpCategory.slice(1)}` as keyof typeof t.resourceHub] || item.mcpCategory) : "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link href="/resources/mcp" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {lang === "zh" ? "返回 MCP 广场" : "Back to MCP Square"}
      </Link>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-8 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Cloud className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{name}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge className={`border text-[10px] ${item.mcpDeployment === "local" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}>
                    {item.mcpDeployment === "local" ? t.resourceHub.mcpLocal : t.resourceHub.mcpHosted}
                  </Badge>
                  {categoryLabel && (
                    <span className="text-[11px] text-muted-foreground">{categoryLabel}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Description section */}
      <section className="glass-card p-6 rounded-xl border border-border/50 mb-6">
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" />
          {lang === "zh" ? "服务详情" : "Service Details"}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{lang === "zh" ? "部署类型" : "Deployment"}</p>
            <p className="text-sm font-medium">{item.mcpDeployment === "local" ? t.resourceHub.mcpLocal : t.resourceHub.mcpHosted}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{lang === "zh" ? "工具数量" : "Tools"}</p>
            <p className="text-sm font-medium">{item.requiredTools?.length ?? 0}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{lang === "zh" ? "计费方式" : "Pricing"}</p>
            <p className="text-sm font-medium">{t.resourceHub[item.pricing]}</p>
          </div>
        </div>
      </section>

      {/* Available Tools */}
      {item.requiredTools && item.requiredTools.length > 0 && (
        <section className="glass-card p-6 rounded-xl border border-border/50 mb-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            {lang === "zh" ? "可用工具" : "Available Tools"}
          </h2>
          <div className="space-y-4">
            {item.requiredTools.map(tool => (
              <div key={tool.function.name} className="p-4 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-sm font-mono font-semibold text-primary">{tool.function.name}</code>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{tool.function.description}</p>
                {(() => {
                  const params = tool.function.parameters as Record<string, unknown> | undefined;
                  const props = params?.properties as Record<string, Record<string, unknown>> | undefined;
                  const reqs = params?.required as string[] | undefined;
                  if (!props) return null;
                  return (
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{lang === "zh" ? "参数" : "Parameters"}</p>
                      <div className="grid gap-1">
                        {Object.entries(props).map(([key, prop]) => (
                          <div key={key} className="flex items-baseline gap-2 text-xs">
                            <code className="font-mono text-foreground shrink-0">{key}</code>
                            <span className="text-muted-foreground/60 shrink-0">({String(prop.type || "")}{reqs?.includes(key) ? ", required" : ""})</span>
                            <span className="text-muted-foreground truncate">{String(prop.description || "")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Action buttons — 2 rows */}
      <div className="flex flex-col gap-3 mb-8">
        <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20" onClick={handleActivate}>
          <Rocket className="h-4 w-4 mr-2" />
          {t.resourceHub.launchPlayground}
        </Button>
        <Button variant="secondary" className="w-full border border-border" onClick={handleCopyTools}>
          {copied ? <><Check className="h-4 w-4 mr-2 text-green-500" />{t.resourceHub.copiedSuccess}</> : <><Copy className="h-4 w-4 mr-2" />{t.resourceHub.mcpCopyConfig}</>}
        </Button>
      </div>
    </div>
  );
}
