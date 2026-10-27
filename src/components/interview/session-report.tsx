"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Quote,
  RefreshCw,
  ThumbsUp,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SampleAnswer } from "@/lib/interview/schema";

export interface ReportData {
  overallScore: number;
  scores: { clarity: number; relevance: number; confidence: number; structure: number };
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  sampleAnswers: SampleAnswer[];
}

export interface QuestionReview {
  id: string;
  order: number;
  question: string;
  answer: string | null;
  score: number | null;
  feedback: string | null;
  betterAnswer: string | null;
}

const DIMENSIONS = [
  { id: "clarity", label: "Clarity", hint: "Was the answer easy to follow?" },
  { id: "relevance", label: "Relevance", hint: "Did it answer the question?" },
  { id: "confidence", label: "Confidence", hint: "Did it sound decisive?" },
  { id: "structure", label: "Structure", hint: "Was it logically organised?" },
] as const;

function scoreVariant(score: number): "success" | "warning" | "destructive" {
  if (score >= 75) return "success";
  if (score >= 50) return "warning";
  return "destructive";
}

/** Colour token matching the score band. */
function scoreColor(score: number): string {
  if (score >= 75) return "var(--success)";
  if (score >= 50) return "var(--warning)";
  return "var(--destructive)";
}

/**
 * End-of-session report: overall score, breakdown, strengths, weaknesses,
 * model answers and concrete next steps.
 */
export function SessionReport({
  report,
  questions,
  session,
  demo,
}: {
  report: ReportData;
  questions: QuestionReview[];
  session: { id: string; role: string; interviewType: string };
  demo?: boolean;
}) {
  const score = report.overallScore;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      {/* ------------------------------------------------------------ Header */}
      <div className="text-center">
        <Badge variant="outline">Interview report</Badge>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {session.role}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {questions.length} questions · {session.interviewType.replace("-", " ")} interview
        </p>
      </div>

      {demo && (
        <p className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          Demo report — the score is calculated from your answers. Add an{" "}
          <code className="font-semibold">ANTHROPIC_API_KEY</code> for a written coaching report.
        </p>
      )}

      {/* -------------------------------------------------------- Score card */}
      <Card className="mt-6 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Big score — a real progress ring driven by the score */}
          <div className="flex shrink-0 flex-col items-center">
            <div
              className="grid h-32 w-32 place-items-center rounded-full p-[6px]"
              style={{
                backgroundImage: `conic-gradient(${scoreColor(score)} ${score}%, var(--muted) ${score}% 100%)`,
              }}
            >
              <div className="grid h-full w-full place-items-center rounded-full bg-card">
                <div className="text-center">
                  <p
                    className="font-display text-4xl font-extrabold leading-none"
                    style={{ color: scoreColor(score) }}
                  >
                    {score}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">out of 100</p>
                </div>
              </div>
            </div>
            <Badge variant={scoreVariant(score)} className="mt-3">
              {score >= 80
                ? "Excellent"
                : score >= 65
                  ? "Good"
                  : score >= 50
                    ? "Getting there"
                    : "Needs work"}
            </Badge>
          </div>

          {/* Dimension breakdown */}
          <div className="w-full flex-1 space-y-3.5">
            {DIMENSIONS.map((dimension) => {
              const value = report.scores[dimension.id] ?? 0;
              return (
                <div key={dimension.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <span className="text-sm font-medium">{dimension.label}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{dimension.hint}</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{value}</span>
                  </div>
                  <Progress value={value} className="mt-1.5 h-2" />
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ------------------------------------------------- Strengths/weakness */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <ThumbsUp className="h-4 w-4 text-success" aria-hidden />
            What went well
          </h2>
          <ul className="mt-3 space-y-2">
            {report.strengths.length ? (
              report.strengths.map((strength) => (
                <li key={strength} className="flex gap-2 text-sm text-foreground/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                  {strength}
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">
                Complete a full interview to see personalised strengths.
              </li>
            )}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <TriangleAlert className="h-4 w-4 text-warning" aria-hidden />
            What to improve
          </h2>
          <ul className="mt-3 space-y-2">
            {report.weaknesses.length ? (
              report.weaknesses.map((weakness) => (
                <li key={weakness} className="flex gap-2 text-sm text-foreground/90">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
                  {weakness}
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">
                Complete a full interview to see personalised weaknesses.
              </li>
            )}
          </ul>
        </Card>
      </div>

      {/* --------------------------------------------------------------- Tips */}
      {report.tips.length > 0 && (
        <Card className="mt-5 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4 text-brand-500" aria-hidden />
            Next steps
          </h2>
          <ol className="mt-3 space-y-2.5">
            {report.tips.map((tip, index) => (
              <li key={tip} className="flex gap-3 text-sm text-foreground/90">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-gradient text-[10px] font-bold text-white">
                  {index + 1}
                </span>
                {tip}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* ------------------------------------------------------ Sample answers */}
      {report.sampleAnswers.length > 0 && (
        <Card className="mt-5 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Quote className="h-4 w-4 text-brand-500" aria-hidden />
            Model answers
          </h2>
          <div className="mt-4 space-y-4">
            {report.sampleAnswers.map((sample, index) => (
              <div key={index} className="rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-sm font-medium">{sample.question}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {sample.answer}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ---------------------------------------------------- Question review */}
      {questions.length > 0 && (
        <Card className="mt-5 p-5">
          <h2 className="text-sm font-semibold">Question by question</h2>
          <div className="mt-4 space-y-4">
            {questions.map((question) => (
              <details
                key={question.id}
                className="group rounded-lg border border-border bg-card p-4 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                    {question.order}
                  </span>
                  <span className="flex-1 text-sm font-medium">{question.question}</span>
                  {question.score != null && (
                    <Badge variant={scoreVariant(question.score)}>{question.score}</Badge>
                  )}
                </summary>

                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  {question.answer ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Your answer
                      </p>
                      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                        {question.answer}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">Not answered.</p>
                  )}

                  {question.feedback && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Feedback
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                        {question.feedback}
                      </p>
                    </div>
                  )}

                  {question.betterAnswer && (
                    <div className="rounded-lg bg-brand-soft/50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        A stronger answer
                      </p>
                      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                        {question.betterAnswer}
                      </p>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------------ Actions */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/interview">
            <RefreshCw className="h-4 w-4" />
            Another interview
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            Back to dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
