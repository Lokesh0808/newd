import { NextResponse } from "next/server";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  UnderlineType,
} from "docx";

import { apiError, requireUser, withErrorHandling } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { normaliseResumeData } from "@/lib/resume/schema";
import { getAccent, getFont } from "@/lib/resume/templates";

type RouteContext = { params: Promise<{ id: string }> };

const HEX_TO_DOCX = (hex: string) => hex.replace("#", "").toUpperCase();

/** Split a textarea value into bullet points. */
function bullets(text: string) {
  return text
    .split("\n")
    .map((line) => line.replace(/^[\s•\-*]+/, "").trim())
    .filter(Boolean);
}

/**
 * Download the resume as an editable Word document.
 *
 * Uses real Word styles (headings + list paragraphs) so the file stays
 * ATS friendly and easy to tweak.
 */
export const GET = withErrorHandling(async (_request: Request, context: RouteContext) => {
  const user = await requireUser();
  const { id } = await context.params;

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== user.id) {
    return apiError("Resume not found.", 404, "NOT_FOUND");
  }

  const data = normaliseResumeData(resume.data);
  const accent = HEX_TO_DOCX(getAccent(resume.accentColor).hex);
  const fontName = getFont(resume.fontFamily).family.split(",")[0].trim();

  const heading = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 220, after: 90 },
      border: {
        bottom: { color: accent, style: BorderStyle.SINGLE, size: 6, space: 3 },
      },
      children: [
        new TextRun({
          text: text.toUpperCase(),
          bold: true,
          size: 20,
          color: accent,
          font: fontName,
        }),
      ],
    });

  const bullet = (text: string) =>
    new Paragraph({
      bullet: { level: 0 },
      spacing: { after: 40 },
      children: [new TextRun({ text, size: 20, font: fontName })],
    });

  const body: Paragraph[] = [];

  // Header
  body.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: data.personal.fullName || "Your Name",
          bold: true,
          size: 40,
          color: accent,
          font: fontName,
        }),
      ],
    }),
  );

  if (data.personal.title) {
    body.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: data.personal.title, size: 22, color: "3F3F46", font: fontName }),
        ],
      }),
    );
  }

  const contact = [
    data.personal.email,
    data.personal.phone,
    data.personal.location,
    data.personal.linkedin,
    data.personal.website,
  ]
    .filter(Boolean)
    .join("  |  ");

  if (contact) {
    body.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: contact,
            size: 18,
            color: "52525B",
            font: fontName,
            underline: data.personal.linkedin ? { type: UnderlineType.NONE } : undefined,
          }),
        ],
      }),
    );
  }

  // Summary
  if (data.personal.summary) {
    body.push(heading("Professional Summary"));
    body.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: data.personal.summary, size: 20, font: fontName })],
      }),
    );
  }

  // Experience
  if (data.experience.length) {
    body.push(heading("Experience"));
    for (const experience of data.experience) {
      body.push(
        new Paragraph({
          spacing: { before: 120, after: 0 },
          tabStops: [{ type: AlignmentType.RIGHT, position: 9360 }],
          children: [
            new TextRun({ text: experience.position || "Position", bold: true, size: 21, font: fontName }),
            new TextRun({
              text: `\t${experience.startDate}${
                experience.endDate || experience.current ? " – " : ""
              }${experience.current ? "Present" : experience.endDate}`,
              size: 18,
              color: "71717A",
              font: fontName,
            }),
          ],
        }),
      );
      body.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${experience.company}${experience.location ? ` · ${experience.location}` : ""}`,
              size: 19,
              color: "3F3F46",
              font: fontName,
            }),
          ],
        }),
      );
      for (const line of bullets(experience.description)) body.push(bullet(line));
    }
  }

  // Projects
  if (data.projects.length) {
    body.push(heading("Projects"));
    for (const project of data.projects) {
      body.push(
        new Paragraph({
          spacing: { before: 120, after: 0 },
          children: [
            new TextRun({ text: project.name || "Project", bold: true, size: 21, font: fontName }),
            ...(project.link
              ? [
                  new TextRun({
                    text: `  ${project.link}`,
                    size: 18,
                    color: accent,
                    font: fontName,
                  }),
                ]
              : []),
          ],
        }),
      );
      if (project.tech) {
        body.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: project.tech, size: 19, color: "3F3F46", font: fontName })],
          }),
        );
      }
      for (const line of bullets(project.description)) body.push(bullet(line));
    }
  }

  // Education
  if (data.education.length) {
    body.push(heading("Education"));
    for (const education of data.education) {
      body.push(
        new Paragraph({
          spacing: { before: 120, after: 0 },
          children: [
            new TextRun({
              text: `${education.degree}${education.field ? `, ${education.field}` : ""}`,
              bold: true,
              size: 21,
              font: fontName,
            }),
            new TextRun({
              text: `\t${education.startDate}${education.endDate ? " – " : ""}${education.endDate}`,
              size: 18,
              color: "71717A",
              font: fontName,
            }),
          ],
        }),
      );
      body.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${education.institution}${education.location ? ` · ${education.location}` : ""}`,
              size: 19,
              color: "3F3F46",
              font: fontName,
            }),
          ],
        }),
      );
      for (const line of bullets(education.description)) body.push(bullet(line));
    }
  }

  // Skills
  if (data.skills.length) {
    body.push(heading("Skills"));
    body.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: data.skills.map((skill) => skill.name).filter(Boolean).join("  •  "),
            size: 20,
            font: fontName,
          }),
        ],
      }),
    );
  }

  // Certifications
  if (data.certifications.length) {
    body.push(heading("Certifications"));
    for (const certification of data.certifications) {
      body.push(
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: certification.name, bold: true, size: 20, font: fontName }),
            new TextRun({
              text: `  ${certification.issuer}${certification.date ? ` · ${certification.date}` : ""}`,
              size: 18,
              color: "71717A",
              font: fontName,
            }),
          ],
        }),
      );
    }
  }

  const document = new Document({
    creator: "CareerAI",
    title: `${data.personal.fullName || "Resume"} — Resume`,
    description: "Resume generated with CareerAI",
    styles: {
      default: {
        document: { run: { font: fontName, size: 20 } },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
        },
        children: body,
      },
    ],
  });

  const buffer = await Packer.toBuffer(document);
  const fileName = `${(data.personal.fullName || "resume").replace(/[^\w\-]+/g, "-").toLowerCase()}-resume.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
});
