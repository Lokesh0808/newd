import { NextResponse } from "next/server";

import { apiError, requireUser, withErrorHandling } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { checkLimit } from "@/lib/entitlements";
import { emptyResumeData, normaliseResumeData, type ResumeData } from "@/lib/resume/schema";
import { getAccent, getFont, getTemplate } from "@/lib/resume/templates";

/** List every resume saved by the signed-in user, newest first. */
export const GET = withErrorHandling(async () => {
  const user = await requireUser();

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      template: true,
      accentColor: true,
      fontFamily: true,
      atsScore: true,
      createdAt: true,
      updatedAt: true,
      data: true,
    },
  });

  return NextResponse.json({
    resumes: resumes.map((resume) => ({
      ...resume,
      data: normaliseResumeData(resume.data),
      // Handy summary for the list view without opening the editor.
      preview: {
        name: (resume.data as ResumeData | null)?.personal?.fullName || resume.title,
        title: (resume.data as ResumeData | null)?.personal?.title || "",
        experienceCount: (resume.data as ResumeData | null)?.experience?.length ?? 0,
      },
    })),
  });
});

/** Create a new (blank) resume. */
export const POST = withErrorHandling(async (request: Request) => {
  const user = await requireUser();

  const limit = await checkLimit(user.id, user.plan, "resumes");
  if (!limit.allowed) {
    return apiError(limit.message ?? "Resume limit reached.", 402, "PLAN_LIMIT_REACHED");
  }

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    template?: string;
    accentColor?: string;
    fontFamily?: string;
    data?: unknown;
  };

  const data = body.data ? normaliseResumeData(body.data) : emptyResumeData();

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: body.title?.trim() || "Untitled resume",
      data: data as object,
      template: getTemplate(body.template).id,
      accentColor: getAccent(body.accentColor).id,
      fontFamily: getFont(body.fontFamily).id,
    },
  });

  return NextResponse.json({ resume: { ...resume, data } }, { status: 201 });
});
