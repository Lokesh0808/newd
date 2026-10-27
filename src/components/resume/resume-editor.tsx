"use client";

import * as React from "react";
import {
  Award,
  Briefcase,
  Check,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  Palette,
  Sparkles,
  User,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { ResumePreview } from "@/components/resume/resume-preview";
import { PersonalSection } from "@/components/resume/sections/personal-section";
import { ExperienceSection } from "@/components/resume/sections/experience-section";
import { EducationSection } from "@/components/resume/sections/education-section";
import { SkillsSection } from "@/components/resume/sections/skills-section";
import { ProjectsSection } from "@/components/resume/sections/projects-section";
import { CertificationsSection } from "@/components/resume/sections/certifications-section";
import { DesignPanel } from "@/components/resume/design-panel";
import { AtsPanel } from "@/components/resume/ats-panel";
import { CoverLetterDialog } from "@/components/resume/cover-letter-dialog";

import type { ResumeData } from "@/lib/resume/schema";

/** The six steps of the resume builder. */
const SECTIONS = [
  { id: "personal", label: "Personal", title: "Personal info & summary", icon: User },
  { id: "experience", label: "Experience", title: "Work experience", icon: Briefcase },
  { id: "education", label: "Education", title: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", title: "Skills", icon: Wrench },
  { id: "projects", label: "Projects", title: "Projects", icon: FileText },
  { id: "certifications", label: "Certifications", title: "Certifications", icon: Award },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/** The fields persisted back to the server on every autosave. */
interface EditorPayload {
  data: ResumeData;
  template: string;
  accentColor: string;
  fontFamily: string;
  title: string;
  jobDescription: string;
}

export interface ResumeEditorProps {
  resume: {
    id: string;
    title: string;
    data: ResumeData;
    template: string;
    accentColor: string;
    fontFamily: string;
    jobDescription?: string | null;
    atsScore?: number | null;
    atsMatched?: string[];
    atsMissing?: string[];
  };
}

export function ResumeEditor({ resume }: ResumeEditorProps) {
  // --- Local editing state -------------------------------------------------
  const [data, setData] = React.useState<ResumeData>(resume.data);
  const [template, setTemplate] = React.useState(resume.template);
  const [accentColor, setAccentColor] = React.useState(resume.accentColor);
  const [fontFamily, setFontFamily] = React.useState(resume.fontFamily);
  const [title, setTitle] = React.useState(resume.title);
  const [jobDescription, setJobDescription] = React.useState(resume.jobDescription ?? "");
  const [atsScore, setAtsScore] = React.useState<number | null>(resume.atsScore ?? null);
  const [atsMissing, setAtsMissing] = React.useState<string[]>(resume.atsMissing ?? []);

  const [activeSection, setActiveSection] = React.useState<SectionId>("personal");
  const [designOpen, setDesignOpen] = React.useState(false);
  const [atsOpen, setAtsOpen] = React.useState(false);
  const [coverLetterOpen, setCoverLetterOpen] = React.useState(false);
  const [mobileView, setMobileView] = React.useState<"edit" | "preview">("edit");

  const [saveState, setSaveState] = React.useState<"idle" | "saving" | "saved">("idle");

  // --- Autosave ------------------------------------------------------------
  // The newest payload lives in a ref so pending edits can be flushed when
  // the user navigates away before the debounce elapses.
  const pending = React.useRef<EditorPayload | null>(null);
  const dirty = React.useRef(false);

  React.useEffect(() => {
    pending.current = { data, template, accentColor, fontFamily, title, jobDescription };
  }, [data, template, accentColor, fontFamily, title, jobDescription]);

  const persist = React.useCallback(async () => {
    const payload = pending.current;
    if (!payload) return;

    dirty.current = false;
    setSaveState("saving");

    try {
      const response = await fetch(`/api/resumes/${resume.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error ?? "Could not save your changes.");
      }
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 2000);
    } catch (error) {
      setSaveState("idle");
      toast.error(error instanceof Error ? error.message : "Could not save your changes.");
    }
  }, [resume.id]);

  // Debounced autosave — fires 1.2 s after the last edit.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (dirty.current) void persist();
    }, 1200);
    return () => clearTimeout(timer);
  }, [data, template, accentColor, fontFamily, title, jobDescription, persist]);

  // Flush pending changes when the editor unmounts.
  React.useEffect(
    () => () => {
      if (dirty.current) void persist();
    },
    [persist],
  );

  function markDirty() {
    dirty.current = true;
    setSaveState("saving");
  }

  function update(next: Partial<ResumeData>) {
    setData((current) => ({ ...current, ...next }));
    markDirty();
  }

  // --- Export --------------------------------------------------------------
  async function download(format: "pdf" | "docx") {
    // Flush any pending edits before exporting.
    await persist();

    const link = document.createElement("a");
    link.href = `/api/resumes/${resume.id}/${format}`;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success(`Your ${format.toUpperCase()} is downloading.`);
  }

  const currentSection = SECTIONS.find((section) => section.id === activeSection) ?? SECTIONS[0];

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {/* ------------------------------------------------------------ Toolbar */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              markDirty();
            }}
            aria-label="Resume title"
            className="h-9 max-w-[260px] border-transparent bg-transparent font-semibold shadow-none hover:border-input focus-visible:border-input"
          />

          {/* Save indicator */}
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {saveState === "saving" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Saving…
              </>
            ) : saveState === "saved" ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" aria-hidden />
                Saved
              </>
            ) : (
              "All changes saved"
            )}
          </span>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {atsScore != null && (
              <Badge variant={atsScore >= 75 ? "success" : atsScore >= 50 ? "warning" : "destructive"}>
                ATS {atsScore}/100
                {atsMissing.length > 0 ? ` · ${atsMissing.length} missing` : ""}
              </Badge>
            )}

            <Button type="button" variant="outline" size="sm" onClick={() => setDesignOpen(true)}>
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Design</span>
            </Button>

            <Button type="button" variant="outline" size="sm" onClick={() => setAtsOpen(true)}>
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Tailor & score</span>
            </Button>

            <Button type="button" variant="outline" size="sm" onClick={() => setCoverLetterOpen(true)}>
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Cover letter</span>
            </Button>

            <Separator orientation="vertical" className="hidden h-6 sm:block" />

            <Button type="button" variant="outline" size="sm" onClick={() => void download("docx")}>
              <Download className="h-4 w-4" />
              DOCX
            </Button>
            <Button type="button" size="sm" onClick={() => void download("pdf")}>
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Mobile view switch */}
        <div className="flex border-t border-border px-4 py-2 lg:hidden">
          <Tabs
            value={mobileView}
            onValueChange={(value) => setMobileView(value as "edit" | "preview")}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="edit" className="flex-1">
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1">
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* -------------------------------------------------------------- Body */}
      <div className="mx-auto grid w-full max-w-[1600px] flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:gap-10">
        {/* Form column */}
        <div className={cn("min-w-0", mobileView === "preview" && "hidden lg:block")}>
          {/* Step navigation */}
          <nav className="mb-6 flex flex-wrap gap-2" aria-label="Resume sections">
            {SECTIONS.map((section, index) => {
              const active = section.id === activeSection;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors",
                    active
                      ? "border-brand-300 bg-brand-500/10 text-brand-700 dark:text-brand-200"
                      : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-4.5 w-4.5 place-items-center rounded-full text-[10px] font-bold",
                      active ? "bg-brand-gradient text-white" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </span>
                  {section.label}
                </button>
              );
            })}
          </nav>

          <div className="rounded-xl border border-border bg-card/60 p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-brand-600 dark:text-brand-300">
                <currentSection.icon className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold">{currentSection.title}</h2>
                <p className="text-xs text-muted-foreground">
                  Step {SECTIONS.findIndex((s) => s.id === activeSection) + 1} of {SECTIONS.length}
                </p>
              </div>
            </div>

            {activeSection === "personal" && (
              <PersonalSection
                personal={data.personal}
                jobDescription={jobDescription}
                onChange={(patch) => update({ personal: { ...data.personal, ...patch } })}
              />
            )}
            {activeSection === "experience" && (
              <ExperienceSection
                items={data.experience}
                jobDescription={jobDescription}
                onChange={(experience) => update({ experience })}
              />
            )}
            {activeSection === "education" && (
              <EducationSection
                items={data.education}
                jobDescription={jobDescription}
                onChange={(education) => update({ education })}
              />
            )}
            {activeSection === "skills" && (
              <SkillsSection
                items={data.skills}
                jobDescription={jobDescription}
                onChange={(skills) => update({ skills })}
              />
            )}
            {activeSection === "projects" && (
              <ProjectsSection
                items={data.projects}
                jobDescription={jobDescription}
                onChange={(projects) => update({ projects })}
              />
            )}
            {activeSection === "certifications" && (
              <CertificationsSection
                items={data.certifications}
                jobDescription={jobDescription}
                onChange={(certifications) => update({ certifications })}
              />
            )}
          </div>

          {/* Step navigation buttons */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={activeSection === SECTIONS[0].id}
              onClick={() => {
                const index = SECTIONS.findIndex((s) => s.id === activeSection);
                setActiveSection(SECTIONS[Math.max(0, index - 1)].id);
              }}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={activeSection === SECTIONS[SECTIONS.length - 1].id}
              onClick={() => {
                const index = SECTIONS.findIndex((s) => s.id === activeSection);
                setActiveSection(SECTIONS[Math.min(SECTIONS.length - 1, index + 1)].id);
              }}
            >
              Next step
            </Button>
          </div>
        </div>

        {/* Preview column */}
        <div
          className={cn(
            "min-w-0 lg:sticky lg:top-[9.5rem] lg:self-start",
            mobileView === "edit" && "hidden lg:block",
          )}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Live preview</p>
            <p className="text-xs text-muted-foreground">A4 · what you see is what you export</p>
          </div>
          <ResumePreview
            data={data}
            template={template}
            accentColor={accentColor}
            fontFamily={fontFamily}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------ Dialogs */}
      <DesignPanel
        open={designOpen}
        onOpenChange={setDesignOpen}
        template={template}
        accentColor={accentColor}
        fontFamily={fontFamily}
        onTemplateChange={(value) => {
          setTemplate(value);
          markDirty();
        }}
        onAccentChange={(value) => {
          setAccentColor(value);
          markDirty();
        }}
        onFontChange={(value) => {
          setFontFamily(value);
          markDirty();
        }}
      />

      <AtsPanel
        open={atsOpen}
        onOpenChange={setAtsOpen}
        resumeId={resume.id}
        jobDescription={jobDescription}
        onJobDescriptionChange={setJobDescription}
        currentScore={atsScore}
        onScore={(score, missing) => {
          setAtsScore(score);
          setAtsMissing(missing);
        }}
        onTailored={(tailored) => {
          setData(tailored);
          markDirty();
        }}
      />

      <CoverLetterDialog
        open={coverLetterOpen}
        onOpenChange={setCoverLetterOpen}
        resume={data}
        jobDescription={jobDescription}
      />
    </div>
  );
}
