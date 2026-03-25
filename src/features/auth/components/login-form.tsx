"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getSafeAuthErrorMessage } from "@/lib/errors/public-error";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isConfigured = hasSupabaseEnv();
  const verifiedParam = searchParams?.get("verified");
  const resetParam = searchParams?.get("reset");
  const errorParam = searchParams?.get("error");
  const statusMessage =
    verifiedParam === "1"
      ? "Email verified. Log in to continue."
      : resetParam === "1"
        ? "Password updated. Log in with your new password."
        : null;
  const authFlowError =
    errorParam === "verification_link"
      ? "That verification link is invalid or has expired. Sign up again to send a fresh verification email."
      : null;

  async function handleSubmit(formData: FormData) {
    if (!supabase) {
      setError(
        "Supabase environment variables are missing. Add them in .env.local to enable sign in."
      );
      return;
    }

    setError(null);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(getSafeAuthErrorMessage("login", signInError));
      return;
    }

    startTransition(() => {
      router.push(APP_ROUTES.dashboard);
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-md border border-white/80 bg-white/95 p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan">
          Welcome back
        </p>
        <h1 className="font-display text-3xl font-bold text-ink">
          Log in to your dashboard
        </h1>
        <p className="text-base text-slate">
          Access your certification path, progress tracking, and future practice tools
          from one place.
        </p>
      </div>

      <form action={handleSubmit} className="mt-8 space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink">Email</span>
          <input
            required
            className="w-full rounded-2xl border border-mist bg-pearl px-4 py-3 text-base text-ink outline-none transition placeholder:text-slate/60 focus:border-cyan focus:bg-white"
            maxLength={254}
            name="email"
            placeholder="you@example.com"
            type="email"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink">Password</span>
          <input
            required
            className="w-full rounded-2xl border border-mist bg-pearl px-4 py-3 text-base text-ink outline-none transition placeholder:text-slate/60 focus:border-cyan focus:bg-white"
            maxLength={128}
            minLength={6}
            name="password"
            placeholder="Enter your password"
            type="password"
          />
        </label>

        {error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        {!error && authFlowError ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {authFlowError}
          </p>
        ) : null}
        {statusMessage ? (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {statusMessage}
          </p>
        ) : null}

        {!isConfigured ? (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Authentication is disabled until Supabase credentials are added to{" "}
            <code>.env.local</code>.
          </p>
        ) : null}

        <Button disabled={!isConfigured || isPending} fullWidth type="submit">
          {isPending ? "Logging in..." : "Login"}
        </Button>
      </form>

      <p className="mt-4 text-sm text-slate">
        <Link
          className="font-semibold text-cyan transition hover:text-teal"
          href={APP_ROUTES.forgotPassword}
        >
          Forgot your password?
        </Link>
      </p>

      <p className="mt-6 text-sm text-slate">
        New to CertPrep Academy?{" "}
        <Link
          className="font-semibold text-cyan transition hover:text-teal"
          href={APP_ROUTES.signup}
        >
          Create an account
        </Link>
      </p>
    </Card>
  );
}
