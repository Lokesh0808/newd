import { NextResponse } from "next/server";

import { apiError, requireUser, withErrorHandling } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { checkLimit } from "@/lib/entitlements";
import { extractTextFromFile, MAX_UPLOAD_BYTES } from "@/lib/ai/extract";
import { parseResumeText } from "@/lib/ai/resume";

/**
 * Upload an existing resume (PDF / DOCX / TXT).
 *
 * The file is converted to plain text on the server, parsed into structured
 * fields by Claude, and saved as a new resume the user can edit.
 */
export const POST = withErrorHandling(async (request: Request) => {
  const user = await requireUser();

  const limit = await checkLimit(user.id, user.plan, "uploads");
  if (!limit.allowed) {
    return apiError(limit.message ?? "Upload limit reached.", 402, "PLAN_LIMIT_REACHED");
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return apiError("Choose a file to upload.", 422, "NO_FILE");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return apiError("That file is larger than 10 MB. Please upload a smaller file.", 413, "FILE_TOO_LARGE");
  }

  let text: string;
  try {
    text = await extractTextFromFile(file);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "We could not read that file.",
      422,
      "PARSE_FAILED",
    );
  }

  if (!text || text.length < 30) {
    return apiError(
      "We could not find any readable text in that file. If it is a scanned document, export it with a text layer first.",
      422,
      "NO_TEXT",
    );
  }

  const parsed = await parseResumeText(text, file.name);

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: `[imported] ${parsed.resume.personal.fullName || file.name}`,
      data: parsed.resume as object,
    },
  });

  return NextResponse.json({
    resume: { ...resume, data: parsed.resume },
    warnings: parsed.warnings,
    demo: parsed.demo,
  });
});
