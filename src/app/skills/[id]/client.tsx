"use client";

import { useState } from "react";
import Link from "next/link";
import { getAgentSkillById } from "@/lib/mock-agent-skills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download, Star, Copy, Check,
  Terminal, FileCode, Clock, ThumbsUp, Reply, X
} from "lucide-react";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { useI18n } from "@/contexts/i18n-context";
import { useToast } from "@/contexts/toast-context";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import ts from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import md from "react-syntax-highlighter/dist/esm/languages/hljs/markdown";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { formatNumber } from "@/lib/utils";

SyntaxHighlighter.registerLanguage("typescript", ts);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("markdown", md);

const codeTheme: Record<string, React.CSSProperties> = {
  "hljs": { background: "#0d1117", color: "#e6edf3", padding: "1rem", borderRadius: "0 0 0.5rem 0.5rem", overflow: "auto" },
  "hljs-keyword": { color: "#ff7b72" },
  "hljs-string": { color: "#a5d6ff" },
  "hljs-number": { color: "#79c0ff" },
  "hljs-built_in": { color: "#ffa657" },
  "hljs-comment": { color: "#8b949e" },
  "hljs-title": { color: "#d2a8ff" },
  "hljs-attr": { color: "#79c0ff" },
  "hljs-params": { color: "#e6edf3" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-muted-foreground hover:text-foreground h-7 px-2"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

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

function downloadAll(skill: NonNullable<ReturnType<typeof getAgentSkillById>>) {
  const zip = new JSZip();
  const folder = zip.folder(skill.name)!;
  for (const [name, content] of Object.entries(skill.files)) {
    folder.file(name, content);
  }
  zip.generateAsync({ type: "blob" }).then((blob) => {
    saveAs(blob, `${skill.name}.zip`);
  });
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="text-foreground">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={i} className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono text-foreground">{part.slice(1, -1)}</code>;
        }
        return part;
      })}
    </>
  );
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = "";
  let tableRows: string[][] = [];
  let isHeaderRow = true;

  function flushTable() {
    if (tableRows.length === 0) return;
    const colCount = tableRows[0].length;
    elements.push(
      <div key={`table-${elements.length}`} className="my-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          {tableRows.map((row, ri) => (
            <tr key={ri} className={ri === 0 ? "bg-secondary/50" : "border-t border-border"}>
              {row.map((cell, ci) => {
                const Tag = ri === 0 ? "th" : "td";
                return (
                  <Tag key={ci} className="px-3 py-2 text-left text-muted-foreground">
                    <InlineMarkdown text={cell} />
                  </Tag>
                );
              })}
              {row.length < colCount && Array.from({ length: colCount - row.length }).map((_, ci) => (
                <td key={`pad-${ci}`} className="px-3 py-2" />
              ))}
            </tr>
          ))}
        </table>
      </div>
    );
    tableRows = [];
    isHeaderRow = true;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      flushTable();
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${i}`} className="relative my-4">
            <div className="flex items-center justify-between bg-[#161b22] border border-border border-b-0 rounded-t-lg px-4 py-2">
              <span className="text-xs text-muted-foreground font-mono">{codeLang || "code"}</span>
              <CopyButton text={codeLines.join("\n")} />
            </div>
            <SyntaxHighlighter language={codeLang || "text"} style={codeTheme} customStyle={{ margin: 0, fontSize: "0.875rem" }}>
              {codeLines.join("\n")}
            </SyntaxHighlighter>
          </div>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith("# ")) {
      flushTable();
      elements.push(<h1 key={i} className="text-2xl font-bold text-foreground mt-6 mb-3">{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      flushTable();
      elements.push(<h2 key={i} className="text-lg font-semibold text-foreground mt-6 mb-3">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      flushTable();
      elements.push(<h3 key={i} className="text-base font-semibold text-foreground mt-4 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith("| ") || line.startsWith("|")) {
      if (isTableSeparator(line)) {
        isHeaderRow = false;
        continue;
      }
      const cells = line.split("|").slice(1, -1).map(c => c.trim());
      if (cells.length > 0) {
        tableRows.push(cells);
      }
    } else if (line.startsWith("- ")) {
      flushTable();
      elements.push(
        <div key={i} className="flex gap-2 py-1 text-sm text-muted-foreground">
          <span className="text-primary shrink-0 mt-0.5">•</span>
          <span><InlineMarkdown text={line.slice(2)} /></span>
        </div>
      );
    } else if (line.match(/^\d+\.\s/)) {
      flushTable();
      const num = line.match(/^(\d+)\.\s/)?.[1] || "1";
      elements.push(
        <div key={i} className="flex gap-2 py-1 text-sm text-muted-foreground">
          <span className="text-primary shrink-0 font-mono text-xs mt-0.5">{num}.</span>
          <span><InlineMarkdown text={line.replace(/^\d+\.\s/, "")} /></span>
        </div>
      );
    } else if (line.startsWith("`") && line.endsWith("`")) {
      flushTable();
      elements.push(<code key={i} className="block my-1 px-3 py-1.5 bg-secondary rounded text-sm font-mono text-foreground">{line.slice(1, -1)}</code>);
    } else if (line.trim() === "") {
      flushTable();
      elements.push(<div key={i} className="h-2" />);
    } else {
      flushTable();
      elements.push(
        <p key={i} className="text-sm text-muted-foreground leading-relaxed">
          <InlineMarkdown text={line} />
        </p>
      );
    }
  }
  flushTable();

  return <div>{elements}</div>;
}

// Mock comments
const mockComments = [
  { id: "1", user: "Alice", avatar: "A", content: "非常好用的技能！帮我解决了搜索多个平台的需求，安装也很简单。", rating: 5, date: "2026-04-28", likes: 12, replyTo: null as string | null },
  { id: "2", user: "Bob", avatar: "B", content: "帮我解决了大问题，搜索功能很强，推荐给所有需要多平台数据的开发者。", rating: 4, date: "2026-04-25", likes: 8, replyTo: null as string | null },
  { id: "3", user: "Charlie", avatar: "C", content: "安装简单，文档清晰，社区维护活跃。期待更多平台的支持。", rating: 5, date: "2026-04-20", likes: 5, replyTo: null as string | null },
];

export default function AgentSkillDetailClient({ id }: { id: string }) {
  const skill = getAgentSkillById(id);
  const { t } = useI18n();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"intro" | "files" | "feedback">("intro");
  const [activeFile, setActiveFile] = useState<string>("");
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});
  const [localComments, setLocalComments] = useState(mockComments);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyToUser, setReplyToUser] = useState<string | null>(null);

  function handleSubmitComment() {
    if (!commentText.trim()) return;
    const newComment = {
      id: `local-${Date.now()}`,
      user: "User",
      avatar: "U",
      content: commentText.trim(),
      rating: commentRating,
      date: new Date().toISOString().slice(0, 10),
      likes: 0,
      replyTo: replyToUser,
    };
    setLocalComments((prev) => [newComment, ...prev]);
    setCommentText("");
    setCommentRating(5);
    setReplyTo(null);
    setReplyToUser(null);
    toast(t.comments.title, "success");
  }

  if (!skill) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg">{t.agentSkills.notFound}</p>
        <Link href="/skills" className="text-primary mt-4 inline-block hover:underline">{t.agentSkills.backToList}</Link>
      </div>
    );
  }

  const fileNames = Object.keys(skill.files);
  const currentFile = activeFile || fileNames[0] || "";

  const tabs = [
    { key: "intro" as const, label: t.agentSkills.skillIntro },
    { key: "files" as const, label: t.agentSkills.skillFiles },
    { key: "feedback" as const, label: t.agentSkills.feedback },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <Breadcrumb items={[{ label: t.common.skills, href: "/skills" }, { label: skill.name }]} />

      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{skill.name}</h1>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5"><Download className="h-4 w-4" />{formatNumber(skill.downloads)}</span>
          <span className="flex items-center gap-1.5"><Star className="h-4 w-4" />{formatNumber(skill.stars)}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{skill.lastUpdated}</span>
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
      <div className="flex items-center gap-0 border-b border-border mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
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
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          {/* README content */}
          <div className="glass-card p-6">
            <MarkdownRenderer content={skill.readme} />
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
                    [t.agentSkills.developer, skill.developer],
                    [t.agentSkills.version, skill.version],
                    [t.agentSkills.license, skill.license],
                  ].map(([key, val]) => (
                    <tr key={key} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-3 text-muted-foreground align-top whitespace-nowrap">{key}</td>
                      <td className="py-2.5 text-foreground break-all">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Skill Files */}
      {activeTab === "files" && (
        <div>
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
                  <SyntaxHighlighter
                    language={getLang(currentFile)}
                    style={codeTheme}
                    customStyle={{ margin: 0, fontSize: "0.875rem", borderRadius: 0, maxHeight: "500px" }}
                  >
                    {skill.files[currentFile]}
                  </SyntaxHighlighter>
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
        <div className="space-y-6">
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
    </div>
  );
}
