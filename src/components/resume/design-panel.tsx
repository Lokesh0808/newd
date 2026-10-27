"use client";

import { Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ACCENT_COLORS, FONT_OPTIONS, RESUME_TEMPLATES } from "@/lib/resume/templates";
import { cn } from "@/lib/utils";

/**
 * Design panel — template, accent colour and font options.
 */
export function DesignPanel({
  open,
  onOpenChange,
  template,
  accentColor,
  fontFamily,
  onTemplateChange,
  onAccentChange,
  onFontChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: string;
  accentColor: string;
  fontFamily: string;
  onTemplateChange: (value: string) => void;
  onAccentChange: (value: string) => void;
  onFontChange: (value: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Design your resume</DialogTitle>
          <DialogDescription>
            Every template is single-column and ATS friendly — pick the look that fits the role.
          </DialogDescription>
        </DialogHeader>

        {/* Templates */}
        <section>
          <h3 className="mb-3 text-sm font-semibold">Template</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {RESUME_TEMPLATES.map((option) => {
              const active = option.id === template;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onTemplateChange(option.id)}
                  aria-pressed={active}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border-2 p-3 text-left transition-all",
                    active
                      ? "border-brand-500 shadow-lg shadow-brand-500/10"
                      : "border-border hover:border-brand-300",
                  )}
                >
                  {/* Miniature page preview */}
                  <div className="mb-3 h-24 rounded-md border border-border bg-white p-2 shadow-inner">
                    <div
                      className={cn("h-1.5 w-8 rounded-full", active ? "bg-brand-500" : "bg-zinc-300")}
                    />
                    <div className="mt-1 h-1 w-12 rounded-full bg-zinc-200" />
                    <div className="mt-2.5 h-1 w-4 rounded-full bg-zinc-300" />
                    <div className="mt-1 h-1 w-full rounded-full bg-zinc-100" />
                    <div className="mt-1 h-1 w-10/12 rounded-full bg-zinc-100" />
                    <div className="mt-2 h-1 w-4 rounded-full bg-zinc-300" />
                    <div className="mt-1 h-1 w-full rounded-full bg-zinc-100" />
                  </div>

                  <p className="text-sm font-semibold">{option.name}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {option.description}
                  </p>

                  {active && (
                    <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-brand-gradient text-white">
                      <Check className="h-3 w-3" aria-hidden />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Accent colours */}
        <section>
          <h3 className="mb-3 text-sm font-semibold">Accent colour</h3>
          <div className="flex flex-wrap gap-2.5">
            {ACCENT_COLORS.map((color) => {
              const active = color.id === accentColor;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => onAccentChange(color.id)}
                  aria-label={color.name}
                  aria-pressed={active}
                  title={color.name}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full transition-transform hover:scale-110",
                    active && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                  )}
                  style={{ backgroundColor: color.hex }}
                >
                  {active && <Check className="h-4 w-4 text-white" aria-hidden />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Fonts */}
        <section>
          <h3 className="mb-3 text-sm font-semibold">Font</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            {FONT_OPTIONS.map((font) => {
              const active = font.id === fontFamily;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => onFontChange(font.id)}
                  aria-pressed={active}
                  style={{ fontFamily: font.family }}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                    active
                      ? "border-brand-500 bg-brand-500/10 font-medium"
                      : "border-border hover:bg-accent",
                  )}
                >
                  {font.name}
                </button>
              );
            })}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
