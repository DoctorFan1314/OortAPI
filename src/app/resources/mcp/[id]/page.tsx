"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { Cloud, Rocket, Copy, Check, ArrowLeft, Wrench, Server, Tag, Clock, Boxes, Share2 } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"intro" | "tools" | "config">("intro");

  const item = getResourceById(params.id as string);

  if (!item || item.type !== "mcp") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg">{lang === "zh" ? "未找到该 MCP 服务" : "MCP service not found"}</p>
        <Link href="/resources/mcp" className="text-primary mt-4 inline-block hover:underline">{lang === "zh" ? "返回 MCP 广场" : "Back to MCP Square"}</Link>
      </div>
    );
  }

  const name = lang === "zh" ? item.nameZh : item.name;
  const desc = lang === "zh" ? item.descriptionZh : item.description;
  const categoryLabel = item.mcpCategory
    ? (t.resourceHub[`mcpCat${item.mcpCategory.charAt(0).toUpperCase() + item.mcpCategory.slice(1)}` as keyof typeof t.resourceHub] || item.mcpCategory)
    : "";

  const handleActivate = () => router.push(`/dashboard/playground?source=hub&type=mcp&id=${item.id}`);

  const handleCopyTools = async () => {
    if (!item.requiredTools) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(item.requiredTools, null, 2));
      setCopied(true);
      toast(t.resourceHub.copiedSuccess, "success");
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({ title: name, url }).catch(() => {
        navigator.clipboard.writeText(url).then(() => toast(t.common.copied, "success"));
      });
    } else {
      navigator.clipboard.writeText(url).then(() => toast(t.common.copied, "success"));
    }
  };

  const tabs = [
    { key: "intro" as const, label: lang === "zh" ? "服务详情" : "Service Details", icon: Server },
    { key: "tools" as const, label: lang === "zh" ? "可用工具" : "Available Tools", icon: Wrench },
    { key: "config" as const, label: lang === "zh" ? "服务配置" : "Configuration", icon: Boxes },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link href="/resources/mcp" className="hover:text-foreground transition-colors">{t.resourceHub.mcpPageTitle}</Link>
        <span>/</span>
        <span className="text-foreground">{name}</span>
      </nav>

      {/* Header section — follows Agent Skill detail layout */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 flex items-center gap-2">
          {name}
        </h1>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-4">
          <Badge className={`border text-xs ${item.mcpDeployment === "local" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}>
            {item.mcpDeployment === "local" ? t.resourceHub.mcpLocal : t.resourceHub.mcpHosted}
          </Badge>
          <span className="flex items-center gap-1.5"><Wrench className="h-4 w-4" />{item.requiredTools?.length ?? 0} {lang === "zh" ? "个工具" : "tools"}</span>
          {categoryLabel && <span className="flex items-center gap-1.5"><Tag className="h-4 w-4" />{categoryLabel}</span>}
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{item.pricing === "pricingPlatformDeduct" ? t.resourceHub.pricingPlatformDeduct : t.resourceHub.pricingFree}</span>
        </div>

        {/* Share button */}
        <div className="mb-4">
          <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            {lang === "zh" ? "分享" : "Share"}
          </Button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {item.tags.map(tag => (
            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">{tag}</span>
          ))}
        </div>
      </div>

      {/* Tabs — same pattern as Agent Skill detail */}
      <div role="tablist" className="flex items-center gap-0 border-b border-border mb-6">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-5 py-3 text-sm border-b-2 transition-colors ${
              activeTab === key
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mb-8">
        {/* ── Tab: Service Details ── */}
        {activeTab === "intro" && (
          <div className="space-y-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">{lang === "zh" ? "部署类型" : "Deployment"}</p>
                <p className="text-sm font-medium">{item.mcpDeployment === "local" ? t.resourceHub.mcpLocal : t.resourceHub.mcpHosted}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">{lang === "zh" ? "工具数量" : "Tools"}</p>
                <p className="text-sm font-medium">{item.requiredTools?.length ?? 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">{lang === "zh" ? "计费方式" : "Pricing"}</p>
                <p className="text-sm font-medium">{t.resourceHub[item.pricing]}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Available Tools ── */}
        {activeTab === "tools" && (
          <div className="space-y-4">
            {item.requiredTools && item.requiredTools.length > 0 ? item.requiredTools.map(tool => {
              const params = tool.function.parameters as Record<string, unknown> | undefined;
              const props = params?.properties as Record<string, Record<string, unknown>> | undefined;
              const reqs = params?.required as string[] | undefined;
              return (
                <div key={tool.function.name} className="p-5 rounded-xl bg-muted/20 border border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-sm font-mono font-semibold text-primary">{tool.function.name}</code>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{tool.function.description}</p>
                  {props && (
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{lang === "zh" ? "参数" : "Parameters"}</p>
                      <div className="rounded-lg border border-border/30 overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-muted/30 text-muted-foreground">
                              <th className="text-left px-3 py-2 font-medium">{lang === "zh" ? "参数名" : "Name"}</th>
                              <th className="text-left px-3 py-2 font-medium">{lang === "zh" ? "类型" : "Type"}</th>
                              <th className="text-left px-3 py-2 font-medium">{lang === "zh" ? "必需" : "Required"}</th>
                              <th className="text-left px-3 py-2 font-medium">{lang === "zh" ? "说明" : "Description"}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(props).map(([key, prop]) => (
                              <tr key={key} className="border-t border-border/20">
                                <td className="px-3 py-2 font-mono text-foreground">{key}</td>
                                <td className="px-3 py-2 text-muted-foreground">{String(prop.type || "")}</td>
                                <td className="px-3 py-2">{reqs?.includes(key) ? <span className="text-red-400">{lang === "zh" ? "是" : "Yes"}</span> : <span className="text-muted-foreground">{lang === "zh" ? "否" : "No"}</span>}</td>
                                <td className="px-3 py-2 text-muted-foreground">{String(prop.description || "")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            }) : (
              <p className="text-sm text-muted-foreground py-8 text-center">{lang === "zh" ? "暂无工具信息" : "No tool information available"}</p>
            )}
          </div>
        )}

        {/* ── Tab: Configuration ── */}
        {activeTab === "config" && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-muted/20 border border-border/30">
              <h3 className="text-sm font-semibold mb-3">{lang === "zh" ? "服务配置" : "Service Configuration"}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {lang === "zh"
                  ? "Hosted MCP 服务的 Remote URL 是为您分配的专属连接地址，为敏感信息，请勿对外泄漏！"
                  : "The Remote URL for Hosted MCP services is your dedicated connection address. Keep it confidential!"}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-background border border-border/30">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{lang === "zh" ? "传输类型" : "Transport"}</p>
                  <p className="text-sm font-medium">{item.mcpDeployment === "local" ? "Stdio" : "Remote"}</p>
                </div>
                <div className="p-3 rounded-lg bg-background border border-border/30">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{lang === "zh" ? "鉴权类型" : "Auth"}</p>
                  <p className="text-sm font-medium">{lang === "zh" ? "无鉴权" : "No Auth"}</p>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-xl bg-muted/20 border border-border/30">
              <h3 className="text-sm font-semibold mb-3">{lang === "zh" ? "工具定义 (JSON)" : "Tool Definition (JSON)"}</h3>
              <div className="relative group">
                <pre className="bg-zinc-950 rounded-lg p-4 overflow-x-auto text-xs leading-relaxed border border-zinc-800">
                  <code className="text-zinc-300 font-mono whitespace-pre">{JSON.stringify(item.requiredTools, null, 2)}</code>
                </pre>
                <button
                  onClick={handleCopyTools}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom action buttons — 2 rows */}
      <div className="flex flex-col gap-3 border-t border-border pt-6">
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
