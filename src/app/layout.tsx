import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "CareerAI — AI Resume Builder & Mock Interview Coach",
    template: "%s | CareerAI",
  },
  description:
    "Build an ATS-friendly resume with AI, tailor it to any job description, and practise with a realistic AI mock interviewer that gives instant feedback.",
  keywords: [
    "AI resume builder",
    "ATS resume checker",
    "mock interview",
    "AI interview practice",
    "cover letter generator",
    "job application tools",
  ],
  applicationName: "CareerAI",
  authors: [{ name: "CareerAI" }],
  creator: "CareerAI",
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "CareerAI",
    title: "CareerAI — AI Resume Builder & Mock Interview Coach",
    description:
      "Build an ATS-friendly resume with AI, tailor it to any job description, and practise with a realistic AI mock interviewer.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerAI — AI Resume Builder & Mock Interview Coach",
    description:
      "Build an ATS-friendly resume with AI and practise interviews with instant, structured feedback.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0f18" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={cn(
          inter.variable,
          display.variable,
          "min-h-dvh bg-background font-sans text-foreground antialiased",
        )}
      >
        <ThemeProvider>
          {children}
          {/* Global toast notifications (success / error feedback). */}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast: "!rounded-xl !border-border !bg-card !text-card-foreground !shadow-xl",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
