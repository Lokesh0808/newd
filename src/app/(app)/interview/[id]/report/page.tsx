import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SessionReport } from "@/components/interview/session-report";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { SampleAnswer } from "@/lib/interview/schema";

export const metadata: Metadata = {
  title: "Interview report",
  description: "Your interview score, strengths, weaknesses and model answers.",
};

export default async function InterviewReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const interview = userId
    ? await prisma.interviewSession.findUnique({
        where: { id },
        include: { questions: { orderBy: { order: "asc" } } },
      })
    : null;

  if (!interview || interview.userId !== userId) notFound();

  const scores = (interview.scores ?? {
    clarity: 0,
    relevance: 0,
    confidence: 0,
    structure: 0,
  }) as { clarity: number; relevance: number; confidence: number; structure: number };

  return (
    <SessionReport
      session={{ id: interview.id, role: interview.role, interviewType: interview.interviewType }}
      report={{
        overallScore: interview.overallScore ?? 0,
        scores,
        strengths: interview.strengths,
        weaknesses: interview.weaknesses,
        tips: interview.tips,
        sampleAnswers: (interview.sampleAnswers ?? []) as unknown as SampleAnswer[],
      }}
      questions={interview.questions.map((question) => ({
        id: question.id,
        order: question.order,
        question: question.question,
        answer: question.answer,
        score: question.score,
        feedback: question.feedback,
        betterAnswer: question.betterAnswer,
      }))}
    />
  );
}
