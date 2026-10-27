"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** Labelled text input. */
export function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  hint,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  hint?: string;
}) {
  const inputId = React.useId();
  const resolvedId = id || inputId;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={resolvedId}>{label}</Label>
      <Input
        id={resolvedId}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Labelled textarea with an optional character counter. */
export function TextAreaField({
  label,
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
  hint,
  maxLength,
}: {
  label: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
  maxLength?: number;
}) {
  const generatedId = React.useId();
  const resolvedId = id || generatedId;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={resolvedId}>{label}</Label>
        {maxLength && (
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <Textarea
        id={resolvedId}
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Two column grid wrapper for paired fields. */
export function FieldGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>;
}
