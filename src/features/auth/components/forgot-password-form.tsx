"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { buildAppUrl } from "@/lib/app-url";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isConfigured = hasSupabaseEnv();
  const errorParam = searchParams?.get("error");
  const recoveryLinkError =
    errorParam === "recovery_link"
      ? "That password reset link is invalid or has expired. Request a new reset email below."
      : null;

  async function handleSubmit(formData: FormData) {
    if (!supabase) {
      setError(
        "Supabase environment variables are missing. Add them in .env.local to enable password recovery."
      );
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const email = String(formData.get("email") ?? "");
      const callbackParams = new URLSearchParams({
        next: APP_ROUTES.resetPassword,
        mode: "recovery"
      });
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildAppUrl(
          `${APP_ROUTES.authCallback}?${callbackParams.toString()}`
        )
      });

      if (resetError) {
        setError(
          getPublicErrorMessage(
            resetError,
            "We could not send the reset email right now. Please try again."
          )
        );
      } else {
        setSuccess(
          "If an account exists for that email, a password reset link has been sent."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md border border-white/80 bg-white/95 p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan">
          Password help
        </p>
        <h1 className="font-display text-3xl font-bold text-ink">
          Reset your password
        </h1>
        <p className="text-base text-slate">
          Enter your email and we&apos;ll send you a secure link to choose a new
          password.
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

        {error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        {!error && recoveryLinkError ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {recoveryLinkError}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </p>
        ) : null}

        {!isConfigured ? (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Authentication is disabled until Supabase credentials are added to{" "}
            <code>.env.local</code>.
          </p>
        ) : null}

        <Button disabled={!isConfigured || isSubmitting} fullWidth type="submit">
          {isSubmitting ? "Sending reset link..." : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate">
        Remembered it?{" "}
        <Link
          className="font-semibold text-cyan transition hover:text-teal"
          href={APP_ROUTES.login}
        >
          Back to login
        </Link>
      </p>
    </Card>
  );
}
