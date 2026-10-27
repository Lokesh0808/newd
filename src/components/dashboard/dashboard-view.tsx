"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Lightbulb,
  Mic,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScoreTrendChart } from "@/components/charts/score-trend-chart";
import { DimensionChart } from "@/components/charts/dimension-chart";
import { TimeAgo } from "@/components/ui/time-ago";
import { useClientValue } from "@/hooks/use-browser-capability";
import { firstName } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface DashboardResume {
  id: string;
  title: string;
  name: string;
  jobTitle: string;
  atsScore: number | null;
  updatedAt: string;
}

export interface DashboardInterview {
  id: string;
  role: string;
  interviewType: string;
  overallScore: number | null;
  createdAt: string;
  status: string;
}

export interface DashboardData {
  userName: string | null;
  plan: "FREE" | "PRO";
  resumes: DashboardResume[];
  interviews: DashboardInterview[];
  trend: Array<{ label: string; score: number; clarity: number }>;
  dimensions: Array<{ dimension: string; score: number }>;
  stats: {
    resumes: number;
    interviews: number;
    averageScore: number | null;
    bestScore: number | null;
    averageAts: number | null;
  };
  usage: {
    resumes: { used: number; limit: number };
    interviews: { used: number; limit: number };
  };
}

/** Time-of-day greeting — resolved on the client to avoid a timezone mismatch. */
function getGreeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

