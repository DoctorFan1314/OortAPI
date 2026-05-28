"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { Cloud, Rocket, Copy, Check, ArrowLeft, Wrench, Server, Tag, Clock, Boxes, Share2, ExternalLink, GitBranch, Shield, User, Calendar, BarChart3, Users, ChevronRight } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"details" | "tools" | "feedback">("details");
  const [configTab, setConfigTab] = useState<"remote" | "stdio">("remote");

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
  const toolDesc = item.mcpToolDescription || desc;
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
    navigator.clipboard.writeText(url).then(() => toast(t.common.copied, "success"));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link href="/resources/mcp" className="hover:text-foreground transition-colors">{t.resourceHub.mcpPageTitle}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Left: Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              {name}
              <Badge className={`border text-xs ${item.mcpDeployment === "local" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}>
                {item.mcpDeployment === "local" ? t.resourceHub.mcpLocal : t.resourceHub.mcpHosted}
              </Badge>
            </h1>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3">
              {item.mcpLastUpdated && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{item.mcpLastUpdated}</span>}
              {item.mcpUsageCount && <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" />{item.mcpUsageCount}</span>}
              {item.mcpUserCount && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{item.mcpUserCount}</span>}
              <span className="flex items-center gap-1"><Wrench className="h-3.5 w-3.5" />{item.requiredTools?.length ?? 0}</span>
            </div>

            {/* GitHub + collection */}
            {item.mcpGithub && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-muted-foreground">{lang === "zh" ? "合集" : "Collection"}</span>
                <a href={`https://github.com/${item.mcpGithub}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <GitBranch className="h-3 w-3" />
                  GitHub @{item.mcpGithub.split("/")[0]} / {item.mcpGithub.split("/")[1]}
                </a>
              </div>
            )}

            {/* Short description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{toolDesc}</p>

            {/* Category badge */}
            {categoryLabel && (
              <Badge variant="secondary" className="bg-secondary text-muted-foreground border-border text-xs">
                {categoryLabel}
              </Badge>
            )}

            {/* License + Developer */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
              {item.mcpLicense && <span className="flex items-center gap-1">{lang === "zh" ? "开源协议：" : "License: "}{item.mcpLicense}</span>}
              {item.mcpDeveloper && <span className="flex items-center gap-1">{lang === "zh" ? "开发者：" : "Developer: "}{item.mcpDeveloper}</span>}
            </div>
          </div>

          {/* Tabs */}
          <div role="tablist" className="flex items-center gap-0 border-b border-border mb-6">
            {([
              { key: "details" as const, label: lang === "zh" ? "服务详情" : "Service Details" },
              { key: "tools" as const, label: lang === "zh" ? "可用工具" : "Available Tools" },
              { key: "feedback" as const, label: lang === "zh" ? "交流反馈" : "Feedback" },
            ]).map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeTab === key}
                onClick={() => setActiveTab(key)}
                className={`px-5 py-3 text-sm border-b-2 transition-colors ${
                  activeTab === key ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content: Service Details */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground leading-relaxed">{desc}</div>

              {/* Tool preview */}
              {item.requiredTools && item.requiredTools.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">{lang === "zh" ? "可用工具" : "Available Tools"}</h3>
                  <div className="space-y-2">
                    {item.requiredTools.map(tool => (
                      <div key={tool.function.name} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                        <code className="text-xs font-mono font-semibold text-primary">{tool.function.name}</code>
                        <span className="text-xs text-muted-foreground ml-2">- {tool.function.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <p className="text-xs font-semibold text-amber-500/80 mb-1">{lang === "zh" ? "提示" : "Tips"}</p>
                <p className="text-xs text-muted-foreground">
                  {lang === "zh"
                    ? "该 MCP 服务为云端托管，无需本地安装。点击「获取 MCP 服务器」即可在测试场中直接使用。"
                    : "This MCP service is cloud-hosted — no local installation needed. Click 'Get MCP Server' to use it directly in the Playground."}
                </p>
              </div>
            </div>
          )}

          {/* Tab content: Available Tools */}
          {activeTab === "tools" && (
            <div className="space-y-4">
              {item.requiredTools && item.requiredTools.length > 0 ? item.requiredTools.map(tool => {
                const toolParams = tool.function.parameters as Record<string, unknown> | undefined;
                const props = toolParams?.properties as Record<string, Record<string, unknown>> | undefined;
                const reqs = toolParams?.required as string[] | undefined;
                return (
                  <div key={tool.function.name} className="space-y-3">
                    <div>
                      <code className="text-sm font-mono font-semibold text-primary">{tool.function.name}</code>
                      <span className="text-sm text-muted-foreground ml-2">- {tool.function.description}</span>
                    </div>
                    {props && (
                      <div className="pl-4 space-y-1.5">
                        <p className="text-xs text-muted-foreground font-medium">{lang === "zh" ? "参数:" : "Parameters:"}</p>
                        {Object.entries(props).map(([key, prop]) => (
                          <p key={key} className="text-xs text-muted-foreground pl-2">
                            <code className="font-mono text-foreground">{key}</code>
                            {" "}({String(prop.type || "")}{reqs?.includes(key) ? lang === "zh" ? ", 必需" : ", required" : lang === "zh" ? ", 可选" : ", optional"}): {String(prop.description || "")}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }) : (
                <p className="text-sm text-muted-foreground py-8 text-center">{lang === "zh" ? "暂无工具信息" : "No tool information available"}</p>
              )}
            </div>
          )}

          {/* Tab content: Feedback */}
          {activeTab === "feedback" && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">{lang === "zh" ? "暂无反馈" : "No feedback yet"}</p>
            </div>
          )}
        </div>

        {/* ── Right: Action sidebar ── */}
        <aside className="lg:w-72 shrink-0 space-y-4">
          {/* Get MCP Server */}
          <div className="glass-card p-5 rounded-xl border border-border/50 space-y-4">
            <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20" onClick={handleActivate}>
              <Rocket className="h-4 w-4 mr-2" />
              {lang === "zh" ? "获取 MCP 服务器" : "Get MCP Server"}
            </Button>
            <Button variant="secondary" className="w-full border border-border" onClick={handleCopyTools}>
              {copied ? <><Check className="h-4 w-4 mr-2 text-green-500" />{t.resourceHub.copiedSuccess}</> : <><Copy className="h-4 w-4 mr-2" />{t.resourceHub.mcpCopyConfig}</>}
            </Button>
          </div>

          {/* Service Config */}
          <div className="glass-card p-5 rounded-xl border border-border/50 space-y-4">
            <h3 className="text-sm font-semibold">{lang === "zh" ? "服务配置" : "Service Configuration"}</h3>

            {/* Remote / Stdio tabs */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button onClick={() => setConfigTab("remote")} className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${configTab === "remote" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}>Remote</button>
              <button onClick={() => setConfigTab("stdio")} className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors border-l border-border ${configTab === "stdio" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}>Stdio</button>
            </div>

            <p className="text-[10px] text-muted-foreground">
              {lang === "zh"
                ? "Hosted MCP 服务的 Remote URL 是为您分配的专属连接地址，为敏感信息，请勿对外泄漏！"
                : "The Remote URL for Hosted MCP services is your dedicated connection address. Keep it confidential!"}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{lang === "zh" ? "传输类型" : "Transport"}</span>
                <span className="font-medium">{configTab === "remote" ? "Remote" : "Stdio"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{lang === "zh" ? "鉴权类型" : "Auth"}</span>
                <span className="font-medium">{lang === "zh" ? "无鉴权" : "No Auth"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{lang === "zh" ? "有效期" : "Validity"}</span>
                <span className="font-medium">{lang === "zh" ? "24小时有效" : "24h valid"}</span>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full border-border text-xs">
              {lang === "zh" ? "使用个人专属云资源部署MCP服务" : "Deploy with personal cloud resources"}
            </Button>
          </div>

          {/* Quick info */}
          <div className="glass-card p-5 rounded-xl border border-border/50 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{lang === "zh" ? "部署类型" : "Deployment"}</span>
              <span className="font-medium">{item.mcpDeployment === "local" ? t.resourceHub.mcpLocal : t.resourceHub.mcpHosted}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{lang === "zh" ? "工具数量" : "Tools"}</span>
              <span className="font-medium">{item.requiredTools?.length ?? 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{lang === "zh" ? "计费方式" : "Pricing"}</span>
              <span className="font-medium">{t.resourceHub[item.pricing]}</span>
            </div>
            {item.mcpLicense && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{lang === "zh" ? "开源协议" : "License"}</span>
                <span className="font-medium">{item.mcpLicense}</span>
              </div>
            )}
            {item.mcpDeveloper && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{lang === "zh" ? "开发者" : "Developer"}</span>
                <span className="font-medium">{item.mcpDeveloper}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">{tag}</span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
