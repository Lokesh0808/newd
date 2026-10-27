import { NextResponse } from "next/server";

import { apiError, requireUser, withErrorHandling } from "@/lib/api";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateSessionReport } from "@/lib/ai/interview";
import { normaliseResumeData, resumeToPlainText } from "@/lib/resume/schema";
import type { InterviewScores } from "@/lib/interview/schema";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Finish the interview and build the end-of-session report.
 */
export const POST = withErrorHandling(async (_request: Request, context: RouteContext) => {
  const user = await requireUser();
  const { id } = await context.params;

  const session = await prisma.interviewSession.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!session || session.userId !== user.id) {
    return apiError("Interview session not found.", 404, "NOT_FOUND");
  }

  if (session.status === "completed") {
    return NextResponse.json({
      report: {
        overallScore: session.overallScore,
        scores: session.scores,
        strengths: session.strengths,
        weaknesses: session.weaknesses,
        tips: session.tips,
        sampleAnswers: session.sampleAnswers,
      },
      demo: false,
    });
  }

  let resumeText: string | undefined;
  if (session.usedResume) {
    const resume = await prisma.resume.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    if (resume) {
      resumeText = resumeToPlainText(normaliseResumeData(resume.data)).slice(0, 6000);
    }
  }

  const report = await generateSessionReport({
    role: session.role,
    experienceLevel: session.experienceLevel,
    interviewType: session.interviewType,
    resumeText,
    questions: session.questions.map((question) => ({
      question: question.question,
      answer: question.answer,
      score: question.score,
      scores: (question.scores as InterviewScores | null) ?? null,
    })),
  });

  await prisma.interviewSession.update({
    where: { id: session.id },
    data: {
      status: "completed",
      overallScore: report.overallScore,
      scores: report.scores as unknown as Prisma.InputJsonValue,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      tips: report.tips,
      sampleAnswers: report.sampleAnswers as unknown as Prisma.InputJsonValue,
      perQuestionFeedback: Object.fromEntries(
        session.questions
          .filter((question) => question.feedback)
          .map((question) => [question.id, question.feedback as string]),
      ),
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ report, demo: report.demo });
});
