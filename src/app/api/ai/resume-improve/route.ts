import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireUser, withErrorHandling } from "@/lib/api";
import { improveResumeSection } from "@/lib/ai/resume";

const bodySchema = z.object({
  section: z.enum([
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "personal",
  ]),
  content: z.string().max(20000),
  role: z.string().max(200).optional(),
  jobDescription: z.string().max(20000).optional(),
});

/**
 * "Improve with AI" — rewrite one resume section.
 *
 * Returns the improved text plus a short explanation of what changed.
 */
export const POST = withErrorHandling(async (request: Request) => {
  await requireUser();

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid request.", 422, "VALIDATION_ERROR");
  }

  if (!parsed.data.content.trim()) {
    return apiError("Add some content before asking AI to improve it.", 422, "EMPTY_CONTENT");
  }

  const result = await improveResumeSection(parsed.data);

  return NextResponse.json(result);
});
