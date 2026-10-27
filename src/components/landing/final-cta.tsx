import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

/** Final call-to-action band. */
export function FinalCta() {
  return (
    <section className="px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
      <Reveal className="mx-auto w-full max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-14 text-center shadow-2xl shadow-brand-500/20 sm:px-12 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-25">
            <div className="absolute inset-0 bg-grid" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Your next offer starts with a better resume
            </h2>
            <p className="mt-4 text-base text-white/85">
              Build your resume, beat the ATS, and rehearse the interview — free, and ready in under ten
              minutes.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary" className="group">
                <Link href="/signup">
                  Get started free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/#pricing">See Pro plan</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
