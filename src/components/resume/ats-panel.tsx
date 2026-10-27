"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Loader2, Sparkles, Target } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { AtsReport } from "@/lib/resume/ats";
import type { ResumeData } from "@/lib/resume/schema";
import { cn } from "@/lib/utils";

/**
 * ATS panel — paste a job description, see the keyword match score and let
 * the AI tailor the resume to that description.
 */
export function AtsPanel({
  open,
  onOpenChange,
  resumeId,
  jobDescription,
  onJobDescriptionChange,
  currentScore,
  onScore,
  onTailored,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  currentScore: number | null;
  onScore: (score: number, missing: string[]) => void;
  onTailored: (data: ResumeData) => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [report, setReport] = React.useState<AtsReport | null>(null);
  const [notes, setNotes] = React.useState("");
  const [demo, setDemo] = React.useState(false);

  // Reset the panel whenever it is closed, so reopening starts fresh.
  function handleOpenChange(next: boolean) {
    if (!next) {
      setReport(null);
      setNotes("");
    }
    onOpenChange(next);
  }

  async function tailor() {
    if (jobDescription.trim().length < 40) {
      toast.error("Paste the full job description (at least a few lines).");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/resume-tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobDescription }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "The tailoring request failed.");
      }

      setReport(payload.ats);
      setNotes(payload.notes ?? "");
      setDemo(Boolean(payload.demo));
      onScore(payload.ats.score, payload.ats.missing);
      onTailored(payload.resume);
      toast.success(`ATS score: ${payload.ats.score}/100`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The tailoring request failed.");
    } finally {
      setLoading(false);
    }
  }

  const score = report?.score ?? currentScore ?? 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-brand-500" aria-hidden />
            Tailor to a job description
          </DialogTitle>
          <DialogDescription>
            Paste the job posting. We score your resume against the keywords an ATS scans for, then
            rewrite it to match.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="job-description">Job description</Label>
          <Textarea
            id="job-description"
            rows={10}
            value={jobDescription}
            onChange={(event) => onJobDescriptionChange(event.target.value)}
            placeholder="Paste the full job posting here — title, responsibilities and requirements…"
          />
        </div>

        <Button type="button" onClick={() => void tailor()} loading={loading} className="w-full">
          {!loading && <Sparkles className="h-4 w-4" aria-hidden />}
          {loading ? "Scanning & tailoring…" : "Score & tailor my resume"}
        </Button>

        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Analysing keywords and rewriting your resume…
          </div>
        )}

        {report && (
          <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4">
            {/* Score */}
            <div>
              <div className="flex items-end justify-between gap-3">
                <p className="text-sm font-semibold">ATS keyword match</p>
                <p className="font-display text-2xl font-bold text-brand-gradient">
                  {score}
                  <span className="text-sm font-medium text-muted-foreground">/100</span>
                </p>
              </div>
              <Progress value={score} className="mt-2" />
              <p
                className={cn(
                  "mt-2 text-xs font-medium",
                  score >= 75
                    ? "text-success"
                    : score >= 50
                      ? "text-warning"
                      : "text-destructive",
                )}
              >
                {score >= 75
                  ? "Strong match — this resume should clear most ATS filters."
                  : score >= 50
                    ? "Decent match. Add the missing keywords below to push it higher."
                    : "Weak match — significant keywords are missing."}
              </p>
            </div>

            {demo && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                Demo mode — the ATS score is fully calculated, but the content was not rewritten. Add an{" "}
                <code className="font-semibold">ANTHROPIC_API_KEY</code> to enable AI tailoring.
              </div>
            )}

            {notes && !demo && <p className="text-xs text-muted-foreground">{notes}</p>}

            {/* Keyword lists */}
            {report.missing.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                  Missing keywords ({report.missing.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {report.missing.slice(0, 24).map((keyword) => (
                    <Badge key={keyword} variant="destructive" className="font-normal">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {report.matched.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  Matched keywords ({report.matched.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {report.matched.slice(0, 24).map((keyword) => (
                    <Badge key={keyword} variant="success" className="font-normal">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {report.suggestions.length > 0 && (
              <ul className="space-y-1.5 border-t border-border pt-3">
                {report.suggestions.map((suggestion) => (
                  <li key={suggestion} className="text-xs text-muted-foreground">
                    • {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
