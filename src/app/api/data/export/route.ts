import { NextResponse } from "next/server";

import { requireUser, withErrorHandling } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { normaliseResumeData } from "@/lib/resume/schema";

/**
 * Export everything we hold about the user as a JSON file.
 *
 * Privacy requirement: a user can always take their data with them.
 */
export const GET = withErrorHandling(async () => {
  const user = await requireUser();

  const [resumes, interviews, coverLetters, dbUser] = await Promise.all([
    prisma.resume.findMany({ where: { userId: user.id } }),
    prisma.interviewSession.findMany({
      where: { userId: user.id },
      include: { questions: { orderBy: { order: "asc" } } },
    }),
    prisma.coverLetter.findMany({ where: { userId: user.id } }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true, plan: true, createdAt: true },
    }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    account: {
      email: dbUser?.email ?? user.email,
      name: dbUser?.name ?? user.name,
      plan: dbUser?.plan ?? user.plan,
      createdAt: dbUser?.createdAt ?? new Date(),
    },
    resumes: resumes.map((resume) => ({
      id: resume.id,
      title: resume.title,
      template: resume.template,
      accentColor: resume.accentColor,
      fontFamily: resume.fontFamily,
      atsScore: resume.atsScore,
      jobDescription: resume.jobDescription,
      data: normaliseResumeData(resume.data),
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    })),
    coverLetters,
    interviews: interviews.map((interview) => ({
      id: interview.id,
      role: interview.role,
      experienceLevel: interview.experienceLevel,
      interviewType: interview.interviewType,
      status: interview.status,
      overallScore: interview.overallScore,
      scores: interview.scores,
      strengths: interview.strengths,
      weaknesses: interview.weaknesses,
      tips: interview.tips,
      sampleAnswers: interview.sampleAnswers,
      createdAt: interview.createdAt,
      completedAt: interview.completedAt,
      questions: interview.questions.map((question) => ({
        order: question.order,
        question: question.question,
        answer: question.answer,
        score: question.score,
        scores: question.scores,
        feedback: question.feedback,
        betterAnswer: question.betterAnswer,
        durationSeconds: question.durationSeconds,
      })),
    })),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="careerai-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
});
