import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InterviewSession } from "@/components/interview/interview-session";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Mock interview in progress",
  description: "Answer the AI interviewer's questions and get instant feedback.",
};

export default async function InterviewSessionPage({
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

  if (interview.status === "completed") {
    // Finished interviews always redirect to their report.
    const { redirect } = await import("next/navigation");
    redirect(`/interview/${interview.id}/report`);
  }

  // Resume where the user left off: the last unanswered question, if any.
  const current =
    interview.questions.find((question) => !question.answer) ??
    interview.questions[interview.questions.length - 1] ??
    null;

  return (
    <InterviewSession
      session={{
        id: interview.id,
        role: interview.role,
        experienceLevel: interview.experienceLevel,
        interviewType: interview.interviewType,
        questionCount: interview.questionCount,
        status: interview.status,
      }}
      initialQuestion={
        current
          ? {
              id: current.id,
              order: current.order,
              question: current.question,
              category: current.category,
              answer: current.answer,
            }
          : null
      }
    />
  );
}
