import type { Metadata, Viewport } from "next";
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
import { getSiteUrl } from "@/lib/site-url";

import { CommandPalette } from "@/components/shared/command-palette";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI Skills Hub — Agent Skills Marketplace + Prompt Templates",
    template: "%s | AI Skills Hub",
  },
  description: "Discover executable Agent Skills and high-quality Prompt Templates. One-click install, works with ChatGPT, Claude, Grok, DeepSeek, Qwen, LM Studio, Ollama.",
  icons: { icon: "/icon", apple: "/apple-icon" },
  openGraph: {
    title: "AI Skills Hub — Agent Skills Marketplace + Prompt Templates",
    description: "Discover executable Agent Skills and high-quality Prompt Templates. One-click install.",
    url: siteUrl,
    siteName: "AI Skills Hub",
    type: "website",
    locale: "en_US",
    alternateLocale: "zh_CN",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "AI Skills Hub" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Skills Hub — Agent Skills Marketplace + Prompt Templates",
    description: "Discover executable Agent Skills and high-quality Prompt Templates. One-click install, works with ChatGPT, Claude, Grok, DeepSeek, Qwen.",
    images: ["/og.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN" /* Default; the lang-init script updates this at runtime based on user preference */
      suppressHydrationWarning
      data-scroll-behavior="smooth"
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
        <Script
          id="lang-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('ai-skills-hub-language');if(l==='en')document.documentElement.lang='en-US';else if(l==='zh')document.documentElement.lang='zh-CN';}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <ThemeProvider>
            <I18nProvider>
              <AuthProvider>
                <HtmlLangUpdater />
                <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:text-sm">
                  Skip to main content
                </a>
                <Navbar />
                <main id="main-content" className="flex-1 relative z-10">{children}</main>
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
