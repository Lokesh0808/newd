import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names while resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a number between a min and max. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Format a score (0-100) for display, e.g. 87 -> "87". */
export function formatScore(score: number | null | undefined) {
  if (score == null || Number.isNaN(score)) return "—";
  return String(Math.round(score));
}

/**
 * Human readable date, e.g. "12 Mar 2026".
 *
 * Rendered in UTC so the server and the client always produce the same
 * string — a local-timezone format would cause hydration mismatches.
 */
export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Month + year only, in UTC (used for "member since" style labels). */
export function formatMonthYear(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** Relative time, e.g. "3 days ago". */
export function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.345, "week"],
    [12, "month"],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  let value = -seconds;
  for (const [amount, unit] of units) {
    if (Math.abs(value) < amount) return rtf.format(Math.round(value), unit);
    value /= amount;
  }
  return rtf.format(Math.round(value), "year");
}

/** Seconds -> "m:ss" (used by the interview timer). */
export function formatDuration(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Split a newline-delimited textarea value into trimmed bullet points. */
export function toBullets(value: string) {
  return value
    .split("\n")
    .map((line) => line.replace(/^[\s•\-*\d.)\]]+/, "").trim())
    .filter(Boolean);
}

/** Join bullet points back into a textarea value. */
export function bulletsToText(bullets: string[]) {
  return bullets.join("\n");
}

/** Stable-ish slug used for ids created on the client. */
export function createId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/** Initials from a name, used by the avatar. */
export function initials(name?: string | null) {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** First name, used to greet the user. */
export function firstName(name?: string | null) {
  return name?.trim().split(/\s+/)[0] ?? "there";
}

/** Simple debounce for live-search inputs. */
export function debounce<T extends (...args: never[]) => void>(fn: T, delay = 300) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
