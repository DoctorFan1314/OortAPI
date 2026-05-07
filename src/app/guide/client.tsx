"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Copy, Zap, Globe, Laptop, ArrowRight, Sparkles, Bot, Terminal } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";

export default function GuideClient() {
  const { t } = useI18n();

  const sections = [
    { id: "what-is-hub", label: t.guide.whatIsHub },
    { id: "what-is-prompt", label: t.guide.whatIsPrompt },
    { id: "what-is-agent-skill", label: t.guide.whatIsAgentSkill },
    { id: "online-vs-local", label: t.guide.onlineVsLocal },
    { id: "quick-start", label: t.guide.quickStart },
    { id: "engineering-tips", label: t.guide.engineeringTips },
    { id: "better-results", label: t.guide.betterResults },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
          <BookOpen className="h-3.5 w-3.5" />{t.guide.badge}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.guide.welcome}</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t.guide.subtitle}</p>
      </div>

      {/* Table of Contents */}
      <nav className="glass-card p-6 mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t.guide.quickStart}</h2>
        <ol className="space-y-1.5">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-sm text-primary hover:underline">
                {i + 1}. {s.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <section id="what-is-hub" className="glass-card p-8 mb-8 scroll-mt-20">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />{t.guide.whatIsHub}
        </h2>
        <div className="text-muted-foreground space-y-3 leading-relaxed">
          <p>{t.guide.hubDesc}</p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-secondary/30 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2"><Bot className="h-4 w-4 text-primary" /><h3 className="font-semibold text-foreground">{t.guide.agentSkillsLabel}</h3></div>
              <p className="text-sm">{t.guide.agentSkillsDesc}</p>
            </div>
            <div className="bg-secondary/30 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2"><Copy className="h-4 w-4 text-purple-400" /><h3 className="font-semibold text-foreground">{t.guide.promptTemplatesLabel}</h3></div>
              <p className="text-sm">{t.guide.promptTemplatesDesc}</p>
            </div>
          </div>
          <p>{t.guide.noExpertiseDesc}</p>
        </div>
      </section>

      <section id="what-is-prompt" className="glass-card p-8 mb-8 scroll-mt-20">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Copy className="h-5 w-5 text-primary" />{t.guide.whatIsPrompt}
        </h2>
        <div className="text-muted-foreground space-y-3 leading-relaxed">
          <p>{t.guide.promptDesc}</p>
          <p>{t.guide.promptDesc2}</p>
          <div className="bg-secondary border border-border rounded-lg p-4 mt-4">
            <p className="text-xs text-muted-foreground/60 mb-2">{t.guide.example}</p>
            <p className="text-sm text-foreground">{t.guide.promptExample}<strong className="text-primary">{t.guide.promptExampleTopic}</strong>&rdquo;</p>
            <p className="text-xs text-muted-foreground/60 mt-2">{t.guide.variableNote}</p>
          </div>
        </div>
      </section>

      <section id="what-is-agent-skill" className="glass-card p-8 mb-8 scroll-mt-20">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />{t.guide.whatIsAgentSkill}
        </h2>
        <div className="text-muted-foreground space-y-3 leading-relaxed">
          <p>{t.guide.agentSkillDesc1}</p>
          <p>{t.guide.agentSkillDesc2}</p>
          <div className="bg-secondary border border-border rounded-lg p-4 mt-4">
            <p className="text-xs text-muted-foreground/60 mb-2">{t.guide.installExample}</p>
            <p className="text-sm text-foreground font-mono">npx skills install web-scraper</p>
            <p className="text-xs text-muted-foreground/60 mt-2">{t.guide.installNote}</p>
          </div>
        </div>
      </section>

      <section id="online-vs-local" className="glass-card p-8 mb-8 scroll-mt-20">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />{t.guide.onlineVsLocal}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-secondary/30 border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3"><Globe className="h-5 w-5 text-primary" /><h3 className="font-semibold text-foreground">{t.guide.onlineTitle}</h3></div>
            <p className="text-sm text-muted-foreground mb-3">{t.guide.onlineDesc}</p>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex gap-2"><span className="text-green-400">+</span> {t.guide.onlinePro1}</li>
              <li className="flex gap-2"><span className="text-green-400">+</span> {t.guide.onlinePro2}</li>
              <li className="flex gap-2"><span className="text-yellow-400">-</span> {t.guide.onlineCon}</li>
            </ul>
          </div>
          <div className="bg-secondary/30 border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3"><Laptop className="h-5 w-5 text-purple-400" /><h3 className="font-semibold text-foreground">{t.guide.localTitle}</h3></div>
            <p className="text-sm text-muted-foreground mb-3">{t.guide.localDesc}</p>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex gap-2"><span className="text-green-400">+</span> {t.guide.localPro}</li>
              <li className="flex gap-2"><span className="text-yellow-400">-</span> {t.guide.localCon}</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="quick-start" className="glass-card p-8 mb-8 scroll-mt-20">
        <h2 className="text-xl font-bold text-foreground mb-6">{t.guide.quickStart}</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Bot className="h-4 w-4 text-primary" />{t.guide.useAgentSkill}</h3>
            <div className="space-y-4">
              {[
                { step: 1, title: t.guide.browseMarket, desc: t.guide.browseMarketDesc },
                { step: 2, title: t.guide.oneClickInstall, desc: t.guide.oneClickInstallDesc },
                { step: 3, title: t.guide.startUsing, desc: t.guide.startUsingDesc },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">{item.step}</div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm mb-0.5">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Copy className="h-4 w-4 text-purple-400" />{t.guide.usePromptTemplate}</h3>
            <div className="space-y-4">
              {[
                { step: 1, title: t.guide.selectTemplate, desc: t.guide.selectTemplateDesc },
                { step: 2, title: t.guide.fillVariables, desc: t.guide.fillVariablesDesc },
                { step: 3, title: t.guide.pasteAndUse, desc: t.guide.pasteAndUseDesc },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">{item.step}</div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm mb-0.5">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="engineering-tips" className="glass-card p-8 mb-8 scroll-mt-20">
        <h2 className="text-xl font-bold text-foreground mb-6">{t.guide.engineeringTips}</h2>
        <p className="text-muted-foreground mb-6">{t.guide.engineeringTipsDesc}</p>
        <div className="space-y-6">
          <div className="bg-secondary/30 border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-2">{t.guide.cotTitle}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.guide.cotDesc}</p>
            <div className="bg-secondary border border-border rounded-lg p-3">
              <p className="text-xs text-muted-foreground/60 mb-1">{t.guide.example}</p>
              <p className="text-sm text-foreground font-mono">{t.guide.cotExample}</p>
            </div>
          </div>
          <div className="bg-secondary/30 border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-2">{t.guide.fewShotTitle}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.guide.fewShotDesc}</p>
            <div className="bg-secondary border border-border rounded-lg p-3">
              <p className="text-xs text-muted-foreground/60 mb-1">{t.guide.example}</p>
              <p className="text-sm text-foreground font-mono">{t.guide.fewShotExample}</p>
            </div>
          </div>
          <div className="bg-secondary/30 border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-2">{t.guide.roleTitle}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.guide.roleDesc}</p>
            <div className="bg-secondary border border-border rounded-lg p-3">
              <p className="text-xs text-muted-foreground/60 mb-1">{t.guide.example}</p>
              <p className="text-sm text-foreground font-mono">{t.guide.roleExample}</p>
            </div>
          </div>
          <div className="bg-secondary/30 border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-2">{t.guide.structuredTitle}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.guide.structuredDesc}</p>
            <div className="bg-secondary border border-border rounded-lg p-3">
              <p className="text-xs text-muted-foreground/60 mb-1">{t.guide.example}</p>
              <p className="text-sm text-foreground font-mono">{t.guide.structuredExample}</p>
            </div>
          </div>
          <div className="bg-secondary/30 border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-2">{t.guide.selfCritiqueTitle}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.guide.selfCritiqueDesc}</p>
            <div className="bg-secondary border border-border rounded-lg p-3">
              <p className="text-xs text-muted-foreground/60 mb-1">{t.guide.example}</p>
              <p className="text-sm text-foreground font-mono">{t.guide.selfCritiqueExample}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="better-results" className="glass-card p-8 mb-8 scroll-mt-20">
        <h2 className="text-xl font-bold text-foreground mb-6">{t.guide.betterResults}</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="bg-secondary/30 border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-2">{t.guide.specificVsVague}</h3>
            <p className="text-xs text-muted-foreground/60 mb-2">{t.guide.vagueLabel}</p>
            <p className="text-sm text-muted-foreground mb-2">{t.guide.vagueExample}</p>
            <p className="text-xs text-muted-foreground/60 mb-2">{t.guide.betterLabel}</p>
            <p className="text-sm text-muted-foreground">{t.guide.betterExample1}</p>
          </div>
          <div className="bg-secondary/30 border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-2">{t.guide.specifyFormat}</h3>
            <p className="text-xs text-muted-foreground/60 mb-2">{t.guide.vagueFormatLabel}</p>
            <p className="text-sm text-muted-foreground mb-2">{t.guide.vagueFormatExample}</p>
            <p className="text-xs text-muted-foreground/60 mb-2">{t.guide.betterFormatLabel}</p>
            <p className="text-sm text-muted-foreground">{t.guide.betterFormatExample}</p>
          </div>
          <div className="bg-secondary/30 border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-2">{t.guide.iterate}</h3>
            <p className="text-sm text-muted-foreground">{t.guide.iterateDesc}</p>
          </div>
          <div className="bg-secondary/30 border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-2">{t.guide.provideContext}</h3>
            <p className="text-sm text-muted-foreground">{t.guide.provideContextDesc}</p>
          </div>
        </div>
      </section>

      <div className="text-center">
        <p className="text-muted-foreground mb-4">{t.guide.readyToStart}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/skills">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 h-12 text-base">
              <Zap className="h-4 w-4 mr-2" />{t.guide.browseAgentSkills} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/prompts">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary px-8 h-12 text-base">
              <Copy className="h-4 w-4 mr-2" />{t.guide.browsePromptTemplates} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
