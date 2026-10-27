"use client";

import * as React from "react";

import { formatDate, timeAgo } from "@/lib/utils";

/**
 * Relative timestamp ("3 days ago").
 *
 * `timeAgo()` depends on the current clock, so rendering it during SSR would
 * produce a different string on the client and trigger a hydration mismatch.
 * `useSyncExternalStore` solves this: React uses the deterministic absolute
 * date for the server render and the hydration pass, then swaps to the
 * relative label (kept fresh by an interval) on the client.
 */
export function TimeAgo({
  date,
  className,
}: {
  date: string | Date;
  className?: string;
}) {
  const subscribe = React.useCallback((onChange: () => void) => {
    const interval = setInterval(onChange, 60_000);
    return () => clearInterval(interval);
  }, []);

  const getSnapshot = React.useCallback(() => timeAgo(date), [date]);
  const getServerSnapshot = React.useCallback(() => formatDate(date), [date]);

  const label = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const iso = typeof date === "string" ? date : date.toISOString();

  return (
    <time dateTime={iso} title={formatDate(date)} className={className}>
      {label}
    </time>
  );
}
