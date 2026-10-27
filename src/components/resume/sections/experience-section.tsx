"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImproveButton } from "@/components/resume/improve-button";
import type { Experience } from "@/lib/resume/schema";

/** Step 2 — work experience with AI rewriting per role. */
export function ExperienceSection({
  items,
  onChange,
  jobDescription,
}: {
  items: Experience[];
  onChange: (items: Experience[]) => void;
  jobDescription?: string;
}) {
  function update(id: string, patch: Partial<Experience>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function remove(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-5">
      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">No roles added yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add your most relevant role first — recruiters read it first.
          </p>
        </div>
      )}

      {items.map((item, index) => (
        <div key={item.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden />
              Role {index + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => remove(item.id)}
              aria-label="Remove role"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${item.id}-position`}>Job title</Label>
              <Input
                id={`${item.id}-position`}
                value={item.position}
                onChange={(event) => update(item.id, { position: event.target.value })}
                placeholder="Senior Frontend Engineer"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${item.id}-company`}>Company</Label>
              <Input
                id={`${item.id}-company`}
                value={item.company}
                onChange={(event) => update(item.id, { company: event.target.value })}
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${item.id}-location`}>Location</Label>
              <Input
                id={`${item.id}-location`}
                value={item.location}
                onChange={(event) => update(item.id, { location: event.target.value })}
                placeholder="Remote / Berlin"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`${item.id}-start`}>Start</Label>
                <Input
                  id={`${item.id}-start`}
                  value={item.startDate}
                  onChange={(event) => update(item.id, { startDate: event.target.value })}
                  placeholder="Jan 2022"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${item.id}-end`}>End</Label>
                <Input
                  id={`${item.id}-end`}
                  value={item.endDate}
                  onChange={(event) => update(item.id, { endDate: event.target.value })}
                  placeholder="Present"
                  disabled={item.current}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Switch
              id={`${item.id}-current`}
              checked={item.current}
              onCheckedChange={(checked) => update(item.id, { current: checked })}
            />
            <Label htmlFor={`${item.id}-current`} className="text-muted-foreground">
              I currently work here
            </Label>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor={`${item.id}-description`}>Achievements</Label>
              <ImproveButton
                section="experience"
                content={item.description}
                jobDescription={jobDescription}
                onApply={(improved) => update(item.id, { description: improved })}
              />
            </div>
            <Textarea
              id={`${item.id}-description`}
              rows={5}
              value={item.description}
              onChange={(event) => update(item.id, { description: event.target.value })}
              placeholder={"Led the migration of 12 screens to a design system, cutting UI bugs by 40%.\nBuilt a CI pipeline that reduced deploy time from 45 to 8 minutes."}
            />
            <p className="text-xs text-muted-foreground">
              One achievement per line. Start with an action verb and include a number wherever you can.
            </p>
          </div>
        </div>
      ))}

      <AddButton onClick={() => onChange([...items, emptyExperience()])} label="Add role" />
    </div>
  );
}

/** Blank experience row (kept local so the id stays unique). */
function emptyExperience(): Experience {
  return {
    id: `exp_${Math.random().toString(36).slice(2, 10)}`,
    company: "",
    position: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  };
}

/** Shared "add another" button. */
export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button type="button" variant="outline" onClick={onClick} className="w-full border-dashed">
      <Plus className="h-4 w-4" />
      {label}
    </Button>
  );
}
