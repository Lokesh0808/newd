"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImproveButton } from "@/components/resume/improve-button";
import { AddButton } from "@/components/resume/sections/experience-section";
import type { Certification } from "@/lib/resume/schema";

/** Step 6 — certifications. */
export function CertificationsSection({
  items,
  onChange,
  jobDescription,
}: {
  items: Certification[];
  onChange: (items: Certification[]) => void;
  jobDescription?: string;
}) {
  function update(id: string, patch: Partial<Certification>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-5">
      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">No certifications yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            AWS, Azure, Google Cloud and professional certificates all count.
          </p>
        </div>
      )}

      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">{item.name || "Certification"}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}
              aria-label="Remove certification"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor={`${item.id}-name`}>Name</Label>
                <ImproveButton
                  section="certifications"
                  content={`${item.name}${item.issuer ? ` — ${item.issuer}` : ""}`}
                  jobDescription={jobDescription}
                  onApply={(improved) => {
                    const [name, issuer] = improved.split("—").map((part) => part.trim());
                    update(item.id, {
                      name: name || item.name,
                      issuer: issuer || item.issuer,
                    });
                  }}
                />
              </div>
              <Input
                id={`${item.id}-name`}
                value={item.name}
                onChange={(event) => update(item.id, { name: event.target.value })}
                placeholder="AWS Certified Solutions Architect"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${item.id}-issuer`}>Issuer</Label>
              <Input
                id={`${item.id}-issuer`}
                value={item.issuer}
                onChange={(event) => update(item.id, { issuer: event.target.value })}
                placeholder="Amazon Web Services"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${item.id}-date`}>Date</Label>
              <Input
                id={`${item.id}-date`}
                value={item.date}
                onChange={(event) => update(item.id, { date: event.target.value })}
                placeholder="Mar 2024"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${item.id}-credential`}>Credential ID</Label>
              <Input
                id={`${item.id}-credential`}
                value={item.credentialId}
                onChange={(event) => update(item.id, { credentialId: event.target.value })}
                placeholder="ABC123XYZ"
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
              id: `cert_${Math.random().toString(36).slice(2, 10)}`,
              name: "",
              issuer: "",
              date: "",
              credentialId: "",
            },
          ])
        }
        label="Add certification"
      />
    </div>
  );
}
