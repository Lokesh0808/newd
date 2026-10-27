import type { Metadata } from "next";

import { DashboardView, type DashboardData } from "@/components/dashboard/dashboard-view";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getUsage } from "@/lib/entitlements";
import { normaliseResumeData } from "@/lib/resume/schema";
import type { InterviewScores } from "@/lib/interview/schema";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track your resumes, interview scores and progress over time.",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <DashboardView data={emptyData()} />;
  }

  const [resumes, interviews, usage] = await Promise.all([
    prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, atsScore: true, updatedAt: true, data: true },
    }),
    prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        role: true,
        interviewType: true,
        overallScore: true,
        createdAt: true,
        status: true,
        scores: true,
      },
    }),
    getUsage(userId, session!.user.plan),
  ]);

  // --- Aggregations --------------------------------------------------------
  const completed = interviews.filter((interview) => interview.status === "completed");

  const scores = completed
    .map((interview) => interview.overallScore)
    .filter((score): score is number => score != null);

  const atsScores = resumes
    .map((resume) => resume.atsScore)
    .filter((score): score is number => score != null);

  // Trend: oldest → newest so the chart reads left to right.
  const trend = [...completed]
    .reverse()
    .filter((interview) => interview.overallScore != null)
    .map((interview) => ({
      label: new Date(interview.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }),
      score: interview.overallScore ?? 0,
      clarity:
        (interview.scores as InterviewScores | null)?.clarity ??
        interview.overallScore ??
        0,
    }));

  // Average per dimension across all completed sessions.
  const dimensionTotals = { clarity: 0, relevance: 0, confidence: 0, structure: 0 };
  let dimensionCount = 0;
  for (const interview of completed) {
    const value = interview.scores as InterviewScores | null;
    if (!value) continue;
    dimensionTotals.clarity += value.clarity;
    dimensionTotals.relevance += value.relevance;
    dimensionTotals.confidence += value.confidence;
    dimensionTotals.structure += value.structure;
    dimensionCount += 1;
  }

  const dimensions = dimensionCount
    ? [
        { dimension: "Clarity", score: Math.round(dimensionTotals.clarity / dimensionCount) },
        { dimension: "Relevance", score: Math.round(dimensionTotals.relevance / dimensionCount) },
        { dimension: "Confidence", score: Math.round(dimensionTotals.confidence / dimensionCount) },
        { dimension: "Structure", score: Math.round(dimensionTotals.structure / dimensionCount) },
      ]
    : [];

  const data: DashboardData = {
    userName: session!.user.name ?? null,
    plan: session!.user.plan,
    resumes: resumes.map((resume) => {
      const resumeData = normaliseResumeData(resume.data);
      return {
        id: resume.id,
        title: resume.title,
        name: resumeData.personal.fullName || resume.title,
        jobTitle: resumeData.personal.title,
        atsScore: resume.atsScore,
        updatedAt: resume.updatedAt.toISOString(),
      };
    }),
    interviews: interviews.map((interview) => ({
      id: interview.id,
      role: interview.role,
      interviewType: interview.interviewType,
      overallScore: interview.overallScore,
      createdAt: interview.createdAt.toISOString(),
      status: interview.status,
    })),
    trend,
    dimensions,
    stats: {
      resumes: resumes.length,
      interviews: interviews.length,
      averageScore: scores.length
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : null,
      bestScore: scores.length ? Math.max(...scores) : null,
      averageAts: atsScores.length
        ? Math.round(atsScores.reduce((sum, score) => sum + score, 0) / atsScores.length)
        : null,
    },
    usage: {
      resumes: usage.resumes,
      interviews: usage.interviews,
    },
  };

  return <DashboardView data={data} />;
}

/** Blank dashboard used when there is no session. */
function emptyData(): DashboardData {
  return {
    userName: null,
    plan: "FREE",
    resumes: [],
    interviews: [],
    trend: [],
    dimensions: [],
    stats: { resumes: 0, interviews: 0, averageScore: null, bestScore: null, averageAts: null },
    usage: {
      resumes: { used: 0, limit: 3 },
      interviews: { used: 0, limit: 5 },
    },
  };
}
