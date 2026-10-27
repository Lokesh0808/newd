"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Clock, Mic, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TimeAgo } from "@/components/ui/time-ago";
import { cn } from "@/lib/utils";

export interface HistorySession {
  id: string;
  role: string;
  experienceLevel: string;
  interviewType: string;
  questionCount: number;
  status: string;
  overallScore: number | null;
  createdAt: string;
  answeredCount: number;
}

/** Past interview sessions list. */
export function InterviewHistory({ sessions }: { sessions: HistorySession[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  async function remove(id: string) {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/interviews/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "Could not delete the session.");
      }
      toast.success("Interview deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the session.");
    } finally {
      setDeletingId(null);
    }
  }

  if (sessions.length === 0) {
    return (
      <Card className="border-dashed p-10 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-brand-600 dark:text-brand-300">
          <Mic className="h-6 w-6" aria-hidden />
        </span>
        <h3 className="mt-4 font-display text-lg font-bold">No interviews yet</h3>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
          Run your first mock interview and get scored on clarity, relevance, confidence and structure.
        </p>
        <Button asChild className="mt-6">
          <Link href="/interview">
            Start an interview
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const completed = session.status === "completed";
        return (
          <Card
            key={session.id}
            className="group flex flex-wrap items-center gap-4 p-4 transition-all hover:shadow-md"
          >
            {/* Score badge */}
            <div
              className={cn(
                "grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-lg font-bold",
                session.overallScore == null
                  ? "bg-muted text-muted-foreground"
                  : session.overallScore >= 75
                    ? "bg-success/12 text-success"
                    : session.overallScore >= 50
                      ? "bg-warning/15 text-warning"
                      : "bg-destructive/12 text-destructive",
              )}
            >
              {session.overallScore ?? "—"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{session.role}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden />
                  <TimeAgo date={session.createdAt} />
                </span>
                <span className="capitalize">{session.interviewType.replace("-", " ")}</span>
                <span className="capitalize">{session.experienceLevel}</span>
                <span>
                  {session.answeredCount}/{session.questionCount} answered
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {completed ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/interview/${session.id}/report`}>
                    <BarChart3 className="h-3.5 w-3.5" />
                    Report
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link href={`/interview/${session.id}`}>
                    Continue
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Session actions"
                    className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => void remove(session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingId === session.id ? "Deleting…" : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
