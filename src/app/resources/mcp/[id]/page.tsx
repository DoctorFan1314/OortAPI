"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { Rocket, Copy, Check, Wrench, Share2, GitBranch, Calendar, BarChart3, Users, ChevronRight, Shield, User, Play, Loader2 } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { useToast } from "@/contexts/toast-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getResourceById, type ResourceItem } from "@/lib/resource-registry";
import { CommentSection } from "@/components/skill/comment-section";
import Link from "next/link";

export default function McpDetailPage() {
  const { lang, t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "tools" | "test" | "feedback">("details");
  // Tool testing state
  const [testTool, setTestTool] = useState<string>("");
  const [testArgs, setTestArgs] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testDemo, setTestDemo] = useState<boolean | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [tavilyKey, setTavilyKey] = useState(() => {
    if (typeof window === "undefined") return "";
    try { return localStorage.getItem("oortapi-tavily-key") || ""; } catch { return ""; }
  });

  const item = getResourceById(params.id as string);

  if (!item || item.type !== "mcp") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg">{t.resourceHub.mcpNotFound}</p>
        <Link href="/resources/mcp" className="text-primary mt-4 inline-block hover:underline">{t.resourceHub.mcpBackToSquare}</Link>
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
    } catch { toast(t.resourceHub.mcpCopyFailed, "error"); }
  };

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url).then(() => toast(t.common.copied, "success"));
  };

  // Tool testing
  const selectedToolDef = item.requiredTools?.find(tool => tool.function.name === testTool);
  const isSearchTool = testTool === "google_search" || testTool === "google_news" || testTool === "bing_search";

  const handleRunTest = async () => {
    if (!testTool) return;
    setTestLoading(true);
    setTestResult(null);
    setTestDemo(null);
    try {
      const parsedArgs: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(testArgs)) {
        if (v === "true") parsedArgs[k] = true;
        else if (v === "false") parsedArgs[k] = false;
        else if (!isNaN(Number(v)) && v.trim() !== "") parsedArgs[k] = Number(v);
        else parsedArgs[k] = v;
      }
      const res = await fetch("/api/playground/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: testTool, args: parsedArgs, config: { tavilyApiKey: tavilyKey || undefined } }),
      });
      const data = await res.json();
      setTestResult(data.result || data.error || JSON.stringify(data));
      setTestDemo(data.demo ?? null);
    } catch (e) {
      setTestResult(`Error: ${e instanceof Error ? e.message : "Unknown error"}`);
      setTestDemo(null);
    } finally {
      setTestLoading(false);
    }
  };

  const tabs = [
    { key: "details" as const, label: t.resourceHub.mcpTabDetails },
    { key: "tools" as const, label: t.resourceHub.mcpTabTools },
    { key: "test" as const, label: t.resourceHub.mcpTabTest },
    { key: "feedback" as const, label: t.resourceHub.mcpTabFeedback },
  ];

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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 flex items-center gap-3 flex-wrap">
              {name}
              <Badge className={`border text-xs ${item.mcpDeployment === "local" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}>
                {item.mcpDeployment === "local" ? t.resourceHub.mcpLocal : t.resourceHub.mcpHosted}
              </Badge>
              {item.featured && <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 border text-[10px]">★ Featured</Badge>}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3">
              {item.mcpLastUpdated && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{item.mcpLastUpdated}</span>}
              {item.mcpUsageCount && <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" />{item.mcpUsageCount}</span>}
              {item.mcpUserCount && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{item.mcpUserCount}</span>}
              <span className="flex items-center gap-1"><Wrench className="h-3.5 w-3.5" />{item.requiredTools?.length ?? 0}</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-muted-foreground">{t.resourceHub.mcpCollection}</span>
              {item.mcpGithub && (
                <a href={`https://github.com/${item.mcpGithub}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <GitBranch className="h-3 w-3" />GitHub @{item.mcpGithub.split("/")[0]} / {item.mcpGithub.split("/")[1]}
                </a>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{toolDesc}</p>
            {categoryLabel && <Badge variant="secondary" className="bg-secondary text-muted-foreground border-border text-xs">{categoryLabel}</Badge>}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
              {item.mcpLicense && <span className="flex items-center gap-1"><Shield className="h-3 w-3" />{t.resourceHub.mcpLicenseLabel}: {item.mcpLicense}</span>}
              {item.mcpDeveloper && <span className="flex items-center gap-1"><User className="h-3 w-3" />{t.resourceHub.mcpDeveloperLabel}: {item.mcpDeveloper}</span>}
            </div>
          </div>

          {/* Tabs */}
          <div role="tablist" className="flex items-center gap-0 border-b border-border mb-6 overflow-x-auto">
            {tabs.map(({ key, label }) => (
              <button key={key} role="tab" aria-selected={activeTab === key} onClick={() => setActiveTab(key)}
                className={`px-5 py-3 text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === key ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Tab: Service Details */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{desc}</div>
              {item.requiredTools && item.requiredTools.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">{t.resourceHub.mcpAvailableTools}</h3>
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
              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <p className="text-xs font-semibold text-amber-500/80 mb-1">{t.resourceHub.mcpTips}</p>
                <p className="text-xs text-muted-foreground">{item.mcpDeployment === "local" ? t.resourceHub.mcpTipsLocal : t.resourceHub.mcpTipsHosted}</p>
              </div>
            </div>
          )}

          {/* Tab: Available Tools */}
          {activeTab === "tools" && (
            <div className="space-y-6">
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
                        <p className="text-xs text-muted-foreground font-medium">{t.resourceHub.mcpParameters}:</p>
                        {Object.entries(props).map(([key, prop]) => (
                          <p key={key} className="text-xs text-muted-foreground pl-2">
                            <code className="font-mono text-foreground">{key}</code>
                            {" "}({String(prop.type || "")}{reqs?.includes(key) ? `, ${t.resourceHub.mcpRequired}` : `, ${t.resourceHub.mcpOptional}`}): {String(prop.description || "")}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }) : <p className="text-sm text-muted-foreground py-8 text-center">{t.resourceHub.mcpNoToolInfo}</p>}
            </div>
          )}

          {/* Tab: Tool Testing (M1) */}
          {activeTab === "test" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">{t.resourceHub.mcpTabTest}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.requiredTools?.map(tool => (
                    <button key={tool.function.name} onClick={() => { setTestTool(tool.function.name); setTestArgs({}); setTestResult(null); }}
                      className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors ${testTool === tool.function.name ? "bg-primary/10 text-primary border-primary/30" : "bg-muted/30 text-muted-foreground border-border hover:text-foreground"}`}>
                      {tool.function.name}
                    </button>
                  ))}
                </div>
              </div>
              {selectedToolDef && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">{selectedToolDef.function.description}</p>

                  {/* API key input for search tools */}
                  {isSearchTool && (
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                      <label className="text-xs text-muted-foreground mb-1.5 block">{t.resourceHub.mcpTavilyKeyLabel}</label>
                      <Input type="password" value={tavilyKey} placeholder="tvly-..."
                        onChange={e => { setTavilyKey(e.target.value); try { localStorage.setItem("oortapi-tavily-key", e.target.value); } catch {} }}
                        className="text-xs font-mono" />
                      <p className="text-[10px] text-muted-foreground mt-1">{t.resourceHub.mcpTavilyKeyHint}</p>
                    </div>
                  )}

                  {/* Parameter inputs */}
                  {(() => {
                    const toolParams = selectedToolDef.function.parameters as Record<string, unknown> | undefined;
                    const props = toolParams?.properties as Record<string, Record<string, unknown>> | undefined;
                    const reqs = toolParams?.required as string[] | undefined;
                    if (!props) return null;
                    return (
                      <div className="space-y-3">
                        {Object.entries(props).map(([key, prop]) => (
                          <div key={key}>
                            <label className="text-xs text-muted-foreground mb-1 block">
                              <code className="font-mono text-foreground">{key}</code>
                              <span className="ml-1">({String(prop.type || "")}{reqs?.includes(key) ? `, ${t.resourceHub.mcpRequired}` : ""})</span>
                              {prop.description ? <span className="ml-1">- {String(prop.description)}</span> : null}
                            </label>
                            <Input value={testArgs[key] || ""} onChange={e => setTestArgs(prev => ({ ...prev, [key]: e.target.value }))}
                              placeholder={String(prop.description || key)} className="text-xs font-mono" />
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  <Button onClick={handleRunTest} disabled={testLoading || !testTool} className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
                    {testLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                    {t.resourceHub.mcpRunTest}
                  </Button>

                  {/* Result */}
                  {testResult !== null && (
                    <div className="space-y-2">
                      {testDemo !== null && (
                        <div className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full ${testDemo ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                          {testDemo ? `⚠️ ${t.resourceHub.mcpDemoMode}` : `✅ ${t.resourceHub.mcpRealExecution}`}
                        </div>
                      )}
                      <pre className="bg-zinc-950 rounded-lg p-4 overflow-x-auto text-xs leading-relaxed border border-zinc-800">
                        <code className="text-zinc-300 font-mono whitespace-pre">{testResult}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
              {!testTool && <p className="text-sm text-muted-foreground py-8 text-center">{t.resourceHub.mcpSelectTool}</p>}
            </div>
          )}

          {/* Tab: Feedback */}
          {activeTab === "feedback" && <CommentSection skillId={item.id} skillTitle={name} />}
        </div>

        {/* ── Right: Action sidebar ── */}
        <aside className="lg:w-72 shrink-0 space-y-4">
          <div className="glass-card p-5 rounded-xl border border-border/50 space-y-3">
            <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20" onClick={handleActivate}>
              <Rocket className="h-4 w-4 mr-2" />{t.resourceHub.mcpGetServer}
            </Button>
            <Button variant="secondary" className="w-full border border-border" onClick={handleCopyTools}>
              {copied ? <><Check className="h-4 w-4 mr-2 text-green-500" />{t.resourceHub.copiedSuccess}</> : <><Copy className="h-4 w-4 mr-2" />{t.resourceHub.mcpCopyConfig}</>}
            </Button>
            <Button variant="outline" size="sm" className="w-full border-border text-xs" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5 mr-1.5" />{t.resourceHub.mcpShare}
            </Button>
          </div>
          <div className="glass-card p-5 rounded-xl border border-border/50 space-y-3">
            {[
              { label: t.resourceHub.mcpDeploymentLabel, value: item.mcpDeployment === "local" ? t.resourceHub.mcpLocal : t.resourceHub.mcpHosted },
              { label: t.resourceHub.mcpToolsCountLabel, value: String(item.requiredTools?.length ?? 0) },
              { label: t.resourceHub.mcpPricingLabel, value: t.resourceHub[item.pricing] },
              ...(item.mcpLicense ? [{ label: t.resourceHub.mcpLicenseLabel, value: item.mcpLicense }] : []),
              ...(item.mcpDeveloper ? [{ label: t.resourceHub.mcpDeveloperLabel, value: item.mcpDeveloper }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
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
