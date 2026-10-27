"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary.
 *
 * Shows a friendly message instead of a stack trace, with a way to retry or
 * get back to the dashboard.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-4 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </span>
      <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We hit an unexpected error. Your work is saved — try again, and if it keeps happening let us
        know.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
      )}
      <div className="mt-8 flex gap-2">
        <Button type="button" variant="outline" onClick={reset}>
          Try again
        </Button>
        <Button asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
