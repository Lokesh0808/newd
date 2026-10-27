"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ACCEPTED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/lib/ai/extract";

/**
 * Import an existing resume.
 *
 * The file is uploaded to the server, parsed by Claude and turned into an
 * editable resume in the builder.
 */
export function ImportResumeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Clear the selection whenever the dialog is closed.
  function handleOpenChange(next: boolean) {
    if (!next) {
      setFile(null);
      setDragging(false);
    }
    onOpenChange(next);
  }

  function pickFile(candidate?: File | null) {
    if (!candidate) return;
    if (candidate.size > MAX_UPLOAD_BYTES) {
      toast.error("That file is larger than 10 MB.");
      return;
    }
    setFile(candidate);
  }

  async function upload() {
    if (!file) {
      toast.error("Choose a file first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ai/parse-resume", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "We could not import that file.");
      }

      const warnings: string[] = payload.warnings ?? [];
      if (warnings.length) {
        toast.warning(warnings[0]);
      } else {
        toast.success("Resume imported — review it and improve each section.");
      }

      onOpenChange(false);
      router.push(`/resume/${payload.resume.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not import that file.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import an existing resume</DialogTitle>
          <DialogDescription>
            Upload a PDF or DOCX. We extract the text, rebuild it as a structured resume and then you
            can improve every section with AI.
          </DialogDescription>
        </DialogHeader>

        {/* Drop zone */}
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            pickFile(event.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            dragging ? "border-brand-500 bg-brand-500/5" : "border-border hover:bg-muted/50"
          }`}
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand-600 dark:text-brand-300">
            <Upload className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-sm font-medium">
            {file ? file.name : "Drop your resume here, or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground">PDF, DOCX or TXT · max 10 MB</p>
        </div>

        <Input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_UPLOAD_TYPES.join(",")}
          className="hidden"
          onChange={(event) => pickFile(event.target.files?.[0])}
        />

        {file && (
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="flex-1 truncate">{file.name}</span>
            <Badge variant="secondary">{(file.size / 1024).toFixed(0)} KB</Badge>
          </div>
        )}

        <Button type="button" className="w-full" onClick={() => void upload()} loading={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Parsing your resume…
            </>
          ) : (
            "Import and improve"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
