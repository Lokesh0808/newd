"use client";

import { CheckCircle2, Lightbulb, Star, ThumbsUp, TriangleAlert } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { QuestionFeedback } from "@/lib/interview/schema";
import { cn } from "@/lib/utils";

const DIMENSIONS = [
  { id: "clarity", label: "Clarity", hint: "Easy to follow?" },
  { id: "relevance", label: "Relevance", hint: "Answers the question?" },
  { id: "confidence", label: "Confidence", hint: "Decisive tone?" },
  { id: "structure", label: "Structure", hint: "STAR method used?" },
] as const;

const STAR_ITEMS = [
  { id: "situation", label: "Situation" },
  { id: "task", label: "Task" },
  { id: "action", label: "Action" },
  { id: "result", label: "Result" },
] as const;

/** Score badge colouring based on the value. */
function scoreVariant(score: number): "success" | "warning" | "destructive" {
  if (score >= 75) return "success";
  if (score >= 50) return "warning";
  return "destructive";
}

/**
 * Instant feedback shown after the candidate submits an answer.
 */
export function FeedbackPanel({
  feedback,
  demo,
}: {
  feedback: QuestionFeedback;
  demo?: boolean;
}) {
  return (
    <Card className="animate-fade-in border-brand-200/70 bg-brand-soft/30 p-5 dark:border-brand-900">
      {demo && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          Demo scoring — connect an Anthropic API key for AI-written feedback.
        </div>
      )}

      {/* Headline score */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Answer score</span>
          <Badge variant={scoreVariant(feedback.score)} className="font-semibold">
            {feedback.score}/100
          </Badge>
        </div>
      </div>

      {/* Dimension bars */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {DIMENSIONS.map((dimension) => {
          const value = feedback.scores[dimension.id] ?? 0;
          return (
            <div key={dimension.id}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium">{dimension.label}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{value}</span>
              </div>
              <Progress value={value} className="mt-1 h-1.5" />
            </div>
          );
        })}
      </div>

      {/* STAR coverage */}
      <div className="mt-5">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
          <Star className="h-3.5 w-3.5 text-brand-500" aria-hidden />
          STAR method
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STAR_ITEMS.map((item) => {
            const covered = feedback.star[item.id];
            return (
              <Badge
                key={item.id}
                variant={covered ? "success" : "outline"}
                className={cn("gap-1", !covered && "text-muted-foreground")}
              >
                {covered ? (
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                ) : (
                  <TriangleAlert className="h-3 w-3" aria-hidden />
                )}
                {item.label}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Written feedback */}
      {feedback.feedback && (
        <div className="mt-5 rounded-lg bg-card p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold">
            <Lightbulb className="h-3.5 w-3.5 text-brand-500" aria-hidden />
            Coaching notes
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{feedback.feedback}</p>
        </div>
      )}

      {/* Better answer */}
      {feedback.betterAnswer && (
        <div className="mt-3 rounded-lg bg-card p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold">
            <ThumbsUp className="h-3.5 w-3.5 text-success" aria-hidden />
            A stronger way to say it
          </p>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {feedback.betterAnswer}
          </p>
        </div>
      )}
    </Card>
  );
}