/** Dashboard — saved resumes, interview history, scores and progress charts. */
export function DashboardView({ data }: { data: DashboardData }) {
  const { stats } = data;

  // The greeting depends on the visitor's clock, so it is resolved on the
  // client only — during SSR and hydration we render a neutral placeholder.
  const greeting = useClientValue(getGreeting, "Welcome back");

  const statCards = [
    {
      label: "Saved resumes",
      value: String(stats.resumes),
      hint: `${data.usage.resumes.used}/${data.usage.resumes.limit === Infinity ? "∞" : data.usage.resumes.limit} used`,
      icon: FileText,
      href: "/resume",
    },
    {
      label: "Mock interviews",
      value: String(stats.interviews),
      hint: `${data.usage.interviews.used} this month`,
      icon: Mic,
      href: "/interview",
    },
    {
      label: "Average score",
      value: stats.averageScore != null ? `${stats.averageScore}` : "—",
      hint: stats.bestScore != null ? `Best: ${stats.bestScore}` : "No sessions yet",
      icon: TrendingUp,
      href: "/interview",
    },
    {
      label: "Average ATS",
      value: stats.averageAts != null ? `${stats.averageAts}` : "—",
      hint: "Out of 100",
      icon: Target,
      href: "/resume",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ------------------------------------------------------------ Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {greeting ?? "Welcome back"}
            {data.userName ? `, ${firstName(data.userName)}` : ""}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Your job search dashboard
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/interview">
              <Mic className="h-4 w-4" />
              New interview
            </Link>
          </Button>
          <Button asChild>
            <Link href="/resume">
              <Plus className="h-4 w-4" />
              New resume
            </Link>
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------- Stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="group">
            <Card className="h-full p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-brand-500/5">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-brand-600 transition-colors group-hover:bg-brand-gradient group-hover:text-white dark:text-brand-300">
                  <card.icon className="h-4 w-4" aria-hidden />
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-4 font-display text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-xs text-muted-foreground/80">{card.hint}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* ----------------------------------------------------------- Charts */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold">Score over time</h2>
              <p className="text-xs text-muted-foreground">
                Overall score and clarity across your completed interviews
              </p>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden />
          </div>
          {data.trend.length > 0 ? (
            <ScoreTrendChart data={data.trend} />
          ) : (
            <EmptyChart
              message="Complete an interview to see your score trend."
              href="/interview"
              cta="Start an interview"
            />
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold">Average by dimension</h2>
              <p className="text-xs text-muted-foreground">
                Where your answers are strong — and where they are not
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden />
          </div>
          {data.dimensions.length > 0 ? (
            <DimensionChart data={data.dimensions} />
          ) : (
            <EmptyChart
              message="Complete an interview to unlock this breakdown."
              href="/interview"
              cta="Start an interview"
            />
          )}
        </Card>
      </div>

      {/* ------------------------------------------ Resumes + interviews list */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* Resumes */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-bold">Saved resumes</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/resume">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {data.resumes.length === 0 ? (
            <EmptyChart
              message="No resumes yet — build your first one in about five minutes."
              href="/resume"
              cta="Create a resume"
            />
          ) : (
            <ul className="space-y-2.5">
              {data.resumes.slice(0, 5).map((resume) => (
                <li key={resume.id}>
                  <Link
                    href={`/resume/${resume.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                      <FileText className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {resume.name || resume.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {resume.jobTitle || resume.title} · <TimeAgo date={resume.updatedAt} />
                      </span>
                    </span>
                    {resume.atsScore != null && (
                      <Badge
                        variant={
                          resume.atsScore >= 75
                            ? "success"
                            : resume.atsScore >= 50
                              ? "warning"
                              : "destructive"
                        }
                      >
                        ATS {resume.atsScore}
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Interviews */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-bold">Recent interviews</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/interview">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {data.interviews.length === 0 ? (
            <EmptyChart
              message="No interviews yet — practise with the AI interviewer."
              href="/interview"
              cta="Start an interview"
            />
          ) : (
            <ul className="space-y-2.5">
              {data.interviews.slice(0, 5).map((interview) => (
                <li key={interview.id}>
                  <Link
                    href={
                      interview.status === "completed"
                        ? `/interview/${interview.id}/report`
                        : `/interview/${interview.id}`
                    }
                    className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
                  >
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-lg font-display text-sm font-bold",
                        interview.overallScore == null
                          ? "bg-muted text-muted-foreground"
                          : interview.overallScore >= 75
                            ? "bg-success/12 text-success"
                            : interview.overallScore >= 50
                              ? "bg-warning/15 text-warning"
                              : "bg-destructive/12 text-destructive",
                      )}
                    >
                      {interview.overallScore ?? "—"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{interview.role}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        <span className="capitalize">{interview.interviewType.replace("-", " ")}</span>{" "}
                        · <TimeAgo date={interview.createdAt} />
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* ---------------------------------------------------------- Plan card */}
      <Card className="mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-600 dark:text-brand-300">
              <Lightbulb className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-base font-bold">
                {data.plan === "PRO" ? "You are on the Pro plan" : "Free plan usage"}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {data.plan === "PRO"
                  ? "Unlimited resumes, unlimited interviews and personalised questions."
                  : "Upgrade for unlimited resumes, unlimited interviews and personalised questions."}
              </p>
            </div>
          </div>

          {data.plan === "FREE" ? (
            <Button asChild>
              <Link href="/settings#billing">Upgrade to Pro</Link>
            </Button>
          ) : (
            <Badge variant="gradient" className="px-3 py-1">
              Pro
            </Badge>
          )}
        </div>

        {data.plan === "FREE" && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <UsageBar
              label="Saved resumes"
              used={data.usage.resumes.used}
              limit={data.usage.resumes.limit}
            />
            <UsageBar
              label="Interviews this month"
              used={data.usage.interviews.used}
              limit={data.usage.interviews.limit}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

/** Small progress bar used for plan usage. */
function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const percentage = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">
          {used} / {limit === Infinity ? "∞" : limit}
        </span>
      </div>
      <Progress value={percentage} className="mt-2" />
    </div>
  );
}

/** Placeholder shown when a chart has no data yet. */
function EmptyChart({
  message,
  href,
  cta,
}: {
  message: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
      <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
      <Button asChild size="sm" variant="outline" className="mt-4">
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}
