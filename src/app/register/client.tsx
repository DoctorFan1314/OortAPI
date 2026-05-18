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

export default function RegisterClient() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useI18n();

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    if (!username.trim()) {
      errors.username = lang === "zh" ? "请输入用户名" : "Username is required";
    }
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
    if (!confirmPassword) {
      errors.confirmPassword = lang === "zh" ? "请确认密码" : "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = lang === "zh" ? "两次密码不一致" : "Passwords do not match";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: t.common.passwordWeak, color: "bg-red-500" };
    if (score === 2) return { score, label: t.common.passwordFair, color: "bg-orange-500" };
    if (score === 3) return { score, label: t.common.passwordGood, color: "bg-yellow-500" };
    if (score === 4) return { score, label: t.common.passwordStrong, color: "bg-blue-500" };
    return { score, label: t.common.passwordVeryStrong, color: "bg-green-500" };
  }

  const passwordStrength = password ? getPasswordStrength(password) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }
    setLoading(true);
    const result = await register(username, email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || t.auth.emailExists);
      return;
    }
    toast(t.auth.registerSuccess, "success");
    const returnUrl = searchParams.get("returnUrl");
    router.push(safeReturnUrl(returnUrl));
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">{t.auth.registerTitle}</h1>
          <p className="text-muted-foreground">{t.auth.createAccountDesc}</p>
        </div>
        <div className="glass-card p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="text-sm text-foreground mb-1.5 block">{t.auth.username}</label>
              <Input id="username" autoComplete="username" placeholder={t.auth.usernamePlaceholder} value={username} onChange={(e) => { setUsername(e.target.value); setFieldErrors(f => ({ ...f, username: undefined })); }} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
              {fieldErrors.username && <p className="text-xs text-red-400 mt-1">{fieldErrors.username}</p>}
            </div>
            <div>
              <label htmlFor="email" className="text-sm text-foreground mb-1.5 block">{t.auth.email}</label>
              <Input id="email" type="email" autoComplete="email" placeholder="your@email.com" value={email} onChange={(e) => { setEmail(e.target.value); setFieldErrors(f => ({ ...f, email: undefined })); }} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
              {fieldErrors.email && <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="text-sm text-foreground mb-1.5 block">{t.auth.password}</label>
              <Input id="password" type="password" autoComplete="new-password" placeholder={t.auth.passwordPlaceholder} value={password} onChange={(e) => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: undefined })); }} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
              {fieldErrors.password && <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>}
              <p className="mt-1 text-xs text-muted-foreground">{lang === "zh" ? "至少 8 个字符" : "At least 8 characters"}</p>
              {passwordStrength && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= passwordStrength.score ? passwordStrength.color : "bg-secondary"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength.score <= 1 ? "text-red-400" : passwordStrength.score === 2 ? "text-orange-400" : passwordStrength.score === 3 ? "text-yellow-400" : passwordStrength.score === 4 ? "text-blue-400" : "text-green-400"}`}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-sm text-foreground mb-1.5 block">{t.auth.confirmPassword}</label>
              <Input id="confirmPassword" type="password" autoComplete="new-password" placeholder={t.auth.confirmPasswordPlaceholder} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(f => ({ ...f, confirmPassword: undefined })); }} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
              {fieldErrors.confirmPassword && <p className="text-xs text-red-400 mt-1">{fieldErrors.confirmPassword}</p>}
            </div>
            {error && <p role="alert" className="text-sm text-red-400 text-center">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium h-11">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.registerNow}</Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-3">
            {lang === "zh" ? "更多登录方式即将上线" : "More sign-in options coming soon"}
          </p>
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t.auth.hasAccount} <Link href="/login" className="text-primary hover:underline">{t.auth.loginNow}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
