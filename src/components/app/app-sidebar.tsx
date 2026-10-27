"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Mic, Settings, Sparkles, X } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const APP_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resume", label: "Resume Maker", icon: FileText },
  { href: "/interview", label: "Mock Interview", icon: Mic },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

/**
 * Application sidebar.
 *
 * On desktop it is a fixed rail; on mobile it becomes a slide-over drawer
 * controlled by the parent layout.
 */
export function AppSidebar({
  open,
  onClose,
  plan,
}: {
  open: boolean;
  onClose: () => void;
  plan: "FREE" | "PRO";
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo href="/dashboard" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Application">
        {APP_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-gradient text-white shadow-md shadow-brand-500/25"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade nudge for free accounts */}
      {plan === "FREE" && (
        <div className="p-3">
          <div className="rounded-xl border border-brand-300/50 bg-brand-soft p-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-200">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Upgrade to Pro
            </span>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Unlimited resumes, unlimited mock interviews and personalised questions.
            </p>
            <Button asChild size="sm" className="mt-3 w-full">
              <Link href="/settings#billing">See plans</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card/40 lg:block">
        <div className="sticky top-0 h-dvh">{content}</div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          onClick={onClose}
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-72 border-r border-border bg-background shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {content}
        </div>
      </div>
    </>
  );
}
