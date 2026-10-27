import Link from "next/link";
import { ArrowRight, Mic, Sparkles, Target, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";

/**
 * Hero section.
 *
 * The right-hand "product preview" is drawn with plain markup (no image
 * assets), so it stays crisp on any screen and adds no network cost.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-[0.55] dark:opacity-[0.25]" />
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-glow blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-24">
        {/* ------------------------------------------------ Copy */}
        <div className="flex flex-col justify-center">
          <Reveal>
            <Badge variant="outline" className="w-fit gap-2 border-brand-300/60 bg-brand-500/5 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" aria-hidden />
              <span className="text-brand-700 dark:text-brand-300">New</span>
              <span className="text-muted-foreground">· AI mock interviews with instant feedback</span>
            </Badge>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Land the job you want.
              <br />
              <span className="text-brand-gradient">Resume + interview, on autopilot.</span>
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              CareerAI writes an ATS-beating resume tailored to the exact job description, then puts you
              in a realistic mock interview that scores your answers on clarity, structure and confidence —
              before the real one does.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="group">
                <Link href="/signup">
                  Build my resume free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/signup?mode=interview">
                  <Mic className="h-4 w-4" />
                  Try a mock interview
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={260}>
            <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {[
                "No credit card required",
                "ATS score out of 100",
                "PDF & DOCX export",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-success/15 text-[10px] text-success">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* ------------------------------------------------ Product preview */}
        <Reveal delay={180} className="relative">
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            {/* Floating stat cards */}
            <div className="absolute -left-3 top-16 z-20 hidden rounded-xl border border-border bg-card/90 p-3 shadow-xl backdrop-blur sm:block lg:-left-8">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-success/15">
                  <Target className="h-4 w-4 text-success" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">ATS match score</p>
                  <p className="text-lg font-bold leading-none">94<span className="text-xs font-medium text-muted-foreground">/100</span></p>
                </div>
              </div>
            </div>

            <div className="absolute -right-3 bottom-24 z-20 hidden rounded-xl border border-border bg-card/90 p-3 shadow-xl backdrop-blur sm:block lg:-right-6">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/15">
                  <Wand2 className="h-4 w-4 text-brand-500" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Answer score</p>
                  <p className="text-lg font-bold leading-none">87<span className="text-xs font-medium text-muted-foreground">/100</span></p>
                </div>
              </div>
            </div>

            {/* Main mock window */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-brand-500/10">
              {/* Window chrome */}
              <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
                  careerai.app/resume/new
                </span>
              </div>

              <div className="grid gap-0 sm:grid-cols-[1fr_1.2fr]">
                {/* Editor column */}
                <div className="space-y-3 border-b border-border p-4 sm:border-b-0 sm:border-r">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Experience
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-md bg-brand-500/12 px-2 py-1 text-[10px] font-semibold text-brand-600 dark:text-brand-300">
                      <Sparkles className="h-3 w-3" /> Improve
                    </span>
                  </div>
                  <div className="space-y-2 rounded-lg border border-border p-3">
                    <div className="h-2.5 w-3/4 rounded-full bg-muted" />
                    <div className="h-2.5 w-1/2 rounded-full bg-muted" />
                    <div className="h-2.5 w-5/6 rounded-full bg-muted" />
                    <div className="h-2.5 w-2/3 rounded-full bg-brand-400/50" />
                    <div className="h-2.5 w-4/5 rounded-full bg-muted" />
                  </div>
                  <div className="space-y-2 rounded-lg border border-border p-3">
                    <div className="h-2.5 w-2/3 rounded-full bg-muted" />
                    <div className="h-2.5 w-5/6 rounded-full bg-muted" />
                  </div>
                </div>

                {/* Preview column */}
                <div className="bg-muted/30 p-4">
                  <div className="h-full rounded-lg border border-border bg-background p-4 shadow-sm">
                    <div className="h-3 w-1/2 rounded-full bg-brand-500/70" />
                    <div className="mt-1.5 h-2 w-1/3 rounded-full bg-muted" />
                    <div className="mt-4 h-2 w-1/4 rounded-full bg-muted" />
                    <div className="mt-2 h-2 w-full rounded-full bg-muted/70" />
                    <div className="mt-1.5 h-2 w-11/12 rounded-full bg-muted/70" />
                    <div className="mt-2 h-2 w-4/5 rounded-full bg-muted/70" />
                    <div className="mt-4 h-2 w-1/4 rounded-full bg-muted" />
                    <div className="mt-2 h-2 w-full rounded-full bg-muted/70" />
                    <div className="mt-1.5 h-2 w-10/12 rounded-full bg-muted/70" />
                    <div className="mt-1.5 h-2 w-3/4 rounded-full bg-muted/70" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
