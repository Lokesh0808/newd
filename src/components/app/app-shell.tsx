"use client";

import * as React from "react";
import { Menu } from "lucide-react";

import { AppSidebar } from "@/components/app/app-sidebar";
import { UserMenu, type UserMenuUser } from "@/components/app/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Authenticated application shell.
 *
 * The sidebar is rendered by this client component so it can react to route
 * changes and open/close the mobile drawer.
 */
export function AppShell({
  user,
  children,
}: {
  user: UserMenuUser;
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = React.useState(false);

  return (
    <div className="flex min-h-dvh">
      <AppSidebar
        open={navOpen}
        onClose={() => setNavOpen(false)}
        plan={user.plan === "PRO" ? "PRO" : "FREE"}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex-1" />

          <ThemeToggle />
          <UserMenu user={user} />
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
