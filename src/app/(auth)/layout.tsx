import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

import { Logo } from "@/components/logo";

const HIGHLIGHTS = [
  "Build an ATS-ready resume with AI rewrites",
  "Tailor it to any job description and see your score",
  "Practise with a mock interviewer that gives instant feedback",
  "Export PDF & DOCX — free forever tier included",
];

/** Split-screen layout shared by the login and signup pages. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-brand-gradient p-12 lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-grid" />
        </div>

        <div className="relative">
          <Logo className="text-white" href="/" />
        </div>

        <div className="relative max-w-md">
          <h2 className="font-display text-3xl font-bold leading-tight text-white">
            One profile. Every application.
          </h2>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-white/90">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/20">
                  <Check className="h-3 w-3" aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/70">
          © {new Date().getFullYear()} CareerAI · Your data stays yours and can be deleted anytime.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 lg:justify-end">
          <Logo className="lg:hidden" href="/" />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16 pt-4">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
