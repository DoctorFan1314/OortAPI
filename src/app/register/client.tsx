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
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useI18n();

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
    if (!username.trim() || !email.trim() || !password) {
      setError(t.auth.fillAllFields);
      return;
    }
    if (password.length < 8) {
      setError(t.auth.passwordMinLength);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }
    if (!email.includes("@")) {
      setError(t.auth.emailInvalid);
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
              <Input id="username" autoComplete="username" placeholder={t.auth.usernamePlaceholder} value={username} onChange={(e) => setUsername(e.target.value)} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
            </div>
            <div>
              <label htmlFor="email" className="text-sm text-foreground mb-1.5 block">{t.auth.email}</label>
              <Input id="email" type="email" autoComplete="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
            </div>
            <div>
              <label htmlFor="password" className="text-sm text-foreground mb-1.5 block">{t.auth.password}</label>
              <Input id="password" type="password" autoComplete="new-password" placeholder={t.auth.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
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
              <Input id="confirmPassword" type="password" autoComplete="new-password" placeholder={t.auth.confirmPasswordPlaceholder} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
            </div>
            {error && <p role="alert" className="text-sm text-red-400 text-center">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium h-11">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.registerNow}</Button>
          </form>
          {/* OAuth buttons removed — not yet available */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t.auth.hasAccount} <Link href="/login" className="text-primary hover:underline">{t.auth.loginNow}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
