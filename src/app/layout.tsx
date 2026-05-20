import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/contexts/toast-context";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { I18nProvider } from "@/contexts/i18n-context";
import { CurrencyProvider } from "@/contexts/currency-context";
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

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OortAPI — Unified AI API Gateway",
    template: "%s | OortAPI",
  },
  description: "One API endpoint for all AI models. OpenAI-compatible format, smart routing, fine-grained billing. Connect OpenAI, Anthropic, Gemini, DeepSeek and 30+ providers.",
  icons: { icon: "/icon", apple: "/apple-icon" },
  openGraph: {
    title: "OortAPI — Unified AI API Gateway",
    description: "One API endpoint for all AI models. OpenAI-compatible format, smart routing, fine-grained billing.",
    url: siteUrl,
    siteName: "OortAPI",
    type: "website",
    locale: "en_US",
    alternateLocale: "zh_CN",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "OortAPI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OortAPI — Unified AI API Gateway",
    description: "One API endpoint for all AI models. OpenAI-compatible format, smart routing, fine-grained billing.",
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
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('oortapi-theme')||'dark';var d=t==='system'?matchMedia('(prefers-color-scheme:dark)').matches:t==='dark';if(d)document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){document.documentElement.classList.add('dark');}})()`,
          }}
        />
        <Script
          id="lang-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('oortapi-language');if(l==='en')document.documentElement.lang='en-US';else if(l==='zh')document.documentElement.lang='zh-CN';}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background">
        {/* ===== Background Layer System ===== */}
        {/* 1. Ambient glow — top-left blue, bottom-right purple */}
        <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] pointer-events-none -z-10" aria-hidden="true" style={{ background: "radial-gradient(ellipse at center, var(--glow-blue) 0%, transparent 70%)" }} />
        <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] pointer-events-none -z-10" aria-hidden="true" style={{ background: "radial-gradient(ellipse at center, var(--glow-purple) 0%, transparent 70%)" }} />
        {/* 2. Subtle grid lines — dark uses white, light uses black */}
        <div className="fixed inset-0 pointer-events-none -z-10 dark:opacity-100 opacity-[0.4]" aria-hidden="true" style={{ backgroundImage: "linear-gradient(rgba(128,128,128,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <ToastProvider>
          <ThemeProvider>
            <I18nProvider>
              <CurrencyProvider>
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
              </CurrencyProvider>
            </I18nProvider>
          </ThemeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
