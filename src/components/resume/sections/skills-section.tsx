"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ImproveButton } from "@/components/resume/improve-button";
import { AddButton } from "@/components/resume/sections/experience-section";
import type { Skill } from "@/lib/resume/schema";

/**
 * Step 4 — skills.
 *
 * Skills are entered as free text and converted into chips; the ATS scanner
 * reads the chip names, so keep them canonical ("React" not "React.js").
 */
export function SkillsSection({
  items,
  onChange,
  jobDescription,
}: {
  items: Skill[];
  onChange: (items: Skill[]) => void;
  jobDescription?: string;
}) {
  function addSkill(name: string) {
    const clean = name.trim();
    if (!clean) return;
    if (items.some((skill) => skill.name.toLowerCase() === clean.toLowerCase())) return;
    onChange([...items, { id: `skill_${Math.random().toString(36).slice(2, 10)}`, name: clean }]);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="skill-input" className="text-sm font-medium">
            Skills
          </label>
          <ImproveButton
            section="skills"
            content={items.map((skill) => skill.name).join(", ")}
            jobDescription={jobDescription}
            onApply={(improved) =>
              onChange(
                improved
                  .split(/[,\n]/)
                  .map((name) => name.trim())
                  .filter(Boolean)
                  .map((name) => ({ id: `skill_${Math.random().toString(36).slice(2, 10)}`, name })),
              )
            }
          />
        </div>
        <div className="flex gap-2">
          <Input
            id="skill-input"
            placeholder="Type a skill and press Enter"
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                const input = event.currentTarget;
                addSkill(input.value);
                input.value = "";
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const input = document.getElementById("skill-input") as HTMLInputElement | null;
              if (input) {
                addSkill(input.value);
                input.value = "";
              }
            }}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Press Enter or comma after each skill. 10-18 skills is the sweet spot for ATS matching.
        </p>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((skill) => (
            <Badge key={skill.id} variant="secondary" className="gap-1.5 py-1.5 pl-3 pr-1.5">
              {skill.name}
              <button
                type="button"
                onClick={() => onChange(items.filter((entry) => entry.id !== skill.id))}
                aria-label={`Remove ${skill.name}`}
                className="grid h-4 w-4 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">No skills yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            This is the section ATS matches most often — add your core stack first.
          </p>
        </div>
      )}

      <AddButton onClick={() => addSkill("New skill")} label="Add a skill" />
    </div>
  );
}
