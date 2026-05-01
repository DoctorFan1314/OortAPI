"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, CheckCircle } from "lucide-react";

const categoryOptions = ["语言与内容生产", "编程与技术任务", "思考与工作流"];

export default function SubmitClient() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <CheckCircle className="h-16 w-16 text-[#00d4ff] mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white mb-3">提交成功！</h1>
        <p className="text-[#8b949e] mb-6">感谢你的贡献！我们的团队将在 3-5 个工作日内审核你的模板。</p>
        <Button onClick={() => setSubmitted(false)} variant="outline" className="border-white/10 text-white hover:bg-white/5">继续提交</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">提交模板</h1>
        <p className="text-[#8b949e]">分享你的优质 Prompt 模板，帮助更多人高效使用 AI</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">基本信息</h2>
          <div>
            <label htmlFor="name" className="text-sm text-white mb-1.5 block">模板名称 <span className="text-red-400">*</span></label>
            <Input id="name" required placeholder="例如：小红书爆款笔记生成器 v2.0" className="bg-white/5 border-white/10 text-white placeholder:text-[#8b949e]/50" />
          </div>
          <div>
            <label htmlFor="short-desc" className="text-sm text-white mb-1.5 block">一句话描述 <span className="text-red-400">*</span></label>
            <Input id="short-desc" required placeholder="简要说明这个模板能做什么" className="bg-white/5 border-white/10 text-white placeholder:text-[#8b949e]/50" />
          </div>
          <div>
            <span className="text-sm text-white mb-2 block">分类 <span className="text-red-400">*</span></span>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 text-sm rounded-md border transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/30"
                      : "bg-white/5 text-[#8b949e] border-white/10 hover:border-[#00d4ff]/30 hover:text-[#00d4ff] hover:bg-[#00d4ff]/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Prompt 内容</h2>
          <div>
            <label htmlFor="prompt-online" className="text-sm text-white mb-1.5 block">在线版 Prompt <span className="text-red-400">*</span></label>
            <Textarea id="prompt-online" required rows={8} placeholder="粘贴你的在线版 Prompt..." className="bg-white/5 border-white/10 text-white placeholder:text-[#8b949e]/50 font-mono text-sm" />
          </div>
          <div>
            <label htmlFor="prompt-local" className="text-sm text-white mb-1.5 block">本地版 Prompt</label>
            <Textarea id="prompt-local" rows={6} placeholder="粘贴本地版 Prompt（可选）..." className="bg-white/5 border-white/10 text-white placeholder:text-[#8b949e]/50 font-mono text-sm" />
          </div>
          <div>
            <label htmlFor="usage" className="text-sm text-white mb-1.5 block">使用说明 <span className="text-red-400">*</span></label>
            <Textarea id="usage" required rows={4} placeholder="详细说明如何使用这个模板..." className="bg-white/5 border-white/10 text-white placeholder:text-[#8b949e]/50 text-sm" />
          </div>
        </div>
        <Button type="submit" className="w-full bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90 font-medium h-12 text-base">
          <Send className="h-4 w-4 mr-2" />提交模板
        </Button>
      </form>
    </div>
  );
}
