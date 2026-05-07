"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useI18n } from "@/contexts/i18n-context";

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
  const { t } = useI18n();

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
    const ok = await register(username, email, password);
    setLoading(false);
    if (!ok) {
      setError(t.auth.emailExists);
      return;
    }
    toast(t.auth.registerSuccess, "success");
    router.push("/");
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
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-sm text-foreground mb-1.5 block">{t.auth.confirmPassword}</label>
              <Input id="confirmPassword" type="password" autoComplete="new-password" placeholder={t.auth.confirmPasswordPlaceholder} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
            </div>
            {error && <p role="alert" className="text-sm text-red-400 text-center">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium h-11">{loading ? "..." : t.auth.registerNow}</Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-3 bg-card text-muted-foreground">{t.common.or}</span></div>
          </div>
          <div className="space-y-3">
            <Button variant="outline" type="button" onClick={() => toast(t.auth.oauthRegisterComingSoon)} className="w-full border-border text-foreground hover:bg-secondary">{t.auth.registerWithGoogle}</Button>
            <Button variant="outline" type="button" onClick={() => toast(t.auth.oauthRegisterComingSoon)} className="w-full border-border text-foreground hover:bg-secondary">{t.auth.registerWithGithub}</Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t.auth.hasAccount} <Link href="/login" className="text-primary hover:underline">{t.auth.loginNow}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
