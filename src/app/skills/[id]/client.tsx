"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import Link from "next/link";
import { getAgentSkillById, agentSkills } from "@/lib/mock-agent-skills";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download, Star, Copy, Check,
  Terminal, FileCode, Clock, ThumbsUp, Reply, X,
  Search, ArrowLeft,
  Share2, BadgeCheck, UserPlus, UserCheck, AlertTriangle, ChevronDown, Image as ImageIcon,
} from "lucide-react";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { MarkdownRenderer, CopyButton, codeTheme } from "@/components/shared/markdown-renderer";
import { useI18n } from "@/contexts/i18n-context";
import { useToast } from "@/contexts/toast-context";
import { useAuth } from "@/contexts/auth-context";
import { formatNumber } from "@/lib/utils";
import { useFollows } from "@/hooks/use-follows";
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

// Mock default comments
const defaultComments = [
  { id: "1", user: "Alice", avatar: "A", content: "非常好用的技能！帮我解决了搜索多个平台的需求，安装也很简单。", rating: 5, date: "2026-04-28", likes: 12, replyTo: null as string | null },
  { id: "2", user: "Bob", avatar: "B", content: "帮我解决了大问题，搜索功能很强，推荐给所有需要多平台数据的开发者。", rating: 4, date: "2026-04-25", likes: 8, replyTo: null as string | null },
  { id: "3", user: "Charlie", avatar: "C", content: "安装简单，文档清晰，社区维护活跃。期待更多平台的支持。", rating: 5, date: "2026-04-20", likes: 5, replyTo: null as string | null },
];

