"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

const CHANGELOG_URLS: Record<string, string> = {
  zh: "https://raw.githubusercontent.com/DoctorFan1314/OortAPI/main/CHANGELOG_CN.md",
  en: "https://raw.githubusercontent.com/DoctorFan1314/OortAPI/main/CHANGELOG.md",
};

const FALLBACK: Record<string, string> = {
  zh: "# 更新日志\n\n## 加载中...",
  en: "# Changelog\n\n## Loading...",
};

function parseChangelog(markdown: string) {
  const sections = markdown.split("\n## ");
  const versions = sections
    .filter(s => s.trim().startsWith("["))
    .map(s => {
      const lines = s.trim().split("\n");
      const titleLine = lines[0];
      const match = titleLine.match(/^\[?([vV]?[\d.]+)\]?\s*[—\-–]\s*(\d{4}-\d{2}-\d{2})/);
      if (!match) return null;
      const version = match[1];
      const date = match[2];
      const content = lines.slice(1).join("\n").trim();
      return { version, date, content };
    })
    .filter(Boolean);
  return versions;
}

export default function ChangelogPage() {
  const { lang } = useI18n();
  const [versions, setVersions] = useState<Array<{ version: string; date: string; content: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("oortapi-changelog-cache");
    const cached = stored ? JSON.parse(stored) : null;

    fetch(CHANGELOG_URLS[lang])
      .then(r => r.text())
      .then(text => {
        const parsed = parseChangelog(text) as Array<{ version: string; date: string; content: string }>;
        setVersions(parsed);
        localStorage.setItem("oortapi-changelog-cache", JSON.stringify({ data: parsed, ts: Date.now() }));
        setLoading(false);
      })
      .catch(() => {
        if (cached?.data) {
          setVersions(cached.data);
        }
        setLoading(false);
      });
  }, [lang]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Clock className="h-6 w-6" />
        {lang === "zh" ? "版本日志" : "Changelog"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {lang === "zh" ? "查看 OortAPI 的所有版本更新记录。" : "View all version history for OortAPI."}
      </p>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-6">
                <div className="h-6 w-48 bg-muted animate-pulse rounded mb-3" />
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : versions.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-6 text-center text-muted-foreground">
            {lang === "zh" ? "暂无版本记录" : "No version history available"}
          </CardContent>
        </Card>
      ) : (
        <div className="relative space-y-6">
          {versions.map((v, i) => (
            <Card key={v.version} className={`glass-card ${i === 0 ? "border-primary/30" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="font-mono">{v.version}</span>
                  <span className="text-xs font-normal text-muted-foreground">{v.date}</span>
                  {i === 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      {lang === "zh" ? "最新" : "Latest"}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {v.content.split("\n").map((line, j) => {
                    if (line.startsWith("### ")) return <h4 key={j} className="font-medium text-foreground mt-3 mb-1">{line.replace("### ", "")}</h4>;
                    if (line.startsWith("- **")) {
                      const boldEnd = line.indexOf("**", 3);
                      const bold = line.slice(3, boldEnd);
                      const rest = line.slice(boldEnd + 2);
                      return <p key={j} className="py-0.5"><strong>{bold}</strong>{rest}</p>;
                    }
                    if (line.startsWith("- ")) return <p key={j} className="py-0.5 pl-3">• {line.slice(2)}</p>;
                    if (line.trim() === "") return null;
                    return <p key={j} className="py-0.5">{line}</p>;
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
