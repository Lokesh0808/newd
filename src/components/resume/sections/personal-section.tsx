"use client";

import { Field, FieldGrid, TextAreaField } from "@/components/resume/fields";
import { ImproveButton } from "@/components/resume/improve-button";
import type { PersonalInfo } from "@/lib/resume/schema";

/** Step 1 — contact details + professional summary. */
export function PersonalSection({
  personal,
  onChange,
  jobDescription,
}: {
  personal: PersonalInfo;
  onChange: (patch: Partial<PersonalInfo>) => void;
  jobDescription?: string;
}) {
  return (
    <div className="space-y-5">
      <FieldGrid>
        <Field
          label="Full name"
          id="fullName"
          value={personal.fullName}
          onChange={(value) => onChange({ fullName: value })}
          placeholder="Ada Lovelace"
        />
        <Field
          label="Professional title"
          id="title"
          value={personal.title}
          onChange={(value) => onChange({ title: value })}
          placeholder="Senior Frontend Engineer"
        />
        <Field
          label="Email"
          id="email"
          type="email"
          value={personal.email}
          onChange={(value) => onChange({ email: value })}
          placeholder="you@example.com"
        />
        <Field
          label="Phone"
          id="phone"
          value={personal.phone}
          onChange={(value) => onChange({ phone: value })}
          placeholder="+1 555 0100"
        />
        <Field
          label="Location"
          id="location"
          value={personal.location}
          onChange={(value) => onChange({ location: value })}
          placeholder="Berlin, Germany"
        />
        <Field
          label="LinkedIn"
          id="linkedin"
          value={personal.linkedin}
          onChange={(value) => onChange({ linkedin: value })}
          placeholder="linkedin.com/in/you"
        />
        <Field
          label="Portfolio / website"
          id="website"
          value={personal.website}
          onChange={(value) => onChange({ website: value })}
          placeholder="yoursite.com"
        />
        <Field
          label="GitHub"
          id="github"
          value={personal.github}
          onChange={(value) => onChange({ github: value })}
          placeholder="github.com/you"
        />
      </FieldGrid>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Professional summary</p>
          <ImproveButton
            section="summary"
            content={personal.summary}
            role={personal.title}
            jobDescription={jobDescription}
            onApply={(improved) => onChange({ summary: improved })}
          />
        </div>
        <TextAreaField
          label=""
          id="summary"
          value={personal.summary}
          onChange={(value) => onChange({ summary: value })}
          rows={5}
          maxLength={800}
          placeholder="Two or three lines: who you are, your strongest skills and what you are looking for."
          hint="Lead with your role and years of experience, then your two strongest achievements."
        />
      </div>
    </div>
  );
}