type LocalComment = typeof defaultComments[number];

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
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});
  const [localComments, setLocalComments] = useState<LocalComment[]>(defaultComments);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyToUser, setReplyToUser] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState<"spam" | "abuse" | "copyright" | "other">("spam");
  const [reportDesc, setReportDesc] = useState("");
  const [showCollections, setShowCollections] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Load persisted comments from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.skillComments(id));
      if (raw) {
        const saved: LocalComment[] = JSON.parse(raw);
        setLocalComments([...saved, ...defaultComments]);
      }
    } catch { /* ignore */ }
  }, [id]);

  function handleSubmitComment() {
    if (!commentText.trim()) return;
    const newComment: LocalComment = {
      id: `local-${Date.now()}`,
      user: user?.username || "User",
      avatar: user ? user.username.charAt(0).toUpperCase() : "U",
      content: commentText.trim(),
      rating: commentRating,
      date: new Date().toISOString().slice(0, 10),
      likes: 0,
      replyTo: replyToUser,
    };

    const updated = [newComment, ...localComments];
    setLocalComments(updated);
    setCommentText("");
    setCommentRating(5);
    setReplyTo(null);
    setReplyToUser(null);

    // Persist user-submitted comments to localStorage
    try {
      const existing = localStorage.getItem(STORAGE_KEYS.skillComments(id));
      const saved: LocalComment[] = existing ? JSON.parse(existing) : [];
      saved.unshift(newComment);
      localStorage.setItem(STORAGE_KEYS.skillComments(id), JSON.stringify(saved));
    } catch { /* ignore */ }

    toast(t.comments.title, "success");
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

  function handleSubmitReport() {
    try {
      const existing = localStorage.getItem(STORAGE_KEYS.reports);
      const reports: unknown[] = existing ? JSON.parse(existing) : [];
      reports.push({
        id: `rpt-${Date.now()}`,
        targetType: "skill",
        targetId: skill?.id,
        reason: reportReason,
        description: reportDesc,
        reporterEmail: user?.email || "anonymous",
        timestamp: new Date().toISOString(),
        status: "pending",
      });
      localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(reports));
    } catch { /* ignore */ }
    setShowReport(false);
    setReportReason("spam");
    setReportDesc("");
    toast(t.common.reportSubmitted, "success");
  }

  if (!skill) {
    const trendingSkills = agentSkills.filter(s => s.trending).slice(0, 4);
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t.agentSkills.notFound}</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            The skill you&apos;re looking for may have been removed or doesn&apos;t exist. Try searching or browse trending skills below.
          </p>
        </div>

        {trendingSkills.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Trending Skills</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingSkills.map((s) => (
                <Link
                  key={s.id}
                  href={`/skills/${s.id}`}
                  className="glass-card p-5 group hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.author}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{s.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Download className="h-3 w-3" />{formatNumber(s.downloads)}</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3" />{formatNumber(s.stars)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <Link href="/skills">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.agentSkills.backToList}
            </Button>
          </Link>
          <Link href="/search">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const fileNames = Object.keys(skill.files);
  const currentFile = activeFile || fileNames[0] || "";
  const followingAuthor = isFollowing(skill.developer);

  const mockVersions = [
    { version: skill.version, date: skill.lastUpdated, changelog: "Current version", author: skill.developer },
    { version: "1.0.0", date: "2026-01-15", changelog: "Initial release", author: skill.developer },
  ];
  const versions = skill.versions && skill.versions.length > 0 ? skill.versions : mockVersions;

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
            {t.agentSkills.developer}：<span className="text-foreground">{skill.developer}</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" className="flex items-center gap-0 border-b border-border mb-6">
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
                <p className="text-xs text-muted-foreground mb-2">install</p>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0d1117] border border-border cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(skill.installCommand);
                    setCopiedInstall(true);
                    setTimeout(() => setCopiedInstall(false), 2000);
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
            <div className="glass-card p-5">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-border text-foreground hover:bg-secondary"
                  onClick={() => setShowCollections(!showCollections)}
                >
                  {t.common.addToCollection}
                  <ChevronDown className="h-3.5 w-3.5 ml-auto" />
                </Button>
                {showCollections && (
                  <div className="absolute z-20 bottom-full mb-1 left-0 w-full glass-card border border-border rounded-lg shadow-lg overflow-hidden">
                    <div className="max-h-48 overflow-y-auto">
                      {collections.length > 0 ? (
                        collections.map((col) => (
                          <button
                            key={col.id}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors text-foreground"
                            onClick={() => {
                              addToCollection(col.id, skill.id);
                              setShowCollections(false);
                              toast(`${skill.name} → ${col.name}`, "success");
                            }}
                          >
                            {col.name}
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-xs text-muted-foreground">{t.common.noData}</p>
                      )}
                    </div>
                    <div className="border-t border-border">
                      {showNewCollection ? (
                        <div className="p-2 flex gap-1">
                          <input
                            type="text"
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            placeholder={t.common.collectionName}
                            className="flex-1 px-2 py-1 text-xs bg-secondary border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                              if (newCollectionName.trim()) {
                                const col = createCollection(newCollectionName.trim(), "");
                                if (!col) return;
                                addToCollection(col.id, skill.id);
                                setNewCollectionName("");
                                setShowNewCollection(false);
                                setShowCollections(false);
                                toast(`${skill.name} → ${col.name}`, "success");
                              }
                            }}
                          >
                            {t.common.confirm}
                          </Button>
                        </div>
                      ) : (
                        <button
                          className="w-full text-left px-3 py-2 text-xs text-primary hover:bg-secondary transition-colors"
                          onClick={() => setShowNewCollection(true)}
                        >
                          + {t.common.newCollection}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                        onClick={() => setActiveFile(name)}
                        className={`sm:hidden text-xs ${currentFile === name ? "text-foreground" : "text-muted-foreground"}`}
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
                  <Suspense fallback={<div className="p-4 text-sm text-muted-foreground animate-pulse">Loading...</div>}>
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
          {/* Comment input */}
          <div className="glass-card p-5">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm text-primary font-medium shrink-0">
                U
              </div>
              <div className="flex-1">
                {replyToUser && (
                  <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-md bg-primary/5 border border-primary/20 text-xs text-primary">
                    <Reply className="h-3 w-3" />
                    <span>{t.comments.replyingTo} @{replyToUser}</span>
                    <button
                      onClick={() => { setReplyTo(null); setReplyToUser(null); setCommentText(""); }}
                      className="ml-auto hover:text-primary/70 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={replyToUser ? `@${replyToUser} ` : t.agentSkills.writeComment}
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none min-h-[80px]"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCommentRating(i + 1)}
                        aria-label={`${i + 1} star`}
                      >
                        <Star className={`h-4 w-4 ${i < commentRating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />
                      </button>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!commentText.trim()}
                    onClick={handleSubmitComment}
                  >
                    {t.comments.submitComment}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments list */}
          <div className="space-y-4">
            {localComments.map((comment) => (
              <div key={comment.id} className="glass-card p-5">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-sm text-muted-foreground font-medium shrink-0">
                    {comment.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{comment.user}</span>
                      {comment.replyTo && (
                        <span className="text-xs text-primary/70 flex items-center gap-1">
                          <Reply className="h-2.5 w-2.5" />
                          @{comment.replyTo}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">{comment.date}</span>
                      <div className="flex items-center gap-0.5 ml-auto">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < comment.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">{comment.content}</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCommentLikes(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ThumbsUp className={`h-3 w-3 ${commentLikes[comment.id] ? "text-primary fill-primary" : ""}`} />
                        {comment.likes + (commentLikes[comment.id] ? 1 : 0)}
                      </button>
                      <button
                        onClick={() => {
                          setReplyToUser(comment.user);
                          setCommentText(`@${comment.user} `);
                        }}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Reply className="h-3 w-3" />
                        {t.comments.reply}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Version History */}
      {activeTab === "versions" && (
        <div role="tabpanel" id="detail-tabpanel-versions" aria-labelledby="detail-tab-versions" className="max-w-2xl">
          <div className="glass-card p-6">
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />

              <div className="space-y-6">
                {versions.map((v, i) => (
                  <div key={`${v.version}-${i}`} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div className={`relative z-10 mt-1 h-[22px] w-[22px] rounded-full border-2 shrink-0 ${
                      i === 0
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    }`}>
                      {i === 0 && (
                        <div className="absolute inset-1 rounded-full bg-primary-foreground" />
                      )}
                    </div>

                    {/* Version content */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold ${i === 0 ? "text-foreground" : "text-muted-foreground"}`}>
                          v{v.version}
                        </span>
                        {i === 0 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                            Latest
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">{v.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{v.changelog}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">by {v.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report modal overlay */}
      {showReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowReport(false)}
        >
          <div
            className="glass-card w-full max-w-md mx-4 p-6 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{t.common.report}</h3>
              <button onClick={() => setShowReport(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{t.common.reportReason}</p>

            <div className="space-y-2 mb-4">
              {(["spam", "abuse", "copyright", "other"] as const).map((reason) => (
                <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="report-reason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {t.common[`report${reason.charAt(0).toUpperCase() + reason.slice(1)}` as keyof typeof t.common]}
                  </span>
                </label>
              ))}
            </div>

            <textarea
              value={reportDesc}
              onChange={(e) => setReportDesc(e.target.value)}
              placeholder={t.common.reportReason}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none min-h-[60px] mb-4"
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowReport(false)}>
                {t.common.cancel}
              </Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSubmitReport}>
                {t.common.report}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox overlay for screenshots */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxSrc(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={() => setLightboxSrc(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={lightboxSrc}
              alt="Screenshot"
              className="max-w-full max-h-[90vh] rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
