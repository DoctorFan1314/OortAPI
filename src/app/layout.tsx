import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/contexts/toast-context";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { I18nProvider } from "@/contexts/i18n-context";
import { Toaster } from "@/components/ui/toast";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { HtmlLangUpdater } from "@/components/shared/html-lang-updater";

import { CommandPalette } from "@/components/shared/command-palette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-skills-hub.vercel.app"),
  title: "AI Skills Hub — 高质量LLM技能模板库",
  description: "高质量LLM技能模板，覆盖内容创作、编程开发、数据分析、效率工具、创意写作、思考工作流六大领域。复制即用，去AI味。完美适配 ChatGPT · Claude · Grok · DeepSeek · Qwen 等主流平台。",
  icons: { icon: "/icon", apple: "/apple-icon" },
  openGraph: {
    title: "AI Skills Hub — 高质量LLM技能模板库",
    description: "高质量LLM技能模板，覆盖内容创作、编程开发、数据分析、效率工具、创意写作、思考工作流六大领域。",
    url: "https://ai-skills-hub.vercel.app",
    siteName: "AI Skills Hub",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Skills Hub — 高质量LLM技能模板库",
    description: "高质量LLM技能模板，覆盖内容创作、编程开发、数据分析、效率工具、创意写作、思考工作流六大领域。",
  },
  alternates: {
    canonical: "https://ai-skills-hub.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ai-skills-hub-theme')||'dark';var d=t==='system'?matchMedia('(prefers-color-scheme:dark)').matches:t==='dark';if(d)document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){document.documentElement.classList.add('dark');}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <ThemeProvider>
            <I18nProvider>
              <AuthProvider>
                <HtmlLangUpdater />
                <Navbar />
                <main className="flex-1 relative z-10">{children}</main>
                <Footer />
                <Toaster />
                <CommandPalette />
                <ScrollToTop />
              </AuthProvider>
            </I18nProvider>
          </ThemeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
