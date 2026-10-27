import { ArrowRight, ClipboardCheck, FileSearch, Send } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    number: "01",
    icon: FileSearch,
    title: "Describe the job",
    description:
      "Paste the job description once. CareerAI extracts the keywords an ATS will scan for and keeps them as the target for everything that follows.",
    detail: "Job description parsing",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Build & tailor the resume",
    description:
      "Fill the guided form or upload an existing resume. Use Improve with AI on any section, then check the live ATS score before you export.",
    detail: "Guided form + ATS score",
  },
  {
    number: "03",
    icon: Send,
    title: "Rehearse, then apply",
    description:
      "Run a mock interview for the same role, review the structured feedback and the model answers, then send an application you have already rehearsed.",
    detail: "Mock interview + report",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-20 border-y border-border bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-300">
            How it works
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            From blank page to application in three steps
          </h2>
        </Reveal>

        <div className="relative mt-16">
          {/* Connector line (desktop only) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-16 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />

          <ol className="grid gap-10 lg:grid-cols-3 lg:gap-8">
            {STEPS.map((step, index) => (
              <Reveal key={step.number} delay={index * 120}>
                <li className="group relative">
                  <div className="flex items-center gap-4">
                    <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 group-hover:border-brand-300 group-hover:shadow-lg group-hover:shadow-brand-500/10">
                      <step.icon className="h-6 w-6 text-brand-600 dark:text-brand-300" aria-hidden />
                      <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-brand-gradient text-[10px] font-bold text-white shadow">
                        {step.number}
                      </span>
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {step.detail}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold">{step.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal delay={200} className="mt-14 flex justify-center">
          <Button asChild size="lg" variant="outline" className="group">
            <Link href="/signup">
              Start building for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
