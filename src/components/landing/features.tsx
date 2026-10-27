import {
  BrainCircuit,
  Download,
  FileText,
  Mic,
  Palette,
  ScanText,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: FileText,
    title: "Step-by-step resume builder",
    description:
      "Personal details, summary, experience, education, skills, projects and certifications — one guided form with a live preview beside it.",
  },
  {
    icon: Sparkles,
    title: "Improve with AI",
    description:
      "One click rewrites any section with strong action verbs and quantified achievements. Your facts stay yours; only the wording gets sharper.",
  },
  {
    icon: Target,
    title: "ATS score out of 100",
    description:
      "Paste any job description. CareerAI matches your resume against the real keywords an ATS looks for and shows exactly what is missing.",
  },
  {
    icon: Palette,
    title: "6 ATS-friendly templates",
    description:
      "Clean single-column layouts that recruiters can actually read, with eight accent colours and six font pairings.",
  },
  {
    icon: Download,
    title: "PDF & DOCX export",
    description:
      "Download a pixel-perfect PDF or an editable Word document, plus a ready-to-send cover letter generated from your resume and the job.",
  },
  {
    icon: Mic,
    title: "Realistic mock interviews",
    description:
      "Pick a role, level and interview type. The AI asks one question at a time and digs deeper when your answer is thin.",
  },
  {
    icon: BrainCircuit,
    title: "Instant structured feedback",
    description:
      "Every answer is scored on clarity, relevance, confidence and structure — with STAR-method coaching for behavioural questions.",
  },
  {
    icon: Timer,
    title: "Voice, timer & transcripts",
    description:
      "Answer by typing or speech-to-text, optionally with a per-question timer and read-aloud questions.",
  },
  {
    icon: ScanText,
    title: "Import an existing resume",
    description:
      "Upload a PDF or DOCX and CareerAI parses it, then helps you rewrite it into a sharper, keyword-aligned version.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-300">
            Everything you need
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Two tools, one career workflow
          </h2>
          <p className="mt-4 text-muted-foreground">
            Most job applications are lost to a weak resume and an unprepared interview. CareerAI fixes both
            before you ever hit “submit”.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 60}>
              <Card className="group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/5">
                <span
                  className={cn(
                    "mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand-600 transition-colors group-hover:bg-brand-gradient group-hover:text-white dark:text-brand-300",
                  )}
                >
                  <feature.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
