"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { getSkillById } from "@/lib/mock-data";
import { COLORS } from "@/lib/theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Star, Users, Clock, Copy, Check, ThumbsUp, Bookmark, Share2, ArrowLeft } from "lucide-react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  }, [text]);
  return (
    <Button onClick={handleCopy} className="bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90 font-medium">
      {copied ? <><Check className="h-4 w-4 mr-2" />已复制！</> : error ? <><Copy className="h-4 w-4 mr-2" />复制失败，请手动复制</> : <><Copy className="h-4 w-4 mr-2" />复制完整 Prompt</>}
    </Button>
  );
}

export default function SkillDetailClient({ id }: { id: string }) {
  const skill = getSkillById(id);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareError, setShareError] = useState(false);

  if (!skill) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-[#8b949e] text-lg">技能模板未找到</p>
        <Link href="/skills" className="text-[#00d4ff] mt-4 inline-block hover:underline">返回技能市场</Link>
      </div>
    );
  }

  const color = COLORS.category[skill.categorySlug] || COLORS.primary;

  const buildPrompt = (template: string) => {
    let result = template;
    for (const [key, value] of Object.entries(variableValues)) {
      if (value) result = result.replaceAll(`{{${key}}}`, value);
    }
    return result;
  };

  const promptOnline = buildPrompt(skill.promptOnline);
  const promptLocal = buildPrompt(skill.promptLocal);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareError(false);
    } catch {
      setShareError(true);
      setTimeout(() => setShareError(false), 3000);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <Link href="/skills" className="inline-flex items-center gap-1.5 text-sm text-[#8b949e] hover:text-white mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />返回技能市场
      </Link>

      {/* Hero */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs border" style={{ color, borderColor: `${color}30`, backgroundColor: `${color}10` }}>{skill.category}</Badge>
          <Badge variant="secondary" className="text-xs bg-white/5 border-white/10 text-[#8b949e]">{skill.difficulty}</Badge>
          <span className="text-xs text-[#8b949e]">{skill.version}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{skill.title}</h1>
        <p className="text-[#8b949e] leading-relaxed mb-4">{skill.subtitle}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-[#8b949e]">
          <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />{skill.rating}/5</span>
          <span className="flex items-center gap-1"><Users className="h-4 w-4" />{skill.usageCount}+ 次使用</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />更新于 {skill.lastUpdated}</span>
        </div>
      </div>

      {/* Prompt copy */}
      <div className="glass-card p-6 mb-8 glow-border">
        <h2 className="text-lg font-semibold text-white mb-4">🚀 一键复制使用</h2>
        <Tabs defaultValue="online">
          <TabsList className="bg-white/5 border border-white/10 mb-4">
            <TabsTrigger value="online" className="data-[state=active]:bg-[#00d4ff]/10 data-[state=active]:text-[#00d4ff] text-[#8b949e]">在线版</TabsTrigger>
            <TabsTrigger value="local" className="data-[state=active]:bg-[#00d4ff]/10 data-[state=active]:text-[#00d4ff] text-[#8b949e]">本地版</TabsTrigger>
          </TabsList>
          <TabsContent value="online">
            <p className="text-xs text-[#8b949e] mb-3">适用于 ChatGPT、Claude、Grok、DeepSeek、Qwen 等在线平台</p>
            <div className="bg-black/40 border border-white/10 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto scrollbar-hide">
              <pre className="text-sm text-[#8b949e] whitespace-pre-wrap font-mono leading-relaxed">{promptOnline}</pre>
            </div>
            <CopyButton text={promptOnline} />
          </TabsContent>
          <TabsContent value="local">
            <p className="text-xs text-[#8b949e] mb-3">适用于 LM Studio、Ollama、llama.cpp 等本地工具</p>
            <div className="bg-black/40 border border-white/10 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto scrollbar-hide">
              <pre className="text-sm text-[#8b949e] whitespace-pre-wrap font-mono leading-relaxed">{promptLocal}</pre>
            </div>
            <CopyButton text={promptLocal} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Variable form */}
      {skill.variables.length > 0 && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">📝 变量填充</h2>
          <p className="text-sm text-[#8b949e] mb-4">填写以下变量，Prompt 将自动更新为你的内容</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {skill.variables.map((v) => (
              <div key={v.name}>
                <label className="text-sm text-white mb-1.5 block">{v.name}{v.required && <span className="text-red-400 ml-1">*</span>}</label>
                <Input placeholder={v.placeholder} value={variableValues[v.name] || ""} onChange={(e) => setVariableValues((prev) => ({ ...prev, [v.name]: e.target.value }))} className="bg-white/5 border-white/10 text-white placeholder:text-[#8b949e]/50" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Before/After */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">📝 实测效果展示</h2>
        <div className="mb-5">
          <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2 font-medium">输入</p>
          <div className="bg-black/40 border border-white/10 rounded-lg p-4 text-sm text-white">{skill.beforeAfter.input}</div>
        </div>
        {skill.beforeAfter.outputs.length > 0 && (
          <div>
            <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-3 font-medium">输出对比</p>
            {skill.beforeAfter.outputs.length > 1 ? (
              <Tabs defaultValue="0">
                <TabsList className="bg-white/5 border border-white/10 mb-3">
                  {skill.beforeAfter.outputs.map((o, i) => (
                    <TabsTrigger key={i} value={String(i)} className="data-[state=active]:bg-[#00d4ff]/10 data-[state=active]:text-[#00d4ff] text-[#8b949e] text-xs">{o.model}</TabsTrigger>
                  ))}
                </TabsList>
                {skill.beforeAfter.outputs.map((o, i) => (
                  <TabsContent key={i} value={String(i)}>
                    <div className="bg-gradient-to-b from-[#00d4ff]/5 to-transparent border border-[#00d4ff]/20 rounded-lg p-4 max-h-96 overflow-y-auto scrollbar-hide">
                      <pre className="text-sm text-[#e6edf3] whitespace-pre-wrap leading-relaxed">{o.text}</pre>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="bg-gradient-to-b from-[#00d4ff]/5 to-transparent border border-[#00d4ff]/20 rounded-lg p-4 max-h-96 overflow-y-auto scrollbar-hide">
                <pre className="text-sm text-[#e6edf3] whitespace-pre-wrap leading-relaxed">{skill.beforeAfter.outputs[0].text}</pre>
              </div>
            )}
          </div>
        )}
        <div className="mt-4 text-xs text-[#8b949e]/60">Temperature：0.7 | 实测效果：语气自然、结构清晰、AI味显著降低</div>
      </div>

      {/* Usage Steps */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">📋 如何使用本技能</h2>
        <Tabs defaultValue="online">
          <TabsList className="bg-white/5 border border-white/10 mb-4">
            <TabsTrigger value="online" className="data-[state=active]:bg-[#00d4ff]/10 data-[state=active]:text-[#00d4ff] text-[#8b949e]">在线平台</TabsTrigger>
            <TabsTrigger value="local" className="data-[state=active]:bg-[#00d4ff]/10 data-[state=active]:text-[#00d4ff] text-[#8b949e]">本地模型</TabsTrigger>
          </TabsList>
          <TabsContent value="online">
            <ol className="space-y-2">
              {skill.usageStepsOnline.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-[#8b949e]">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[#00d4ff]/10 text-[#00d4ff] flex items-center justify-center text-xs font-medium">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </TabsContent>
          <TabsContent value="local">
            <ol className="space-y-2">
              {skill.usageStepsLocal.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-[#8b949e]">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[#00d4ff]/10 text-[#00d4ff] flex items-center justify-center text-xs font-medium">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </TabsContent>
        </Tabs>
      </div>

      {/* Recommended Models */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">🤖 推荐模型（2026年最新适配）</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]" aria-label="推荐模型列表">
            <caption className="sr-only">推荐使用的 AI 模型及其适用场景</caption>
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 pr-4 text-[#8b949e] font-medium">模型</th>
                <th className="text-left py-3 pr-4 text-[#8b949e] font-medium">优势</th>
                <th className="text-left py-3 pr-4 text-[#8b949e] font-medium">适用场景</th>
                <th className="text-left py-3 text-[#8b949e] font-medium">适用人群</th>
              </tr>
            </thead>
            <tbody>
              {skill.recommendedModels.map((model, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  <td className="py-3 pr-4 text-white font-medium">{model.name}</td>
                  <td className="py-3 pr-4 text-[#8b949e]">{model.strengths}</td>
                  <td className="py-3 pr-4 text-[#8b949e]">{model.useCase}</td>
                  <td className="py-3 text-[#8b949e]">{model.audience}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced tips */}
      {skill.advancedTips && skill.advancedTips.length > 0 && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">⚡ 进阶玩法</h2>
          <ul className="space-y-2">
            {skill.advancedTips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#8b949e]"><span className="text-[#00d4ff]">•</span>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mb-12">
        <Button variant="outline" size="sm" className={`border-white/10 ${liked ? "text-[#00d4ff] border-[#00d4ff]/30" : "text-[#8b949e]"} hover:bg-white/5`} onClick={() => setLiked(!liked)} aria-label="点赞">
          <ThumbsUp className={`h-4 w-4 mr-1.5 ${liked ? "fill-current" : ""}`} />{skill.likes + (liked ? 1 : 0)}
        </Button>
        <Button variant="outline" size="sm" className={`border-white/10 ${bookmarked ? "text-yellow-400 border-yellow-400/30" : "text-[#8b949e]"} hover:bg-white/5`} onClick={() => setBookmarked(!bookmarked)} aria-label="收藏">
          <Bookmark className={`h-4 w-4 mr-1.5 ${bookmarked ? "fill-current" : ""}`} />收藏
        </Button>
        <Button variant="outline" size="sm" className="border-white/10 text-[#8b949e] hover:bg-white/5" onClick={handleShare} aria-label="分享">
          <Share2 className="h-4 w-4 mr-1.5" />{shareError ? "复制失败" : "分享"}
        </Button>
      </div>
    </div>
  );
}
