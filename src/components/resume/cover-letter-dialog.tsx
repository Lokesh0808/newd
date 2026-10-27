"use client";

import * as React from "react";
import { Copy, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ResumeData } from "@/lib/resume/schema";

/**
 * Cover letter generator — writes a letter from the resume + job description.
 */
export function CoverLetterDialog({
  open,
  onOpenChange,
  resume,
  jobDescription,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resume: ResumeData;
  jobDescription: string;
}) {
  const [jobTitle, setJobTitle] = React.useState(resume.personal.title ?? "");
  const [company, setCompany] = React.useState("");
  const [tone, setTone] = React.useState("professional");
  const [letter, setLetter] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [demo, setDemo] = React.useState(false);

  async function generate() {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription, jobTitle, company, tone }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Could not generate the cover letter.");
      }

      setLetter(payload.content ?? "");
      setDemo(Boolean(payload.demo));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate the cover letter.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(letter);
      toast.success("Cover letter copied to clipboard.");
    } catch {
      toast.error("Your browser blocked the clipboard. Select the text and copy it manually.");
    }
  }

  function download() {
    const blob = new Blob([letter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(resume.personal.fullName || "cover-letter").replace(/\s+/g, "-").toLowerCase()}-cover-letter.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-500" aria-hidden />
            AI cover letter
          </DialogTitle>
          <DialogDescription>
            Built from your resume, so it only references things you have actually done.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cover-role">Job title</Label>
            <Input
              id="cover-role"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              placeholder="Senior Frontend Engineer"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cover-company">Company</Label>
            <Input
              id="cover-company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Acme Corp"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cover-tone">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="cover-tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                <SelectItem value="concise">Concise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="button" onClick={() => void generate()} loading={loading} className="w-full">
          {!loading && <Sparkles className="h-4 w-4" aria-hidden />}
          {loading ? "Writing…" : "Generate cover letter"}
        </Button>

        {demo && letter && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            Demo mode — add an <code className="font-semibold">ANTHROPIC_API_KEY</code> for a fully
            personalised letter.
          </div>
        )}

        {letter && (
          <>
            <Textarea
              value={letter}
              onChange={(event) => setLetter(event.target.value)}
              rows={14}
              className="leading-relaxed"
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={copy} className="flex-1">
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button type="button" variant="outline" onClick={download} className="flex-1">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
