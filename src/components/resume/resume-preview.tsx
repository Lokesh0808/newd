"use client";

import * as React from "react";
import { Mail, MapPin, Phone } from "lucide-react";

import type { ResumeData } from "@/lib/resume/schema";
import { getAccent, getFont, getTemplate } from "@/lib/resume/templates";
import { cn } from "@/lib/utils";

/**
 * Section heading used inside the preview.
 *
 * Defined at module scope (not inside the render function) so React does not
 * remount it on every render.
 */
function SectionTitle({
  children,
  accentHex,
  centered,
}: {
  children: React.ReactNode;
  accentHex: string;
  centered: boolean;
}) {
  return (
    <h2
      className={cn(
        "mt-4 border-b pb-1 text-[9.5px] font-bold uppercase tracking-[0.14em]",
        centered ? "text-center" : "text-left",
      )}
      style={{ color: accentHex, borderColor: accentHex }}
    >
      {children}
    </h2>
  );
}

/**
 * Live A4 preview of the resume.
 *
 * Mirrors the PDF renderer closely so what the user sees is what they get.
 * Everything is plain text in a single column — ATS friendly.
 */
export function ResumePreview({
  data,
  template,
  accentColor,
  fontFamily,
  className,
}: {
  data: ResumeData;
  template: string;
  accentColor: string;
  fontFamily: string;
  className?: string;
}) {
  const accent = getAccent(accentColor);
  const font = getFont(fontFamily);
  const variant = getTemplate(template);

  const dense = template === "compact" || template === "technical" || template === "minimal";
  const centered = template === "classic" || template === "executive";

  const bullets = (text: string) =>
    text
      .split("\n")
      .map((line) => line.replace(/^[\s•\-*]+/, "").trim())
      .filter(Boolean);

  const contactItems = [
    data.personal.email && { icon: Mail, value: data.personal.email },
    data.personal.phone && { icon: Phone, value: data.personal.phone },
    data.personal.location && { icon: MapPin, value: data.personal.location },
  ].filter(Boolean) as { icon: typeof Mail; value: string }[];

  const text = [
    data.personal.linkedin && data.personal.linkedin.replace(/^https?:\/\//, ""),
    data.personal.website && data.personal.website.replace(/^https?:\/\//, ""),
    data.personal.github && data.personal.github.replace(/^https?:\/\//, ""),
  ].filter(Boolean);

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[794px] bg-white text-zinc-800 shadow-xl ring-1 ring-black/5 dark:bg-zinc-50",
        className,
      )}
      style={{
        fontFamily: `${font.family}, sans-serif`,
        // A4 proportions: 210mm x 297mm
        aspectRatio: "210 / 297",
      }}
    >
      <div
        className={cn(
          "h-full overflow-hidden px-[7%] py-[6%]",
          dense ? "text-[8px] leading-[1.45]" : "text-[9px] leading-[1.55]",
          variant.pageClass,
        )}
      >
        {/* -------------------------------------------------------- Header */}
        <header className={cn(centered ? "text-center" : "text-left")}>
          <h1
            className="font-bold leading-tight"
            style={{ color: accent.hex, fontSize: dense ? "17px" : "20px" }}
          >
            {data.personal.fullName || "Your Name"}
          </h1>
          {data.personal.title && (
            <p className="mt-0.5 text-[10px] text-zinc-600">{data.personal.title}</p>
          )}
          <div
            className={cn(
              "mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[8px] text-zinc-500",
              centered && "justify-center",
            )}
          >
            {contactItems.map((item) => (
              <span key={item.value} className="inline-flex items-center gap-1">
                <item.icon className="h-2.5 w-2.5" aria-hidden />
                {item.value}
              </span>
            ))}
            {text.map((value) => (
              <span key={value} className="text-zinc-500">
                {value}
              </span>
            ))}
          </div>
        </header>

        {/* ------------------------------------------------------- Summary */}
        {data.personal.summary && (
          <section>
            <SectionTitle accentHex={accent.hex} centered={centered}>Professional Summary</SectionTitle>
            <p className="mt-1.5 leading-relaxed">{data.personal.summary}</p>
          </section>
        )}

        {/* ----------------------------------------------------- Experience */}
        {data.experience.length > 0 && (
          <section>
            <SectionTitle accentHex={accent.hex} centered={centered}>Experience</SectionTitle>
            <div className="mt-1.5 space-y-2">
              {data.experience.map((experience) => (
                <div key={experience.id}>
                  <div
                    className={cn(
                      "flex items-baseline justify-between gap-2",
                      centered && "flex-col items-center gap-0",
                    )}
                  >
                    <span className="font-semibold">{experience.position || "Position"}</span>
                    <span className="text-[8px] text-zinc-500">
                      {experience.startDate}
                      {experience.endDate || experience.current ? " – " : ""}
                      {experience.current ? "Present" : experience.endDate}
                    </span>
                  </div>
                  <p className="text-[8.5px] text-zinc-600">
                    {experience.company}
                    {experience.location ? ` · ${experience.location}` : ""}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {bullets(experience.description).map((line, index) => (
                      <li key={index} className="flex gap-1.5">
                        <span style={{ color: accent.hex }}>•</span>
                        <span className="flex-1">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------- Projects */}
        {data.projects.length > 0 && (
          <section>
            <SectionTitle accentHex={accent.hex} centered={centered}>Projects</SectionTitle>
            <div className="mt-1.5 space-y-2">
              {data.projects.map((project) => (
                <div key={project.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold">{project.name || "Project"}</span>
                    {project.link && (
                      <span className="truncate text-[8px]" style={{ color: accent.hex }}>
                        {project.link.replace(/^https?:\/\//, "")}
                      </span>
                    )}
                  </div>
                  {project.tech && <p className="text-[8.5px] text-zinc-600">{project.tech}</p>}
                  <ul className="mt-1 space-y-0.5">
                    {bullets(project.description).map((line, index) => (
                      <li key={index} className="flex gap-1.5">
                        <span style={{ color: accent.hex }}>•</span>
                        <span className="flex-1">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------ Education */}
        {data.education.length > 0 && (
          <section>
            <SectionTitle accentHex={accent.hex} centered={centered}>Education</SectionTitle>
            <div className="mt-1.5 space-y-2">
              {data.education.map((education) => (
                <div key={education.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold">
                      {education.degree}
                      {education.field ? `, ${education.field}` : ""}
                    </span>
                    <span className="text-[8px] text-zinc-500">
                      {education.startDate}
                      {education.endDate ? " – " : ""}
                      {education.endDate}
                    </span>
                  </div>
                  <p className="text-[8.5px] text-zinc-600">
                    {education.institution}
                    {education.location ? ` · ${education.location}` : ""}
                  </p>
                  {education.description && (
                    <ul className="mt-1 space-y-0.5">
                      {bullets(education.description).map((line, index) => (
                        <li key={index} className="flex gap-1.5">
                          <span style={{ color: accent.hex }}>•</span>
                          <span className="flex-1">{line}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --------------------------------------------------------- Skills */}
        {data.skills.length > 0 && (
          <section>
            <SectionTitle accentHex={accent.hex} centered={centered}>Skills</SectionTitle>
            <p className="mt-1.5 leading-relaxed">
              {data.skills.map((skill) => skill.name).filter(Boolean).join("  •  ")}
            </p>
          </section>
        )}

        {/* ------------------------------------------------- Certifications */}
        {data.certifications.length > 0 && (
          <section>
            <SectionTitle accentHex={accent.hex} centered={centered}>Certifications</SectionTitle>
            <div className="mt-1.5 space-y-1">
              {data.certifications.map((certification) => (
                <div key={certification.id} className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold">{certification.name}</span>
                  <span className="text-[8px] text-zinc-500">
                    {certification.issuer}
                    {certification.date ? ` · ${certification.date}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {data.experience.length === 0 &&
          data.education.length === 0 &&
          !data.personal.summary && (
            <div className="mt-10 rounded-lg border border-dashed border-zinc-300 p-6 text-center">
              <p className="text-[10px] font-medium text-zinc-500">Your resume preview</p>
              <p className="mt-1 text-[8.5px] text-zinc-400">
                Fill in the form and it will appear here in real time.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
