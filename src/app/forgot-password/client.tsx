"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/toast-context";
import { useI18n } from "@/contexts/i18n-context";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { t, lang } = useI18n();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError(t.auth.fillAllFields);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "An error occurred");
        return;
      }

      setSubmitted(true);
      toast(
        lang === "zh"
          ? "如果该邮箱已注册，重置链接已生成"
          : "If this email is registered, a reset link has been generated",
        "success"
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">{t.auth.resetPassword}</h1>
          <p className="text-muted-foreground">{t.auth.resetPasswordDesc}</p>
        </div>
        <div className="glass-card p-8">
          {!submitted ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="text-sm text-foreground mb-1.5 block">{t.auth.email}</label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
              {error && <p role="alert" className="text-sm text-red-400 text-center">{error}</p>}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium h-11"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.resetPassword}
              </Button>
            </form>
          ) : (
            <div className="space-y-5 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-400" />
              </div>
              <p className="text-foreground">
                {lang === "zh"
                  ? "如果该邮箱已注册，重置链接已生成"
                  : "If this email is registered, a reset link has been generated"}
              </p>
              <p className="text-sm text-muted-foreground">
                {lang === "zh"
                  ? "请前往重置密码页面，输入你的邮箱和令牌来设置新密码"
                  : "Go to the reset password page, enter your email and token to set a new password"}
              </p>
              <Link
                href="/login"
                className="block text-sm text-primary hover:underline"
              >
                {lang === "zh" ? "返回登录" : "Back to login"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
