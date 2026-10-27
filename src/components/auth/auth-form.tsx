"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AuthMode = "login" | "signup";

/**
 * Shared email/password form used by both the login and signup screens.
 */
export function AuthForm({
  mode,
  callbackUrl = "/dashboard",
  googleEnabled = false,
}: {
  mode: AuthMode;
  /** Where to send the user after a successful sign-in. */
  callbackUrl?: string;
  /** Whether Google OAuth is configured for this deployment. */
  googleEnabled?: boolean;
}) {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignup) {
        // 1. Create the account.
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "We could not create your account.");
        }
      }

      // 2. Sign in with the credentials provider.
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        throw new Error(
          isSignup
            ? "Your account was created but we could not sign you in. Please try signing in."
            : "Incorrect email or password.",
        );
      }

      toast.success(isSignup ? "Welcome to CareerAI!" : "Signed in successfully.");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google", { redirectTo: callbackUrl });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignup
            ? "Start building a resume that gets read — and an interview you have already rehearsed."
            : "Sign in to continue building your resume and practising interviews."}
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {isSignup && (
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Ada Lovelace"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder={isSignup ? "At least 8 characters" : "••••••••"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={isSignup ? 8 : undefined}
            required
          />
          {isSignup && (
            <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {isSignup ? "Create account" : "Sign in"}
        </Button>
      </form>

      {/* Google */}
      {googleEnabled && (
        <>
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3.01c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.13A12 12 0 0 0 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.27A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.55.36-2.27V6.6H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.4l3.98-3.13Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.7 0 3.99 2.47 1.29 6.6l3.98 3.13C6.22 6.86 8.87 4.75 12 4.75Z"
                />
              </svg>
            )}
            Continue with Google
          </Button>
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignup ? "Already have an account? " : "New to CareerAI? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {isSignup ? "Sign in" : "Create a free account"}
        </Link>
      </p>
    </div>
  );
}
