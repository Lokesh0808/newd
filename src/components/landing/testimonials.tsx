import { Quote, Star } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { Card } from "@/components/ui/card";

const TESTIMONIALS = [
  {
    quote:
      "My resume went from a 62 ATS score to 91 after tailoring. Two weeks later I had three interview calls instead of one.",
    name: "Priya Raman",
    role: "Senior Frontend Engineer",
    initials: "PR",
    accent: "from-violet-500 to-indigo-600",
  },
  {
    quote:
      "The mock interview caught that I never said “I” when describing my impact. That single habit was quietly costing me every technical screen.",
    name: "Marcus Webb",
    role: "Backend Engineer",
    initials: "MW",
    accent: "from-cyan-500 to-blue-600",
  },
  {
    quote:
      "Being able to talk through my answers out loud with a timer, then get scored on STAR structure, made system design finally feel natural.",
    name: "Aisha Bello",
    role: "Product Manager",
    initials: "AB",
    accent: "from-rose-500 to-fuchsia-600",
  },
  {
    quote:
      "I uploaded an old PDF resume and had a properly formatted, keyword-aligned version in about five minutes. No more rewriting from scratch.",
    name: "Daniel Ortiz",
    role: "Data Analyst",
    initials: "DO",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    quote:
      "The cover letter used my own bullet points instead of generic filler. Recruiters noticed — it sounded like me, only sharper.",
    name: "Yuki Tanaka",
    role: "Marketing Lead",
    initials: "YT",
    accent: "from-amber-500 to-orange-600",
  },
  {
    quote:
      "I used the free tier to prepare for one interview and the Pro plan for the rest. It paid for itself with the first offer.",
    name: "Elena Petrova",
    role: "Engineering Manager",
    initials: "EP",
    accent: "from-indigo-500 to-purple-600",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-300">
            Loved by candidates
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            People who stopped guessing
          </h2>
          <p className="mt-4 text-muted-foreground">
            Real feedback from engineers, designers and product folks who used CareerAI to prepare.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 70}>
              <Card className="relative flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5">
                <Quote className="h-6 w-6 text-brand-300" aria-hidden />
                <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                  {testimonial.quote}
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-5">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${testimonial.accent} text-xs font-bold text-white`}
                  >
                    {testimonial.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{testimonial.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                    ))}
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
