"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterClient() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">免费注册</h1>
          <p className="text-[#8b949e]">创建账号，解锁全部 AI 技能模板</p>
        </div>
        <div className="glass-card p-8">
          <form className="space-y-5">
            <div>
              <label htmlFor="username" className="text-sm text-white mb-1.5 block">用户名</label>
              <Input id="username" autoComplete="username" placeholder="你的用户名" className="bg-white/5 border-white/10 text-white placeholder:text-[#8b949e]/50" />
            </div>
            <div>
              <label htmlFor="email" className="text-sm text-white mb-1.5 block">邮箱</label>
              <Input id="email" type="email" autoComplete="email" placeholder="your@email.com" className="bg-white/5 border-white/10 text-white placeholder:text-[#8b949e]/50" />
            </div>
            <div>
              <label htmlFor="password" className="text-sm text-white mb-1.5 block">密码</label>
              <Input id="password" type="password" autoComplete="new-password" placeholder="至少 8 位字符" className="bg-white/5 border-white/10 text-white placeholder:text-[#8b949e]/50" />
            </div>
            <Button type="submit" className="w-full bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90 font-medium h-11">注册</Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-3 bg-[#0d1117] text-[#8b949e]">或</span></div>
          </div>
          <div className="space-y-3">
            <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">使用 Google 注册</Button>
            <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">使用 GitHub 注册</Button>
          </div>
          <p className="text-center text-sm text-[#8b949e] mt-6">
            已有账号？ <Link href="/login" className="text-[#00d4ff] hover:underline">登录</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
