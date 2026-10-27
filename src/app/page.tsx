import type { Metadata } from "next";

import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { SiteFooter } from "@/components/landing/site-footer";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "CareerAI — AI Resume Builder & Mock Interview Coach",
  description:
    "Build an ATS-friendly resume with AI, tailor it to any job description, and practise with a realistic AI mock interviewer that scores your answers.",
};

const STATS = [
  { value: "94%", label: "average ATS score after tailoring" },
  { value: "2.4×", label: "more interview callbacks" },
  { value: "10 min", label: "from blank page to application" },
  { value: "24/7", label: "rehearse whenever you want" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <Hero />

        {/* Social proof numbers */}
        <section className="border-y border-border bg-card/40">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
            {STATS.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 80} className="text-center sm:text-left">
                <p className="font-display text-2xl font-extrabold tracking-tight text-brand-gradient sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>

      <SiteFooter />
    </div>
  );
}
