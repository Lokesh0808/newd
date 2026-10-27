import { NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import React from "react";

import { apiError, requireUser, withErrorHandling } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { normaliseResumeData } from "@/lib/resume/schema";
import { ResumePdfDocument } from "@/lib/resume/pdf-document";

type RouteContext = { params: Promise<{ id: string }> };

/** Download the resume as a PDF file. */
export const GET = withErrorHandling(async (_request: Request, context: RouteContext) => {
  const user = await requireUser();
  const { id } = await context.params;

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== user.id) {
    return apiError("Resume not found.", 404, "NOT_FOUND");
  }

  const data = normaliseResumeData(resume.data);

  const buffer = await renderToBuffer(
    React.createElement(ResumePdfDocument as React.FC<DocumentProps>, {
      data,
      template: resume.template,
      accentColor: resume.accentColor,
      fontFamily: resume.fontFamily,
    } as unknown as DocumentProps),
  );

  const fileName = `${(data.personal.fullName || "resume").replace(/[^\w\-]+/g, "-").toLowerCase()}-resume.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
});
