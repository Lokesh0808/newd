import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";

/** 404 page. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand-600 dark:text-brand-300">
        <FileQuestion className="h-6 w-6" aria-hidden />
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you are looking for does not exist or has moved. Let’s get you back on track.
      </p>
      <div className="mt-8 flex gap-2">
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
