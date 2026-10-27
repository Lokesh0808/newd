"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Clock, Mic, Sparkles, Timer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPERIENCE_LEVELS, INTERVIEW_TYPES } from "@/lib/interview/schema";
import { cn } from "@/lib/utils";

const ROLE_SUGGESTIONS = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full-stack Engineer",
  "Data Analyst",
  "Data Scientist",
  "Product Manager",
  "UX Designer",
  "DevOps Engineer",
  "Marketing Manager",
  "Sales Associate",
];

export interface ResumeOption {
  id: string;
  name: string;
  title: string;
}

/**
 * Interview setup — pick the role, level, type and length.
 */
export function InterviewSetup({
  resumes,
  defaultMode,
}: {
  resumes: ResumeOption[];
  defaultMode?: string;
}) {
  const router = useRouter();

  const [role, setRole] = React.useState("");
  const [level, setLevel] = React.useState("mid");
  const [type, setType] = React.useState(defaultMode === "interview" ? "mixed" : "mixed");
  const [count, setCount] = React.useState(5);
  const [useResume, setUseResume] = React.useState(resumes.length > 0);
  const [resumeId, setResumeId] = React.useState(resumes[0]?.id ?? "");
  const [loading, setLoading] = React.useState(false);

  async function start() {
    if (!role.trim()) {
      toast.error("Tell us which role you are interviewing for.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: role.trim(),
          experienceLevel: level,
          interviewType: type,
          questionCount: count,
          resumeId: useResume ? resumeId : null,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "We could not start the interview.");
      }

      router.push(`/interview/${payload.session.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not start the interview.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="text-center">
        <Badge variant="outline" className="gap-1.5">
          <Mic className="h-3.5 w-3.5" aria-hidden />
          AI mock interview
        </Badge>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Set up your interview
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          The interviewer asks one question at a time and follows up when your answer is thin. You get
          instant feedback on every answer and a full report at the end.
        </p>
      </div>

      <Card className="mt-8 p-5 sm:p-7">
        <div className="space-y-7">
          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Job role</Label>
            <Input
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              onKeyDown={(event) => {
                if (event.key === "Enter") void start();
              }}
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ROLE_SUGGESTIONS.slice(0, 6).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setRole(suggestion)}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-brand-300 hover:bg-accent hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Experience level */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Experience level</legend>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {EXPERIENCE_LEVELS.map((option) => {
                const active = option.id === level;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setLevel(option.id)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all",
                      active
                        ? "border-brand-500 bg-brand-500/10 shadow-sm"
                        : "border-border hover:border-brand-300 hover:bg-accent/50",
                    )}
                  >
                    <span className="block text-sm font-semibold">{option.name}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Interview type */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Interview type</legend>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {INTERVIEW_TYPES.map((option) => {
                const active = option.id === type;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setType(option.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all",
                      active
                        ? "border-brand-500 bg-brand-500/10 shadow-sm"
                        : "border-border hover:border-brand-300 hover:bg-accent/50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg",
                        active ? "bg-brand-gradient text-white" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Briefcase className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{option.name}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Question count */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="count">
                Number of questions
                <span className="ml-2 font-normal text-muted-foreground">
                  roughly {count * 2}–{count * 3} minutes
                </span>
              </Label>
              <span className="font-display text-lg font-bold text-brand-gradient">{count}</span>
            </div>
            <input
              id="count"
              type="range"
              min={3}
              max={15}
              step={1}
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[var(--primary)]"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>3 · quick warm-up</span>
              <span>10 · standard</span>
              <span>15 · full loop</span>
            </div>
          </div>

          {/* Personalise with resume */}
          {resumes.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-600 dark:text-brand-300">
                    <Sparkles className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <Label htmlFor="use-resume" className="cursor-pointer">
                      Personalise with my resume
                    </Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Questions will reference your real projects and achievements.
                    </p>
                  </div>
                </div>
                <Switch id="use-resume" checked={useResume} onCheckedChange={setUseResume} />
              </div>

              {useResume && (
                <div className="mt-4 space-y-1.5">
                  <Label htmlFor="resume" className="text-xs text-muted-foreground">
                    Which resume?
                  </Label>
                  <Select value={resumeId} onValueChange={setResumeId}>
                    <SelectTrigger id="resume">
                      <SelectValue placeholder="Choose a resume" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          {resume.name}
                          {resume.title ? ` — ${resume.title}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <Button type="button" size="lg" className="w-full" onClick={() => void start()} loading={loading}>
            {!loading && <Timer className="h-4 w-4" aria-hidden />}
            {loading ? "Preparing your interviewer…" : "Start the interview"}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            You can enable a per-question timer and voice answers once the interview starts.
          </p>
        </div>
      </Card>
    </div>
  );
}
