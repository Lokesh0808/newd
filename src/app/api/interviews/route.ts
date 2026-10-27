import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireUser, withErrorHandling } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { checkLimit } from "@/lib/entitlements";
import { EXPERIENCE_LEVELS, INTERVIEW_TYPES } from "@/lib/interview/schema";

const createSchema = z.object({
  role: z.string().min(2, "Tell us which role you are interviewing for.").max(120),
  experienceLevel: z.enum(
    EXPERIENCE_LEVELS.map((level) => level.id) as [string, ...string[]],
  ),
  interviewType: z.enum(INTERVIEW_TYPES.map((type) => type.id) as [string, ...string[]]),
  questionCount: z.number().int().min(3).max(15),
  /** Resume used to personalise the questions. */
  resumeId: z.string().nullable().optional(),
});

/** List past interview sessions. */
export const GET = withErrorHandling(async () => {
  const user = await requireUser();

  const sessions = await prisma.interviewSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          question: true,
          answer: true,
          score: true,
          durationSeconds: true,
        },
      },
    },
  });

  return NextResponse.json({ sessions });
});

/** Start a new mock interview session. */
export const POST = withErrorHandling(async (request: Request) => {
  const user = await requireUser();

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid request.", 422, "VALIDATION_ERROR");
  }

  const limit = await checkLimit(user.id, user.plan, "interviews");
  if (!limit.allowed) {
    return apiError(limit.message ?? "Interview limit reached.", 402, "PLAN_LIMIT_REACHED");
  }

  // Resolve the optional resume used for personalisation.
  let usedResume = false;
  if (parsed.data.resumeId) {
    const resume = await prisma.resume.findUnique({
      where: { id: parsed.data.resumeId },
      select: { userId: true },
    });
    usedResume = Boolean(resume && resume.userId === user.id);
  }

  const session = await prisma.interviewSession.create({
    data: {
      userId: user.id,
      role: parsed.data.role.trim(),
      experienceLevel: parsed.data.experienceLevel,
      interviewType: parsed.data.interviewType,
      questionCount: parsed.data.questionCount,
      usedResume,
      status: "in_progress",
    },
  });

  return NextResponse.json({ session }, { status: 201 });
});
