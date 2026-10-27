"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImproveButton } from "@/components/resume/improve-button";
import { AddButton } from "@/components/resume/sections/experience-section";
import type { Project } from "@/lib/resume/schema";

/** Step 5 — projects. */
export function ProjectsSection({
  items,
  onChange,
  jobDescription,
}: {
  items: Project[];
  onChange: (items: Project[]) => void;
  jobDescription?: string;
}) {
  function update(id: string, patch: Partial<Project>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-5">
      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">No projects added yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Side projects, open source work and products all count.
          </p>
        </div>
      )}

      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">{item.name || "Project"}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}
              aria-label="Remove project"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${item.id}-name`}>Project name</Label>
              <Input
                id={`${item.id}-name`}
                value={item.name}
                onChange={(event) => update(item.id, { name: event.target.value })}
                placeholder="Design system"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${item.id}-tech`}>Tech / stack</Label>
              <Input
                id={`${item.id}-tech`}
                value={item.tech}
                onChange={(event) => update(item.id, { tech: event.target.value })}
                placeholder="React, TypeScript, Storybook"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`${item.id}-link`}>Link</Label>
              <Input
                id={`${item.id}-link`}
                value={item.link}
                onChange={(event) => update(item.id, { link: event.target.value })}
                placeholder="github.com/you/project"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor={`${item.id}-description`}>Description</Label>
                <ImproveButton
                  section="projects"
                  content={item.description}
                  jobDescription={jobDescription}
                  onApply={(improved) => update(item.id, { description: improved })}
                />
              </div>
              <Textarea
                id={`${item.id}-description`}
                rows={4}
                value={item.description}
                onChange={(event) => update(item.id, { description: event.target.value })}
                placeholder={"Built a component library used by 40 engineers across 6 teams.\nCut UI bugs by 35% by adding contract tests to every component."}
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
              id: `prj_${Math.random().toString(36).slice(2, 10)}`,
              name: "",
              description: "",
              tech: "",
              link: "",
            },
          ])
        }
        label="Add project"
      />
    </div>
  );
}
