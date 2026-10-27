import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { isGoogleAuthEnabled } from "@/lib/env";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a free CareerAI account to build an ATS-friendly resume and practise mock interviews.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthForm
      mode="signup"
      callbackUrl={params.callbackUrl ?? "/dashboard"}
      googleEnabled={isGoogleAuthEnabled}
    />
  );
}
