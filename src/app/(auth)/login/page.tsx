import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { isGoogleAuthEnabled } from "@/lib/env";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to CareerAI to build your resume and practise mock interviews.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthForm
      mode="login"
      callbackUrl={params.callbackUrl ?? "/dashboard"}
      googleEnabled={isGoogleAuthEnabled}
    />
  );
}
