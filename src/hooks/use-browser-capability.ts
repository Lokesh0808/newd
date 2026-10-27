"use client";

import * as React from "react";

/**
 * Read a value that only exists in the browser.
 *
 * `useSyncExternalStore` is the recommended way to do this: during the server
 * render and the hydration pass React uses `serverValue`, then re-renders
 * with the real value once the client takes over. A plain `useState` +
 * `useEffect` would produce a hydration mismatch.
 *
 * `getSnapshot` must return a stable value (primitives, or a cached object).
 */
export function useClientValue<T>(getSnapshot: () => T, serverValue: T): T {
  const subscribe = React.useCallback(() => () => {}, []);

  const get = React.useCallback(() => {
    if (typeof window === "undefined") return serverValue;
    return getSnapshot();
  }, [getSnapshot, serverValue]);

  return React.useSyncExternalStore(subscribe, get, () => serverValue);
}

/**
 * Detect a browser capability (e.g. Web Speech API support) without
 * breaking hydration.
 */
export function useBrowserCapability(check: () => boolean): boolean {
  const get = React.useCallback(() => {
    if (typeof window === "undefined") return false;
    // `check` is expected to be a stable, pure function.
    return check();
  }, [check]);

  return React.useSyncExternalStore(
    () => () => {},
    get,
    () => false,
  );
}
