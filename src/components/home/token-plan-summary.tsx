"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Coins, Route, ArrowRight } from "lucide-react";

export function TokenPlanSummary({ lang = "zh" }: { lang?: "zh" | "en" }) {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">
          {lang === "zh" ? "Token Plan 订阅方案" : "Token Plan Subscriptions"}
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-10">
          {lang === "zh"
            ? "从个人到团队，按需选择，灵活升级"
            : "From individual to team — choose what fits, upgrade anytime"}
        </p>

        <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-10">
          <div className="glass-card p-6 rounded-xl">
            <Coins className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-1">{lang === "zh" ? "每月额度" : "Monthly Credits"}</h3>
            <p className="text-sm text-muted-foreground">
              {lang === "zh" ? "多种额度档位，按需订阅" : "Multiple tiers to fit your usage"}
            </p>
          </div>
          <div className="glass-card p-6 rounded-xl border-primary/30">
            <Route className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-1">{lang === "zh" ? "灵活升级" : "Flexible Upgrades"}</h3>
            <p className="text-sm text-muted-foreground">
              {lang === "zh" ? "随时升级/降级，按比例折算" : "Upgrade or downgrade with prorated pricing"}
            </p>
          </div>
          <div className="glass-card p-6 rounded-xl">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-1">{lang === "zh" ? "所有模型可用" : "All Models"}</h3>
            <p className="text-sm text-muted-foreground">
              {lang === "zh" ? "订阅后可用平台所有模型" : "Access all models on the platform"}
            </p>
          </div>
        </div>

        <Link href="/token-plan">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
            {lang === "zh" ? "查看套餐详情" : "View Plans"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
