import type { Metadata } from "next";
import SubmitClient from "./client";

export const metadata: Metadata = {
  title: "提交模板 — AI Skills Hub",
  description: "分享你的优质 Prompt 模板，帮助更多人高效使用 AI",
};

export default function SubmitPage() {
  return <SubmitClient />;
}
