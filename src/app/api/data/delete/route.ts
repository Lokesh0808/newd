import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireUser, withErrorHandling } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  /** The user must type their email address to confirm the deletion. */
  confirmEmail: z.string().email(),
  /** `data` removes only resumes + interviews, `account` removes everything. */
  scope: z.enum(["data", "account"]).default("account"),
});

/**
 * Delete the user's data — or their entire account.
 *
 * Privacy requirement: users can delete their data at any time.
 */
export const POST = withErrorHandling(async (request: Request) => {
  const user = await requireUser();

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid request.", 422, "VALIDATION_ERROR");
  }

  if (parsed.data.confirmEmail.toLowerCase() !== (user.email ?? "").toLowerCase()) {
    return apiError(
      "The email address does not match your account. Please type it exactly as it appears in your profile.",
      422,
      "EMAIL_MISMATCH",
    );
  }

  if (parsed.data.scope === "data") {
    // Delete content but keep the account.
    await prisma.$transaction([
      prisma.resume.deleteMany({ where: { userId: user.id } }),
      prisma.coverLetter.deleteMany({ where: { userId: user.id } }),
      prisma.interviewSession.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({ ok: true, scope: "data" });
  }

  // Full account deletion — cascades to resumes, interviews and cover letters.
  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ ok: true, scope: "account" });
});
