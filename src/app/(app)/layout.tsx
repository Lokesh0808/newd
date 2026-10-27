import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { auth } from "@/lib/auth";

/**
 * Layout for every signed-in page.
 *
 * `auth()` reads the session cookie, so this layout is always dynamic.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        plan: session.user.plan,
      }}
    >
      {children}
    </AppShell>
  );
}
