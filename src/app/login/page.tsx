import type { Metadata } from "next";
import LoginClient from "./client";

export const metadata: Metadata = {
  title: "登录 — AI Skills Hub",
  description: "登录你的 AI Skills Hub 账号，继续探索高质量 LLM 技能模板",
};

export default function LoginPage() {
  return <LoginClient />;
}
