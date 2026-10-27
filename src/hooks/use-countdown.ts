"use client";

import * as React from "react";

/**
 * Countdown timer for a single interview question.
 *
 * The timer resets whenever `resetKey` changes (i.e. on the next question).
 */
export function useCountdown(seconds: number, resetKey: string, running: boolean) {
  const [remaining, setRemaining] = React.useState(seconds);
  const [lastKey, setLastKey] = React.useState(resetKey);

  // Adjust the state during render when the question changes — this is the
  // React-recommended pattern for resetting state on a prop change.
  if (lastKey !== resetKey) {
    setLastKey(resetKey);
    setRemaining(seconds);
  }

  React.useEffect(() => {
    if (!running || remaining <= 0) return;

    const id = setInterval(() => {
      setRemaining((value) => (value > 0 ? value - 1 : 0));
    }, 1000);

    return () => clearInterval(id);
  }, [running, remaining]);

  return {
    remaining,
    /** Seconds used so far. */
    elapsed: seconds - remaining,
    /** True once the time is up. */
    expired: remaining === 0,
    reset: () => setRemaining(seconds),
  };
}
