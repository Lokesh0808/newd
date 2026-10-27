"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, MoreHorizontal, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImportResumeDialog } from "@/components/resume/import-resume-dialog";
import { TimeAgo } from "@/components/ui/time-ago";
import { formatDate } from "@/lib/utils";

export interface ResumeListItem {
  id: string;
  title: string;
  template: string;
  accentColor: string;
  fontFamily: string;
  atsScore: number | null;
  createdAt: string;
  updatedAt: string;
  preview: { name: string; title: string; experienceCount: number };
}

/**
 * The resume library — create, import and manage saved resumes.
 */
export function ResumeLibrary({ resumes }: { resumes: ResumeListItem[] }) {
  const router = useRouter();
  const [importOpen, setImportOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  async function createResume() {
    setCreating(true);
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() || "Untitled resume" }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Could not create the resume.");
      }

      setCreateOpen(false);
      setNewTitle("");
      router.push(`/resume/${payload.resume.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the resume.");
    } finally {
      setCreating(false);
    }
  }

  async function deleteResume(id: string) {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "Could not delete the resume.");
      }
      toast.success("Resume deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the resume.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Resume Maker</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Build, tailor and export ATS-friendly resumes.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New resume
            </Button>
          </div>
        </div>

        {/* Grid */}
        {resumes.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-brand-600 dark:text-brand-300">
              <FileText className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-lg font-bold">No resumes yet</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Start from scratch, or import an existing resume and let AI improve it section by section.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button type="button" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Create a resume
              </Button>
              <Button type="button" variant="outline" onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4" />
                Import an existing one
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Card
                key={resume.id}
                className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5"
              >
                <Link href={`/resume/${resume.id}`} className="block p-5">
                  {/* Miniature page */}
                  <div className="mb-4 h-32 overflow-hidden rounded-md border border-border bg-white p-3 shadow-inner">
                    <div
                      className="h-2 w-1/3 rounded-full"
                      style={{
                        backgroundColor:
                          resume.accentColor === "indigo"
                            ? "#4f46e5"
                            : resume.accentColor === "emerald"
                              ? "#059669"
                              : resume.accentColor === "cyan"
                                ? "#0891b2"
                                : resume.accentColor === "rose"
                                  ? "#e11d48"
                                  : resume.accentColor === "amber"
                                    ? "#d97706"
                                    : resume.accentColor === "blue"
                                      ? "#2563eb"
                                      : resume.accentColor === "violet"
                                        ? "#7c3aed"
                                        : "#334155",
                      }}
                    />
                    <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-zinc-200" />
                    <div className="mt-3 h-1.5 w-1/4 rounded-full bg-zinc-300" />
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-100" />
                    <div className="mt-1 h-1.5 w-10/12 rounded-full bg-zinc-100" />
                    <div className="mt-3 h-1.5 w-1/4 rounded-full bg-zinc-300" />
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-100" />
                  </div>

                  <h3 className="truncate font-semibold">
                    {resume.preview.name || resume.title}
                  </h3>
                  {resume.preview.title && (
                    <p className="truncate text-xs text-muted-foreground">{resume.preview.title}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {resume.atsScore != null && (
                      <Badge
                        variant={
                          resume.atsScore >= 75
                            ? "success"
                            : resume.atsScore >= 50
                              ? "warning"
                              : "destructive"
                        }
                      >
                        ATS {resume.atsScore}/100
                      </Badge>
                    )}
                    <Badge variant="secondary">{resume.preview.experienceCount} roles</Badge>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    Updated <TimeAgo date={resume.updatedAt} /> · {formatDate(resume.updatedAt)}
                  </p>
                </Link>

                <div className="absolute right-3 top-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon-sm"
                        aria-label="Resume actions"
                        className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/resume/${resume.id}`}>Open editor</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/api/resumes/${resume.id}/pdf`}>Download PDF</a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/api/resumes/${resume.id}/docx`}>Download DOCX</a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => void deleteResume(resume.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === resume.id ? "Deleting…" : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New resume</DialogTitle>
            <DialogDescription>Give it a name so you can find it later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="resume-title">Resume name</Label>
            <Input
              id="resume-title"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Frontend Engineer — Acme"
              onKeyDown={(event) => {
                if (event.key === "Enter") void createResume();
              }}
            />
          </div>
          <Button type="button" className="w-full" onClick={() => void createResume()} loading={creating}>
            Create resume
          </Button>
        </DialogContent>
      </Dialog>

      <ImportResumeDialog open={importOpen} onOpenChange={setImportOpen} />
    </>
  );
}
