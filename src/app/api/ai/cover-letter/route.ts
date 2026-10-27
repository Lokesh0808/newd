import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireUser, withErrorHandling } from "@/lib/api";
import { generateCoverLetter } from "@/lib/ai/resume";
import { normaliseResumeData } from "@/lib/resume/schema";

const bodySchema = z.object({
  resume: z.unknown(),
  jobDescription: z.string().max(30000).default(""),
  jobTitle: z.string().max(200).default(""),
  company: z.string().max(200).default(""),
  tone: z.enum(["professional", "enthusiastic", "concise"]).default("professional"),
});

/** Generate a cover letter from the resume + job description. */
export const POST = withErrorHandling(async (request: Request) => {
  await requireUser();

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid request.", 422, "VALIDATION_ERROR");
  }

  const resume = normaliseResumeData(parsed.data.resume);
  if (!resume.personal.fullName) {
    return apiError("Add your name to the resume before generating a cover letter.", 422, "EMPTY_RESUME");
  }

  const result = await generateCoverLetter({
    resume,
    jobDescription: parsed.data.jobDescription,
    jobTitle: parsed.data.jobTitle,
    company: parsed.data.company,
    tone: parsed.data.tone,
  });

  return NextResponse.json(result);
});
