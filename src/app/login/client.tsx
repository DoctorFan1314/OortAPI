"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useI18n } from "@/contexts/i18n-context";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useI18n();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError(t.auth.fillAllFields);
      return;
    }
    const ok = await login(email, password);
    if (!ok) {
      setError(t.auth.emailOrPasswordError);
      return;
    }
    toast(t.auth.loginSuccess, "success");
    router.push("/");
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
              <Input id="email" type="email" autoComplete="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm text-foreground">{t.auth.password}</label>
                <span className="text-xs text-muted-foreground/40 cursor-default" title="Coming soon">{t.auth.forgotPassword}</span>
              </div>
              <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium h-11">{t.auth.loginNow}</Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-3 bg-card text-muted-foreground">{t.common.or}</span></div>
          </div>
          <div className="space-y-3">
            <Button variant="outline" type="button" onClick={() => toast(t.auth.oauthComingSoon)} className="w-full border-border text-foreground hover:bg-secondary">{t.auth.loginWithGoogle}</Button>
            <Button variant="outline" type="button" onClick={() => toast(t.auth.oauthComingSoon)} className="w-full border-border text-foreground hover:bg-secondary">{t.auth.loginWithGithub}</Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t.auth.noAccount} <Link href="/register" className="text-primary hover:underline">{t.auth.registerNow}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
