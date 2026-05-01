import type { Metadata } from "next";
import RegisterClient from "./client";

export const metadata: Metadata = {
  title: "注册 — AI Skills Hub",
  description: "创建 AI Skills Hub 账号，解锁全部高质量 LLM 技能模板",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
