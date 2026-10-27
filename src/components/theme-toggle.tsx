"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClientValue } from "@/hooks/use-browser-capability";

/** Light / dark mode switch. Renders a neutral placeholder until mounted. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // The resolved theme is only known in the browser, so we render a
  // placeholder for the server render and the hydration pass. Everything
  // derived from it (the icon *and* the label) must wait for the same moment,
  // otherwise the attributes will not match during hydration.
  const mounted = useClientValue(() => true, false);

  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/60 text-muted-foreground transition-colors",
        "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4" aria-hidden />
        ) : (
          <Moon className="h-4 w-4" aria-hidden />
        )
      ) : (
        <span className="h-4 w-4" />
      )}
    </button>
  );
}
