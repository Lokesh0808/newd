"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const PLANS = {
  free: {
    name: "Free",
    tagline: "Everything you need to apply with confidence.",
    monthly: 0,
    yearly: 0,
    cta: "Start for free",
    href: "/signup",
    features: [
      "3 saved resumes",
      "5 mock interviews per month",
      "AI section rewrites",
      "ATS keyword-match score",
      "6 ATS-friendly templates",
      "PDF & DOCX download",
      "10 resume uploads per month",
    ],
  },
  pro: {
    name: "Pro",
    tagline: "Unlimited practice for serious job hunting.",
    monthly: 12,
    yearly: 96,
    cta: "Go Pro",
    href: "/signup?plan=pro",
    features: [
      "Unlimited saved resumes",
      "Unlimited mock interviews",
      "Unlimited resume uploads",
      "Everything in Free",
      "Personalised interview questions from your resume",
      "Progress charts & score history",
      "Priority AI processing",
    ],
  },
} as const;

export function Pricing() {
  const [yearly, setYearly] = React.useState(true);

  return (
    <section id="pricing" className="scroll-mt-20 border-y border-border bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-300">
            Pricing
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Cheaper than one rejected application
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free. Upgrade when you want unlimited interviews and resumes.
          </p>
        </Reveal>

        {/* Billing period toggle */}
        <Reveal delay={100} className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
            <span className={cn("text-sm", !yearly ? "font-medium text-foreground" : "text-muted-foreground")}>
              Monthly
            </span>
            <Switch checked={yearly} onCheckedChange={setYearly} aria-label="Toggle yearly billing" />
            <span className={cn("text-sm", yearly ? "font-medium text-foreground" : "text-muted-foreground")}>
              Yearly
            </span>
            <Badge variant="success">Save 33%</Badge>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {([PLANS.free, PLANS.pro] as const).map((plan, index) => {
            const price = yearly ? plan.yearly : plan.monthly;
            const isPro = plan.name === "Pro";

            return (
              <Reveal key={plan.name} delay={index * 100}>
                <Card
                  className={cn(
                    "relative flex h-full flex-col p-7 transition-all duration-300",
                    isPro
                      ? "border-brand-400/60 shadow-xl shadow-brand-500/10 md:-translate-y-2"
                      : "hover:shadow-lg",
                  )}
                >
                  {isPro && (
                    <Badge variant="gradient" className="absolute -top-3 left-7 gap-1.5 px-3 py-1">
                      <Sparkles className="h-3 w-3" aria-hidden />
                      Most popular
                    </Badge>
                  )}

                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

                  <div className="mt-6 flex items-end gap-1.5">
                    <span className="font-display text-4xl font-extrabold tracking-tight">
                      ${price}
                    </span>
                    <span className="pb-1 text-sm text-muted-foreground">
                      {price === 0 ? "forever" : yearly ? "/ year" : "/ month"}
                    </span>
                  </div>
                  {isPro && yearly && (
                    <p className="mt-1 text-xs text-muted-foreground">$8 per month, billed yearly</p>
                  )}

                  <Button
                    asChild
                    size="lg"
                    variant={isPro ? "default" : "outline"}
                    className="mt-6 w-full"
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>

                  <ul className="mt-7 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <span
                          className={cn(
                            "mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full",
                            isPro ? "bg-brand-gradient text-white" : "bg-success/15 text-success",
                          )}
                        >
                          <Check className="h-3 w-3" aria-hidden />
                        </span>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={220} className="mt-10 text-center">
          <p className="text-xs text-muted-foreground">
            Cancel anytime · Your data is exportable and deletable from Settings · No hidden fees
          </p>
        </Reveal>
      </div>
    </section>
  );
}
