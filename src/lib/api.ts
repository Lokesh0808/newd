import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AiError } from "@/lib/ai/client";

/**
 * Small helpers shared by every route handler, so error responses are
 * consistent across the API.
 */

export interface ApiErrorBody {
  error: string;
  code?: string;
  details?: unknown;
}

/** Standard JSON error response. */
export function apiError(message: string, status = 400, code?: string, details?: unknown) {
  const body: ApiErrorBody = { error: message, code, details };
  return NextResponse.json(body, { status });
}

/**
 * Resolve the signed-in user or return `null`.
 *
 * Route handlers use this and respond with 401 when it is null — the proxy
 * only guards pages, so API routes must authorise themselves.
 */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

/** Resolve the signed-in user or throw a 401-shaped error. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const error = new Error("You need to be signed in to do that.") as Error & { status: number };
    error.status = 401;
    throw error;
  }
  return user;
}

/**
 * Wrap a route handler so unexpected errors become friendly JSON responses.
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>,
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof AiError) {
        return apiError(error.message, error.status, error.code);
      }
      const status =
        (error as { status?: number })?.status ??
        (error instanceof Error && error.message.includes("signed in") ? 401 : 500);
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      if (status >= 500) console.error("[careerai] API error:", error);
      return apiError(message, status);
    }
  };
}
