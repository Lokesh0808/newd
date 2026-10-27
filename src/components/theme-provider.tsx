"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Dark/light theme provider.
 *
 * `next-themes` writes the `class="dark"` attribute on <html> and persists the
 * choice in localStorage. The `suppressHydrationWarning` on <html> avoids a
 * mismatch warning because the class is applied by a client-side script.
 */
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
