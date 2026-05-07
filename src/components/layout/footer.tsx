"use client";

import Link from "next/link";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { useI18n } from "@/contexts/i18n-context";

interface FooterLink {
  label: string;
  href: string;
  disabled?: boolean;
}

export function Footer() {
  const { t } = useI18n();

  const footerLinks: Record<string, FooterLink[]> = {
    [t.common.skills]: [
      { label: t.common.skills, href: "/skills" },
      { label: t.common.prompts, href: "/prompts" },
    ],
    [t.footer.browse || "Browse"]: [
      { label: t.common.categories, href: "/categories" },
      { label: t.common.trending, href: "/trending" },
      { label: t.common.tags, href: "/tags" },
    ],
    [t.footer.resources]: [
      { label: t.common.guide, href: "/guide" },
      { label: t.common.submit, href: "/submit" },
      { label: t.footer.changelog, href: "#", disabled: true },
      { label: t.footer.api, href: "#", disabled: true },
    ],
    [t.footer.community]: [
      { label: t.footer.github, href: "#", disabled: true },
      { label: t.footer.discord, href: "#", disabled: true },
      { label: t.footer.twitter, href: "#", disabled: true },
    ],
  };

  return (
    <footer className="border-t border-border bg-background/60 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
                <span className="text-sm font-bold text-primary">AI</span>
              </div>
              <span className="text-lg font-semibold text-foreground">AI Skills Hub</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {t.footer.description}
            </p>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">{t.footer.newsletter}</h3>
              <NewsletterForm />
            </div>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.disabled ? (
                      <span className="text-sm text-muted-foreground/40 cursor-default" title="Coming soon">{link.label}</span>
                    ) : (
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">{t.footer.copyright}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{t.footer.platforms}:</span>
            <span>ChatGPT</span><span>·</span>
            <span>Claude</span><span>·</span>
            <span>Grok</span><span>·</span>
            <span>DeepSeek</span><span>·</span>
            <span>Qwen</span>
          </div>
        </div>
        <p className="mt-4 text-[10px] text-muted-foreground/40 text-center leading-relaxed">
          {t.footer.trademarkDisclaimer}
        </p>
      </div>
    </footer>
  );
}
