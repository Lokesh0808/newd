import type { Metadata } from "next";

import { InterviewSetup } from "@/components/interview/interview-setup";
import { InterviewHistory, type HistorySession } from "@/components/interview/interview-history";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { normaliseResumeData } from "@/lib/resume/schema";

export const metadata: Metadata = {
  title: "Mock interview",
  description:
    "Practise with an AI mock interviewer that asks one question at a time and scores every answer on clarity, relevance, confidence and structure.",
};

export default async function InterviewPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  const [resumes, sessions] = userId
    ? await Promise.all([
        prisma.resume.findMany({
          where: { userId },
          orderBy: { updatedAt: "desc" },
          select: { id: true, title: true, data: true },
        }),
        prisma.interviewSession.findMany({
          where: { userId: userId },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            role: true,
            experienceLevel: true,
            interviewType: true,
            questionCount: true,
            status: true,
            overallScore: true,
            createdAt: true,
            questions: { select: { answer: true } },
          },
        }),
      ])
    : [[], []];

  const resumeOptions = resumes.map((resume) => {
    const data = normaliseResumeData(resume.data);
    return {
      id: resume.id,
      name: data.personal.fullName || resume.title,
      title: data.personal.title,
    };
  });

  const history: HistorySession[] = sessions.map((entry) => ({
    id: entry.id,
    role: entry.role,
    experienceLevel: entry.experienceLevel,
    interviewType: entry.interviewType,
    questionCount: entry.questionCount,
    status: entry.status,
    overallScore: entry.overallScore,
    createdAt: entry.createdAt.toISOString(),
    answeredCount: entry.questions.filter((question) => question.answer).length,
  }));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <InterviewSetup resumes={resumeOptions} defaultMode={params.mode} />

      {history.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-lg font-bold">Past interviews</h2>
          <InterviewHistory sessions={history} />
        </section>
      )}
    </div>
  );
}
