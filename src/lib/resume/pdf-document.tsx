import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  type DocumentProps,
} from "@react-pdf/renderer";

import type { ResumeData } from "@/lib/resume/schema";
import { getAccent, getFont, getTemplate } from "@/lib/resume/templates";

/**
 * PDF renderer for the resume maker.
 *
 * The layout is deliberately ATS friendly: a single column, standard section
 * headings, real text (never images) and no tables — which is exactly what
 * applicant tracking systems parse reliably.
 */

const FONTS = {
  inter: "Helvetica",
  georgia: "Times-Roman",
  arial: "Helvetica",
  calibri: "Helvetica",
  mono: "Courier",
  merriweather: "Times-Roman",
} as const;

const FONT_BOLD = {
  inter: "Helvetica-Bold",
  georgia: "Times-Bold",
  arial: "Helvetica-Bold",
  calibri: "Helvetica-Bold",
  mono: "Courier-Bold",
  merriweather: "Times-Bold",
} as const;

/** Per-template layout tweaks. */
function templateStyles(template: string) {
  switch (template) {
    case "classic":
      return { titleAlign: "center" as const, headingUpper: true, density: 1, rule: false };
    case "minimal":
      return { titleAlign: "left" as const, headingUpper: false, density: 0.85, rule: false };
    case "compact":
      return { titleAlign: "left" as const, headingUpper: true, density: 0.78, rule: true };
    case "executive":
      return { titleAlign: "center" as const, headingUpper: true, density: 0.95, rule: false };
    case "technical":
      return { titleAlign: "left" as const, headingUpper: true, density: 0.85, rule: true };
    default:
      return { titleAlign: "left" as const, headingUpper: true, density: 1, rule: true };
  }
}

export interface ResumePdfProps {
  data: ResumeData;
  template: string;
  accentColor: string;
  fontFamily: string;
}

