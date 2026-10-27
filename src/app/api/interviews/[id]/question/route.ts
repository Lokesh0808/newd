import { NextResponse } from "next/server";

import { apiError, requireUser, withErrorHandling } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { generateNextQuestion } from "@/lib/ai/interview";
import { normaliseResumeData } from "@/lib/resume/schema";
import { resumeToPlainText } from "@/lib/resume/schema";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Ask for the next interview question.
 *
 * The question is generated in the context of everything already asked and
 * answered, which is how the interviewer "follows up" on a weak answer.
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
    return apiError("This interview is already finished.", 409, "SESSION_COMPLETED");
  }

  // The session is finished once the requested number of questions is asked.
  if (session.questions.length >= session.questionCount) {
    return apiError("ALL_QUESTIONS_ASKED", 409, "ALL_QUESTIONS_ASKED");
  }

  // Personalisation: pull in the user's most recently updated resume.
  let resumeText: string | undefined;
  if (session.usedResume) {
    const resume = await prisma.resume.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    if (resume) {
      resumeText = resumeToPlainText(normaliseResumeData(resume.data)).slice(0, 8000);
    }
  }

  const lastQuestion = session.questions[session.questions.length - 1];

  const generated = await generateNextQuestion({
    role: session.role,
    experienceLevel: session.experienceLevel,
    interviewType: session.interviewType,
    askedCount: session.questions.length,
    targetCount: session.questionCount,
    resumeText,
    lastQuestion: lastQuestion?.question,
    lastAnswer: lastQuestion?.answer ?? undefined,
    previousQuestions: session.questions.map((question) => question.question),
  });

  const question = await prisma.interviewQuestion.create({
    data: {
      sessionId: session.id,
      order: session.questions.length + 1,
      question: generated.question,
      category: generated.category,
      followUpOfId: generated.isFollowUp && lastQuestion ? lastQuestion.id : null,
    },
  });

  return NextResponse.json({
    question,
    demo: generated.demo,
    intent: generated.intent,
    remaining: session.questionCount - session.questions.length - 1,
  });
});
