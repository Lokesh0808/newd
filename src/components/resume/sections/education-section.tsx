"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImproveButton } from "@/components/resume/improve-button";
import { AddButton } from "@/components/resume/sections/experience-section";
import type { Education } from "@/lib/resume/schema";

/** Step 3 — education. */
export function EducationSection({
  items,
  onChange,
  jobDescription,
}: {
  items: Education[];
  onChange: (items: Education[]) => void;
  jobDescription?: string;
}) {
  function update(id: string, patch: Partial<Education>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-5">
      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">No education added yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Degrees, diplomas and relevant certifications can live here.
          </p>
        </div>
      )}

      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">{item.degree || "Education"}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}
              aria-label="Remove education"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${item.id}-degree`}>Degree</Label>
              <Input
                id={`${item.id}-degree`}
                value={item.degree}
                onChange={(event) => update(item.id, { degree: event.target.value })}
                placeholder="BSc Computer Science"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${item.id}-field`}>Field of study</Label>
              <Input
                id={`${item.id}-field`}
                value={item.field}
                onChange={(event) => update(item.id, { field: event.target.value })}
                placeholder="Computer Science"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`${item.id}-institution`}>Institution</Label>
              <Input
                id={`${item.id}-institution`}
                value={item.institution}
                onChange={(event) => update(item.id, { institution: event.target.value })}
                placeholder="University of Cambridge"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${item.id}-ed-start`}>Start</Label>
              <Input
                id={`${item.id}-ed-start`}
                value={item.startDate}
                onChange={(event) => update(item.id, { startDate: event.target.value })}
                placeholder="2016"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${item.id}-ed-end`}>End</Label>
              <Input
                id={`${item.id}-ed-end`}
                value={item.endDate}
                onChange={(event) => update(item.id, { endDate: event.target.value })}
                placeholder="2020"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`${item.id}-ed-location`}>Location</Label>
              <Input
                id={`${item.id}-ed-location`}
                value={item.location}
                onChange={(event) => update(item.id, { location: event.target.value })}
                placeholder="Cambridge, UK"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor={`${item.id}-ed-description`}>Details</Label>
                <ImproveButton
                  section="education"
                  content={item.description}
                  jobDescription={jobDescription}
                  onApply={(improved) => update(item.id, { description: improved })}
                />
              </div>
              <Textarea
                id={`${item.id}-ed-description`}
                rows={3}
                value={item.description}
                onChange={(event) => update(item.id, { description: event.target.value })}
                placeholder={"First class honours. Dissertation on distributed consensus protocols.\nTeaching assistant for Algorithms (2 semesters)."}
              />
            </div>
          </div>
        </div>
      ))}

      <AddButton
        onClick={() =>
          onChange([
            ...items,
            {
              id: `edu_${Math.random().toString(36).slice(2, 10)}`,
              institution: "",
              degree: "",
              field: "",
              location: "",
              startDate: "",
              endDate: "",
              description: "",
            },
          ])
        }
        label="Add education"
      />
    </div>
  );
}
