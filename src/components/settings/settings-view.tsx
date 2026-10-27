"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  AlertTriangle,
  Check,
  CreditCard,
  Download,
  Loader2,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatDate, formatMonthYear } from "@/lib/utils";

export interface SettingsUser {
  name: string | null;
  email: string;
  plan: "FREE" | "PRO";
  createdAt: string;
  subscriptionStatus?: string | null;
  subscriptionRenewsAt?: string | null;
  billingEnabled: boolean;
}

/**
 * Settings — profile, billing and privacy controls.
 */
export function SettingsView({ user }: { user: SettingsUser }) {
  const searchParams = useSearchParams();
  const [period, setPeriod] = React.useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [confirmEmail, setConfirmEmail] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  // Surface the checkout result.
  React.useEffect(() => {
    const billing = searchParams.get("billing");
    if (billing === "success") toast.success("Welcome to Pro! Your plan is active.");
    if (billing === "cancelled") toast.info("Checkout cancelled — you are still on the free plan.");
  }, [searchParams]);

  async function startCheckout() {
    setLoading(true);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Could not start the checkout.");
      }

      window.location.href = payload.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the checkout.");
      setLoading(false);
    }
  }

  async function openPortal() {
    setLoading(true);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Could not open the billing portal.");
      }
      window.location.href = payload.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open the billing portal.");
      setLoading(false);
    }
  }

  async function deleteData(scope: "data" | "account") {
    setDeleting(true);
    try {
      const response = await fetch("/api/data/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail, scope }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Could not delete your data.");
      }

      toast.success(
        scope === "account" ? "Your account and all data have been deleted." : "Your data has been deleted.",
      );
      setDeleteOpen(false);

      if (scope === "account") {
        await signOut({ callbackUrl: "/" });
      } else {
        setConfirmEmail("");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete your data.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your profile, subscription and data.
      </p>

      {/* ---------------------------------------------------------- Profile */}
      <Card className="mt-6 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-base font-bold">
          <User className="h-4 w-4 text-brand-500" aria-hidden />
          Profile
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Name</Label>
            <Input id="profile-name" defaultValue={user.name ?? ""} readOnly />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" defaultValue={user.email} readOnly />
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Member since {formatMonthYear(user.createdAt)}
        </p>
      </Card>

      {/* ---------------------------------------------------------- Billing */}
      <Card id="billing" className="mt-5 scroll-mt-24 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-base font-bold">
          <CreditCard className="h-4 w-4 text-brand-500" aria-hidden />
          Plan &amp; billing
        </h2>

        <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Badge variant={user.plan === "PRO" ? "gradient" : "secondary"} className="px-2.5 py-1">
                {user.plan === "PRO" ? "Pro plan" : "Free plan"}
              </Badge>
              {user.subscriptionStatus && (
                <span className="text-xs capitalize text-muted-foreground">
                  {user.subscriptionStatus}
                </span>
              )}
            </div>

            {user.plan === "PRO" ? (
              user.subscriptionRenewsAt ? (
                <p className="text-xs text-muted-foreground">
                  Renews {formatDate(user.subscriptionRenewsAt)}
                </p>
              ) : null
            ) : (
              <p className="text-xs text-muted-foreground">3 resumes · 5 interviews per month</p>
            )}
          </div>
        </div>

        {user.plan === "FREE" ? (
          <>
            <div className="mt-5 inline-flex items-center gap-3 rounded-lg border border-border px-3 py-2">
              <span className={cn("text-sm", period === "monthly" && "font-medium")}>Monthly</span>
              <button
                type="button"
                onClick={() => setPeriod(period === "monthly" ? "yearly" : "monthly")}
                aria-label="Toggle billing period"
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  period === "yearly" ? "bg-brand-gradient" : "bg-muted-foreground/30",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                    period === "yearly" ? "translate-x-[22px]" : "translate-x-0.5",
                  )}
                />
              </button>
              <span className={cn("text-sm", period === "yearly" && "font-medium")}>Yearly</span>
              <Badge variant="success">Save 33%</Badge>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" onClick={() => void startCheckout()} loading={loading}>
                {!loading && <Sparkles className="h-4 w-4" aria-hidden />}
                Upgrade to Pro — ${period === "yearly" ? "96/year" : "12/month"}
              </Button>
            </div>

            {!user.billingEnabled && (
              <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                Stripe is not configured on this deployment. Add <code>STRIPE_SECRET_KEY</code> and the
                Pro price ids to enable real checkouts.
              </p>
            )}

            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {[
                "Unlimited saved resumes",
                "Unlimited mock interviews",
                "Unlimited resume uploads",
                "Personalised interview questions",
                "Progress charts & score history",
                "Priority AI processing",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 shrink-0 text-success" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Button type="button" variant="outline" className="mt-4" onClick={() => void openPortal()} loading={loading}>
            Manage subscription
          </Button>
        )}
      </Card>

      {/* ----------------------------------------------------------- Privacy */}
      <Card className="mt-5 p-5 sm:p-6">
        <h2 className="font-display text-base font-bold">Your data &amp; privacy</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We never sell your data or use your resume to train models. Export or delete everything at any
          time.
        </p>

        <Separator className="my-5" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Export your data</p>
            <p className="text-xs text-muted-foreground">
              Download every resume, interview and cover letter as a JSON file.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href="/api/data/export" download>
              <Download className="h-4 w-4" />
              Download JSON
            </a>
          </Button>
        </div>

        <Separator className="my-5" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Delete your data</p>
            <p className="text-xs text-muted-foreground">
              Remove every resume and interview. You can also delete the account itself.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete data
          </Button>
        </div>
      </Card>

      {/* ------------------------------------------------------ Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden />
              Delete your data
            </DialogTitle>
            <DialogDescription>
              This cannot be undone. Choose what you want to delete and confirm by typing your email
              address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="confirm-email">Type {user.email} to confirm</Label>
            <Input
              id="confirm-email"
              type="email"
              value={confirmEmail}
              onChange={(event) => setConfirmEmail(event.target.value)}
              placeholder={user.email}
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => void deleteData("data")}
              disabled={deleting || confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Delete my data only
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => void deleteData("account")}
              disabled={deleting || confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Delete my account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
