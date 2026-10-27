import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireUser, withErrorHandling } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { tailorResume } from "@/lib/ai/resume";
import { normaliseResumeData } from "@/lib/resume/schema";

const bodySchema = z.object({
  resumeId: z.string().min(1),
  jobDescription: z.string().min(40, "Paste a full job description to get a meaningful score."),
});

/**
 * Tailor a resume to a job description and return the new ATS score.
 *
 * The tailored content is persisted on the resume so the user keeps the result.
 */
export const POST = withErrorHandling(async (request: Request) => {
  const user = await requireUser();

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      parsed.error.issues[0]?.message ?? "Invalid request.",
      422,
      "VALIDATION_ERROR",
    );
  }

  const resume = await prisma.resume.findUnique({ where: { id: parsed.data.resumeId } });
  if (!resume || resume.userId !== user.id) {
    return apiError("Resume not found.", 404, "NOT_FOUND");
  }

  const current = normaliseResumeData(resume.data);
  const result = await tailorResume(current, parsed.data.jobDescription);

  // Persist the tailored content + the ATS report.
  await prisma.resume.update({
    where: { id: resume.id },
    data: {
      data: result.resume as object,
      jobDescription: parsed.data.jobDescription,
      atsScore: result.ats.score,
      atsMatched: result.ats.matched,
      atsMissing: result.ats.missing,
    },
  });

  return NextResponse.json({
    resume: result.resume,
    ats: result.ats,
    notes: result.notes,
    demo: result.demo,
  });
});
