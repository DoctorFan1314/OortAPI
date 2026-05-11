"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import Link from "next/link";
import { getAgentSkillById } from "@/lib/mock-agent-skills";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download, Star, Copy, Check,
  Terminal, FileCode, Clock,
  Share2, BadgeCheck, UserPlus, UserCheck, AlertTriangle, Image as ImageIcon,
} from "lucide-react";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { MarkdownRenderer, codeTheme } from "@/components/shared/markdown-renderer";
import { CopyButton } from "@/components/shared/copy-button";
import { ReportModal } from "@/components/skill/report-modal";
import { Lightbox } from "@/components/skill/lightbox";
import { CollectionPicker } from "@/components/skill/collection-picker";
import { VersionTimeline } from "@/components/skill/version-timeline";
import { useI18n } from "@/contexts/i18n-context";
import { useToast } from "@/contexts/toast-context";
import { useAuth } from "@/contexts/auth-context";
import { formatNumber } from "@/lib/utils";
import { useFollows } from "@/hooks/use-follows";
import { CommentSection } from "@/components/skill/comment-section";
import { useCollections } from "@/hooks/use-collections";

const SyntaxHighlighter = lazy(() =>
  Promise.all([
    import("react-syntax-highlighter"),
    import("react-syntax-highlighter/dist/esm/languages/hljs/typescript"),
    import("react-syntax-highlighter/dist/esm/languages/hljs/json"),
    import("react-syntax-highlighter/dist/esm/languages/hljs/markdown"),
  ]).then(([mod, ts, json, md]) => {
    const SH = mod.Light;
    SH.registerLanguage("typescript", ts.default);
    SH.registerLanguage("json", json.default);
    SH.registerLanguage("markdown", md.default);
    return { default: SH };
  })
);

