"use client";

import * as React from "react";
import { Check, Copy, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export type ImproveSection =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "personal";

/**
 * "Improve with AI" button.
 *
 * Sends the current section to the API, shows the rewrite in a dialog and
 * lets the user apply it (or copy it) — nothing is overwritten silently.
 */
export function ImproveButton({
  section,
  content,
  onApply,
  role,
  jobDescription,
  label = "Improve with AI",
  variant = "outline",
  size = "sm",
  className,
}: {
  section: ImproveSection;
  content: string;
  onApply: (improved: string) => void;
  role?: string;
  jobDescription?: string;
  label?: string;
  variant?: "outline" | "secondary" | "ghost";
  size?: "sm" | "default" | "icon-sm";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [improved, setImproved] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [demo, setDemo] = React.useState(false);

  async function run() {
    if (!content.trim()) {
      toast.error("Add some content first, then ask AI to improve it.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/resume-improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, content, role, jobDescription }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "The AI request failed.");
      }

      setImproved(payload.improved ?? "");
      setNotes(payload.notes ?? "");
      setDemo(Boolean(payload.demo));
      setOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The AI request failed.");
    } finally {
      setLoading(false);
    }
  }

  function apply() {
    onApply(improved);
    setOpen(false);
    toast.success("Section updated.");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(improved);
      toast.success("Copied to clipboard.");
    } catch {
      toast.error("Your browser blocked the clipboard. Select the text and copy it manually.");
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={run}
        loading={loading}
        disabled={loading}
      >
        {!loading && <Wand2 className="h-3.5 w-3.5" aria-hidden />}
        {loading ? "Improving…" : label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-500" aria-hidden />
              AI rewrite
            </DialogTitle>
            <DialogDescription>
              Stronger action verbs and a focus on measurable outcomes. Review before applying.
            </DialogDescription>
          </DialogHeader>

          {demo && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              Demo mode — add an <code className="font-semibold">ANTHROPIC_API_KEY</code> for a full AI
              rewrite.
            </div>
          )}

          {notes && (
            <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">{notes}</p>
          )}

          <Textarea
            value={improved}
            onChange={(event) => setImproved(event.target.value)}
            rows={12}
            className="font-mono text-[13px] leading-relaxed"
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={copy}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button type="button" onClick={apply}>
              <Check className="h-4 w-4" />
              Apply to resume
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
