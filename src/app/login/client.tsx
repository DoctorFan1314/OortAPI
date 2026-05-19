"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useI18n } from "@/contexts/i18n-context";
import { Loader2 } from "lucide-react";

function safeReturnUrl(url: string | null): string {
  if (!url || !url.startsWith("/") || url.includes("://")) return "/";
  return url;
}

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useI18n();

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = lang === "zh" ? "请输入邮箱" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = lang === "zh" ? "邮箱格式不正确" : "Invalid email format";
    }
    if (!password) {
      errors.password = lang === "zh" ? "请输入密码" : "Password is required";
    } else if (password.length < 8) {
      errors.password = lang === "zh" ? "密码至少 8 个字符" : "Password must be at least 8 characters";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    const result = await login(email, password, rememberMe);
    setLoading(false);
    if (!result.success) {
      setError(result.error || t.auth.emailOrPasswordError);
      return;
    }
    toast(t.auth.loginSuccess, "success");
    const returnUrl = searchParams.get("returnUrl");
    router.push(safeReturnUrl(returnUrl));
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">{t.auth.loginTitle}</h1>
          <p className="text-muted-foreground">{t.auth.welcomeBack}</p>
        </div>
        <div className="glass-card p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="text-sm text-foreground mb-1.5 block">{t.auth.email}</label>
              <Input id="email" type="email" autoComplete="email" placeholder="your@email.com" value={email} onChange={(e) => { setEmail(e.target.value); setFieldErrors(e => ({ ...e, email: undefined })); }} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" autoFocus />
              {fieldErrors.email && <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="text-sm text-foreground mb-1.5 block">{t.auth.password}</label>
              <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); setFieldErrors(e => ({ ...e, password: undefined })); }} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
              {fieldErrors.password && <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>}
              <div className="flex justify-end mt-1">
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">{t.auth.forgotPassword}</Link>
              </div>
            </div>
            {error && <p role="alert" className="text-sm text-red-400 text-center">{error}</p>}
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="rounded" />
              {lang === "zh" ? "记住我" : "Remember me"}
            </label>
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium h-11">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.loginNow}</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t.auth.noAccount} <Link href="/register" className="text-primary hover:underline">{t.auth.registerNow}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