function getLang(filename: string): string {
  if (filename.endsWith(".ts") || filename.endsWith(".tsx")) return "typescript";
  if (filename.endsWith(".json")) return "json";
  if (filename.endsWith(".md")) return "markdown";
  return "text";
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadAll(skill: NonNullable<ReturnType<typeof getAgentSkillById>>) {
  const [{ default: JSZip }, { saveAs }] = await Promise.all([import("jszip"), import("file-saver")]);
  const zip = new JSZip();
  const folder = zip.folder(skill.name)!;
  for (const [name, content] of Object.entries(skill.files)) {
    folder.file(name, content);
  }
  zip.generateAsync({ type: "blob" }).then((blob) => {
    saveAs(blob, `${skill.name}.zip`);
  });
}

export default function AgentSkillDetailClient({ id }: { id: string }) {
  const skill = getAgentSkillById(id);
  const { t } = useI18n();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isFollowing, toggleFollow } = useFollows();
  const { collections, addToCollection, createCollection } = useCollections();
  const [activeTab, setActiveTab] = useState<"intro" | "files" | "feedback" | "versions">("intro");
  const [activeFile, setActiveFile] = useState<string>("");
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Report modal ESC close + focus trap
  useEffect(() => {
    if (!showReport) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowReport(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showReport]);

  if (!skill) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg">Skill not found / 未找到技能</p>
        <Link href="/skills" className="text-primary mt-4 inline-block hover:underline">Back to Skills / 返回技能列表</Link>
      </div>
    );
  }

  function handleShare() {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({ title: skill?.name, url: shareUrl }).catch(() => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          toast(t.common.copied, "success");
        });
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast(t.common.copied, "success");
      });
    }
  }

  function handleSubmitReport(reason: "spam" | "abuse" | "copyright" | "other", description: string) {
    try {
      const existing = localStorage.getItem(STORAGE_KEYS.reports);
      const reports: unknown[] = existing ? JSON.parse(existing) : [];
      reports.push({
        id: `rpt-${Date.now()}`,
        targetType: "skill",
        targetId: skill?.id,
        reason,
        description,
        reporterEmail: user?.email || "anonymous",
        timestamp: new Date().toISOString(),
        status: "pending",
      });
      localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(reports));
    } catch { /* ignore */ }
    setShowReport(false);
    toast(t.common.reportSubmitted, "success");
  }

  const fileNames = Object.keys(skill.files);
  const currentFile = activeFile || fileNames[0] || "";
  const followingAuthor = isFollowing(skill.developer);

  const versions = skill.versions && skill.versions.length > 0 ? skill.versions : null;

  const tabs = [
    { key: "intro" as const, label: t.agentSkills.skillIntro },
    { key: "files" as const, label: t.agentSkills.skillFiles },
    { key: "feedback" as const, label: t.agentSkills.feedback },
    { key: "versions" as const, label: t.common.versionHistory },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <Breadcrumb items={[{ label: t.common.skills, href: "/skills" }, { label: skill.name }]} />

      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 flex items-center gap-2">
          {skill.name}
          {skill.verified && (
            <span title={t.common.verified} className="inline-flex items-center">
              <BadgeCheck className="h-6 w-6 text-blue-500" />
            </span>
          )}
        </h1>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5"><Download className="h-4 w-4" />{formatNumber(skill.downloads)}</span>
          <span className="flex items-center gap-1.5"><Star className="h-4 w-4" />{formatNumber(skill.stars)}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{skill.lastUpdated}</span>
        </div>

        {/* Share button */}
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            {t.common.share}
          </Button>
        </div>

        {/* Collection */}
        <div className="text-sm text-muted-foreground mb-4">
          {t.agentSkills.collection}: <span className="text-foreground">{skill.author}/{skill.name}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {skill.description}
        </p>

        {/* Category + Developer */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Badge variant="secondary" className="bg-secondary text-muted-foreground border-border">
            {skill.category}
          </Badge>
          <span className="text-muted-foreground">
            {t.agentSkills.developer}: <span className="text-foreground">{skill.developer}</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" className="flex items-center gap-0 border-b border-border mb-6" onKeyDown={(e) => {
        const tabKeys = tabs.map((tab) => tab.key);
        const currentIndex = tabKeys.indexOf(activeTab);
        let newIndex = currentIndex;
        if (e.key === "ArrowRight") { e.preventDefault(); newIndex = (currentIndex + 1) % tabKeys.length; }
        else if (e.key === "ArrowLeft") { e.preventDefault(); newIndex = (currentIndex - 1 + tabKeys.length) % tabKeys.length; }
        else if (e.key === "Home") { e.preventDefault(); newIndex = 0; }
        else if (e.key === "End") { e.preventDefault(); newIndex = tabKeys.length - 1; }
        else return;
        setActiveTab(tabKeys[newIndex]);
        document.getElementById(`detail-tab-${tabKeys[newIndex]}`)?.focus();
      }}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            id={`detail-tab-${key}`}
            aria-controls={`detail-tabpanel-${key}`}
            tabIndex={activeTab === key ? 0 : -1}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-3 text-sm border-b-2 transition-colors ${
              activeTab === key
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Skill Intro */}
      {activeTab === "intro" && (
        <div role="tabpanel" id="detail-tabpanel-intro" aria-labelledby="detail-tab-intro" className="grid lg:grid-cols-[1fr_280px] gap-6">
          {/* Main content */}
          <div className="space-y-6">
            {/* Screenshots gallery */}
            {skill.screenshots && skill.screenshots.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  {t.common.screenshots}
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {skill.screenshots.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`${skill.name} screenshot ${i + 1}`}
                      loading="lazy"
                      className="h-48 rounded-lg border border-border cursor-pointer hover:border-primary/50 transition-colors shrink-0 object-cover"
                      onClick={() => setLightboxSrc(src)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* README content */}
            <div className="glass-card p-6">
              <MarkdownRenderer content={skill.readme} />
            </div>
          </div>

          {/* Sidebar: source + metadata */}
          <div className="space-y-4">
            {/* Source / Install card */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">{t.agentSkills.overview}</h3>

              {/* Install command */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">{t.agentSkills.install}</p>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-950 border border-border cursor-pointer hover:border-primary/30 transition-colors"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    navigator.clipboard.writeText(skill.installCommand).then(() => {
                      setCopiedInstall(true);
                      setTimeout(() => setCopiedInstall(false), 2000);
                    }).catch(() => {});
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigator.clipboard.writeText(skill.installCommand).then(() => {
                        setCopiedInstall(true);
                        setTimeout(() => setCopiedInstall(false), 2000);
                      }).catch(() => {});
                    }
                  }}
                >
                  <Terminal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <code className="text-xs text-foreground font-mono flex-1 truncate">{skill.installCommand}</code>
                  {copiedInstall ? (
                    <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                  )}
                </div>
              </div>

              {/* Download */}
              <Button
                variant="outline"
                size="sm"
                className="w-full border-border text-foreground hover:bg-secondary"
                onClick={() => downloadAll(skill)}
              >
                <Download className="h-4 w-4 mr-2" />
                {t.agentSkills.downloadAll}
              </Button>

              {/* Source link */}
              {skill.installCommand.includes("@") && (
                <a
                  href={`https://github.com/${skill.author.replace(/^@/, "")}/${skill.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FileCode className="h-3.5 w-3.5" />
                  GitHub
                </a>
              )}
            </div>

            {/* Metadata table */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">{t.agentSkills.metadata}</h3>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["name", skill.name],
                    ["description", skill.description.slice(0, 60) + "..."],
                    ["category", skill.category],
                    [t.agentSkills.developer, (
                      <span key="dev" className="flex items-center gap-2">
                        {skill.developer}
                        <button
                          onClick={() => toggleFollow(skill.developer)}
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
                            followingAuthor
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                          }`}
                        >
                          {followingAuthor ? (
                            <><UserCheck className="h-3 w-3" />{t.common.following}</>
                          ) : (
                            <><UserPlus className="h-3 w-3" />{t.common.follow}</>
                          )}
                        </button>
                      </span>
                    )],
                    [t.agentSkills.version, skill.version],
                    [t.agentSkills.license, skill.license],
                  ].map(([key, val]) => (
                    <tr key={String(key)} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-3 text-muted-foreground align-top whitespace-nowrap">{key}</td>
                      <td className="py-2.5 text-foreground break-all">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Dependencies section */}
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t.common.dependencies}</h4>
                {skill.dependencies && skill.dependencies.length > 0 ? (
                  <ul className="space-y-1.5">
                    {skill.dependencies.map((dep) => (
                      <li key={dep.name} className="flex items-center justify-between text-sm">
                        <Link
                          href={`/skills?search=${encodeURIComponent(dep.name)}`}
                          className="text-primary hover:underline truncate"
                        >
                          {dep.name}
                        </Link>
                        <span className="text-xs text-muted-foreground ml-2 shrink-0">{dep.version}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">{t.common.noDependencies}</p>
                )}
              </div>
            </div>

            {/* Add to Collection */}
            <CollectionPicker
              collections={collections}
              skillId={skill.id}
              skillName={skill.name}
              onAddToCollection={addToCollection}
              onCreateCollection={createCollection}
              onSuccess={(msg) => toast(msg, "success")}
            />

            {/* Report button */}
            <div className="glass-card p-5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-red-400 hover:bg-red-500/5"
                onClick={() => setShowReport(true)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {t.common.report}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Skill Files */}
      {activeTab === "files" && (
        <div role="tabpanel" id="detail-tabpanel-files" aria-labelledby="detail-tab-files">
          <div className="glass-card overflow-hidden">
            {/* File header with developer info */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">
                  {skill.developer.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-foreground font-medium">{skill.name}</span>
                <span className="text-xs text-muted-foreground">{t.agentSkills.developer}</span>
              </div>
              <span className="text-xs text-muted-foreground">{skill.lastUpdated}</span>
            </div>

            <div className="flex">
              {/* File tree sidebar */}
              <div className="w-56 shrink-0 border-r border-border bg-secondary/30 p-2 hidden sm:block">
                {fileNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => setActiveFile(name)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors ${
                      currentFile === name
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{name}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground/60">
                      {skill.files[name] ? (skill.files[name].length / 1024).toFixed(1) + "KB" : ""}
                    </span>
                  </button>
                ))}
              </div>

              {/* File content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-border">
                  <div className="flex items-center gap-2">
                    {/* Mobile file tabs */}
                    {fileNames.map((name) => (
                      <button
                        key={name}
                        role="tab"
                        aria-selected={currentFile === name}
                        onClick={() => setActiveFile(name)}
                        className={`sm:hidden text-xs px-1.5 py-0.5 rounded transition-colors ${currentFile === name ? "text-foreground bg-primary/10 border-b-2 border-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {name}
                      </button>
                    ))}
                    <span className="hidden sm:inline text-xs text-muted-foreground font-mono">{currentFile}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CopyButton text={skill.files[currentFile] || ""} />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground h-7 px-2"
                      onClick={() => downloadFile(currentFile, skill.files[currentFile] || "")}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {currentFile && skill.files[currentFile] && (
                  <Suspense fallback={<div className="p-4 text-sm text-muted-foreground animate-pulse">{t.common.loading}</div>}>
                    <SyntaxHighlighter
                      language={getLang(currentFile)}
                      style={codeTheme}
                      customStyle={{ margin: 0, fontSize: "0.875rem", borderRadius: 0, maxHeight: "500px" }}
                    >
                      {skill.files[currentFile]}
                    </SyntaxHighlighter>
                  </Suspense>
                )}
              </div>
            </div>
          </div>

          {/* Download all button */}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => downloadAll(skill)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="h-4 w-4 mr-2" />
              {t.agentSkills.downloadAll}
            </Button>
          </div>
        </div>
      )}

      {/* Tab: Feedback */}
      {activeTab === "feedback" && (
        <div role="tabpanel" id="detail-tabpanel-feedback" aria-labelledby="detail-tab-feedback" className="space-y-6">
          <CommentSection skillId={skill.id} skillTitle={skill.title || skill.name} />
        </div>
      )}

      {/* Tab: Version History */}
      {activeTab === "versions" && (
        <div role="tabpanel" id="detail-tabpanel-versions" aria-labelledby="detail-tab-versions" className="max-w-2xl">
          {versions ? (
            <VersionTimeline versions={versions} />
          ) : (
            <div className="glass-card p-6 text-center">
              <p className="text-sm text-muted-foreground">No version history available</p>
            </div>
          )}
        </div>
      )}

      {/* Report modal */}
      <ReportModal
        open={showReport}
        onClose={() => setShowReport(false)}
        onSubmit={handleSubmitReport}
      />

      {/* Lightbox overlay for screenshots */}
      {skill.screenshots && (
        <Lightbox
          src={lightboxSrc}
          screenshots={skill.screenshots}
          onClose={() => setLightboxSrc(null)}
          onNavigate={setLightboxSrc}
        />
      )}
    </div>
  );
}
