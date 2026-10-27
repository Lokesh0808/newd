import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireUser, withErrorHandling } from "@/lib/api";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { evaluateAnswer } from "@/lib/ai/interview";
import { normaliseResumeData, resumeToPlainText } from "@/lib/resume/schema";

type RouteContext = { params: Promise<{ id: string }> };

const answerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(1, "Write an answer before submitting."),
  durationSeconds: z.number().int().min(0).max(7200).optional(),
});

/**
 * Submit an answer and get instant feedback.
 *
 * The answer is scored on clarity, relevance, confidence and structure, and
 * for behavioural questions we also report STAR-method coverage.
 */
export const POST = withErrorHandling(async (request: Request, context: RouteContext) => {
  const user = await requireUser();
  const { id } = await context.params;

  const body = await request.json().catch(() => null);
  const parsed = answerSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid request.", 422, "VALIDATION_ERROR");
  }

  const session = await prisma.interviewSession.findUnique({ where: { id } });
  if (!session || session.userId !== user.id) {
    return apiError("Interview session not found.", 404, "NOT_FOUND");
  }

  const question = await prisma.interviewQuestion.findUnique({
    where: { id: parsed.data.questionId },
  });

  if (!question || question.sessionId !== session.id) {
    return apiError("Question not found in this interview.", 404, "NOT_FOUND");
  }

  // Personalisation context (optional).
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

  const evaluation = await evaluateAnswer({
    question: question.question,
    answer: parsed.data.answer,
    role: session.role,
    experienceLevel: session.experienceLevel,
    interviewType: session.interviewType,
    resumeText,
  });

  await prisma.interviewQuestion.update({
    where: { id: question.id },
    data: {
      answer: parsed.data.answer,
      durationSeconds: parsed.data.durationSeconds,
      score: evaluation.score,
      scores: evaluation.scores as unknown as Prisma.InputJsonValue,
      feedback: evaluation.feedback,
      betterAnswer: evaluation.betterAnswer,
      starCoverage: evaluation.star as unknown as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({
    feedback: {
      scores: evaluation.scores as unknown as Prisma.InputJsonValue,
      score: evaluation.score,
      feedback: evaluation.feedback,
      betterAnswer: evaluation.betterAnswer,
      star: evaluation.star,
    },
    demo: evaluation.demo,
  });
});
