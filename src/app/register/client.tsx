"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useI18n } from "@/contexts/i18n-context";
import { Loader2, Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useI18n();

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    if (!username.trim()) {
      errors.username = t.auth.usernameRequired;
    }
    if (!email.trim()) {
      errors.email = t.auth.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = t.auth.emailInvalid;
    }
    if (!password) {
      errors.password = t.auth.passwordRequired;
    } else if (password.length < 8) {
      errors.password = t.auth.passwordMinLength;
    }
    if (!confirmPassword) {
      errors.confirmPassword = t.auth.confirmPasswordRequired;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t.auth.passwordMismatch;
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
    setShowCelebration(true);
    setTimeout(() => router.push(safeReturnUrl(returnUrl)), 1200);
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo-icon.svg" alt="OortAPI" className="h-28 w-28 mx-auto mb-4" />
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
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder={t.auth.passwordPlaceholder} value={password} onChange={(e) => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: undefined })); }} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPassword ? (lang === "zh" ? "隐藏密码" : "Hide password") : (lang === "zh" ? "显示密码" : "Show password")} tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
              <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" placeholder={t.auth.confirmPasswordPlaceholder} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(f => ({ ...f, confirmPassword: undefined })); }} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 pr-10" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={showConfirmPassword ? (lang === "zh" ? "隐藏密码" : "Hide password") : (lang === "zh" ? "显示密码" : "Show password")} tabIndex={-1}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="text-xs text-red-400 mt-1">{fieldErrors.confirmPassword}</p>}
            </div>
            {error && <p role="alert" className="text-sm text-red-400 text-center">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium h-11">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.registerNow}</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t.auth.hasAccount} <Link href="/login" className="text-primary hover:underline">{t.auth.loginNow}</Link>
          </p>
        </div>
      </div>
      {/* Celebration overlay on successful registration */}
      {showCelebration && (
        <div className="fixed inset-0 z-[150] pointer-events-none flex items-center justify-center">
          <div className="text-center animate-page-fade-in">
            <div className="text-6xl mb-4 animate-bounce-in">🎉</div>
            <p className="text-lg font-semibold text-foreground">Welcome aboard! 🚀</p>
          </div>
          <div className="fixed inset-0 pointer-events-none">
            <style>{`
              @keyframes cf-0 { 0%{transform:translateY(-10vh) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
              @keyframes cf-1 { 0%{transform:translateY(-10vh) rotate(0deg);opacity:1} 100%{transform:translateY(105vh) rotate(540deg);opacity:0} }
              @keyframes cf-2 { 0%{transform:translateY(-10vh) rotate(0deg);opacity:1} 100%{transform:translateY(115vh) rotate(900deg);opacity:0} }
            `}</style>
            {['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#a855f7','#f97316'].map((c,i) => (
              <div key={i} style={{
                position:'fixed', top:'-10px', left:`${8 + i * 15}%`,
                width:i%2===0?'8px':'6px', height:i%2===0?'8px':'10px',
                background:c, borderRadius:i%2===0?'50%':'2px',
                animation:`cf-${i%3} ${1.5 + i*0.1}s ease-in ${i*0.12}s forwards`
              }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