export function ResumePdfDocument({
  data,
  template,
  accentColor,
  fontFamily,
}: ResumePdfProps) {
  const accent = getAccent(accentColor);
  const font = getFont(fontFamily);
  const variant = templateStyles(getTemplate(template).id);
  const family = FONTS[font.id as keyof typeof FONTS] ?? "Helvetica";
  const familyBold = FONT_BOLD[font.id as keyof typeof FONT_BOLD] ?? "Helvetica-Bold";

  const styles = StyleSheet.create({
    page: {
      paddingTop: 36,
      paddingBottom: 42,
      paddingHorizontal: 42,
      fontFamily: family,
      fontSize: variant.density <= 0.85 ? 8.6 : 9.4,
      color: "#1a1a1a",
      lineHeight: 1.42,
    },
    header: {
      marginBottom: 12,
      textAlign: variant.titleAlign,
    },
    name: {
      fontFamily: familyBold,
      fontSize: 20,
      color: accent.hex,
      letterSpacing: 0.2,
    },
    jobTitle: {
      fontSize: 10.5,
      color: "#3f3f46",
      marginTop: 2,
    },
    contact: {
      marginTop: 6,
      fontSize: 8.6,
      color: "#52525b",
    },
    contactRow: {
      marginTop: 6,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: variant.titleAlign === "center" ? "center" : "flex-start",
    },
    section: {
      marginTop: 12,
    },
    sectionTitle: {
      fontFamily: familyBold,
      fontSize: 9.6,
      color: accent.hex,
      letterSpacing: variant.headingUpper ? 1 : 0,
      textTransform: variant.headingUpper ? "uppercase" : "none",
      marginBottom: 5,
      paddingBottom: 2,
      borderBottomWidth: variant.rule ? 0.8 : 0,
      borderBottomColor: accent.hex,
      borderBottomStyle: "solid",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 1,
    },
    rowTitle: {
      fontFamily: familyBold,
      fontSize: 9.8,
      color: "#18181b",
    },
    rowMeta: {
      fontSize: 8.4,
      color: "#71717a",
    },
    rowSub: {
      fontSize: 8.8,
      color: "#3f3f46",
      marginBottom: 1,
    },
    bullet: {
      flexDirection: "row",
      marginBottom: 1.5,
      paddingLeft: 4,
    },
    bulletMark: {
      width: 9,
      color: accent.hex,
      fontFamily: familyBold,
    },
    bulletText: {
      flex: 1,
      color: "#27272a",
    },
    summary: {
      color: "#27272a",
    },
    skillChip: {
      fontSize: 8.8,
      color: "#27272a",
      marginRight: 10,
      marginBottom: 2,
    },
    link: {
      color: accent.hex,
      textDecoration: "none",
    },
  });

  const contactParts = [
    data.personal.email,
    data.personal.phone,
    data.personal.location,
    data.personal.linkedin,
    data.personal.website,
    data.personal.github,
  ].filter(Boolean) as string[];

  const bullets = (text: string) =>
    text
      .split("\n")
      .map((line) => line.replace(/^[\s•\-*]+/, "").trim())
      .filter(Boolean);

  return (
    <Document
      title={`${data.personal.fullName || "Resume"} — Resume`}
      author={data.personal.fullName || "CareerAI"}
      subject="Resume"
      creator="CareerAI"
      producer="CareerAI"
    >
      <Page size="A4" style={styles.page}>
        {/* ---------------------------------------------------------- Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.personal.fullName || "Your Name"}</Text>
          {data.personal.title ? <Text style={styles.jobTitle}>{data.personal.title}</Text> : null}
          {contactParts.length ? (
            <View style={styles.contactRow}>
              {contactParts.map((part, index) => (
                <Text key={part} style={styles.contact}>
                  {index > 0 ? "  |  " : ""}
                  {part}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        {/* --------------------------------------------------------- Summary */}
        {data.personal.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{data.personal.summary}</Text>
          </View>
        ) : null}

        {/* ------------------------------------------------------- Experience */}
        {data.experience.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experience.map((experience) => (
              <View key={experience.id} wrap={false}>
                <View style={styles.row}>
                  <Text style={styles.rowTitle}>{experience.position || "Position"}</Text>
                  <Text style={styles.rowMeta}>
                    {experience.startDate}
                    {experience.endDate || experience.current ? " – " : ""}
                    {experience.current ? "Present" : experience.endDate}
                  </Text>
                </View>
                <Text style={styles.rowSub}>
                  {experience.company}
                  {experience.location ? ` · ${experience.location}` : ""}
                </Text>
                {bullets(experience.description).map((line, index) => (
                  <View key={index} style={styles.bullet}>
                    <Text style={styles.bulletMark}>•</Text>
                    <Text style={styles.bulletText}>{line}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* -------------------------------------------------------- Projects */}
        {data.projects.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((project) => (
              <View key={project.id} wrap={false}>
                <View style={styles.row}>
                  <Text style={styles.rowTitle}>{project.name || "Project"}</Text>
                  {project.link ? <Text style={styles.rowMeta}>{project.link}</Text> : null}
                </View>
                {project.tech ? <Text style={styles.rowSub}>{project.tech}</Text> : null}
                {bullets(project.description).map((line, index) => (
                  <View key={index} style={styles.bullet}>
                    <Text style={styles.bulletMark}>•</Text>
                    <Text style={styles.bulletText}>{line}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* -------------------------------------------------------- Education */}
        {data.education.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((education) => (
              <View key={education.id} wrap={false}>
                <View style={styles.row}>
                  <Text style={styles.rowTitle}>
                    {education.degree}
                    {education.field ? `, ${education.field}` : ""}
                  </Text>
                  <Text style={styles.rowMeta}>
                    {education.startDate}
                    {education.endDate ? " – " : ""}
                    {education.endDate}
                  </Text>
                </View>
                <Text style={styles.rowSub}>
                  {education.institution}
                  {education.location ? ` · ${education.location}` : ""}
                </Text>
                {bullets(education.description).map((line, index) => (
                  <View key={index} style={styles.bullet}>
                    <Text style={styles.bulletMark}>•</Text>
                    <Text style={styles.bulletText}>{line}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* ----------------------------------------------------------- Skills */}
        {data.skills.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {data.skills.map((skill) => (
                <Text key={skill.id} style={styles.skillChip}>
                  {skill.name}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {/* -------------------------------------------------- Certifications */}
        {data.certifications.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {data.certifications.map((certification) => (
              <View key={certification.id} style={styles.row}>
                <Text style={styles.rowTitle}>{certification.name}</Text>
                <Text style={styles.rowMeta}>
                  {certification.issuer}
                  {certification.date ? ` · ${certification.date}` : ""}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export type { DocumentProps };
