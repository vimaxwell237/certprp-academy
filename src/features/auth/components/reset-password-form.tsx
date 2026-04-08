"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordField } from "@/features/auth/components/password-field";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export function ResetPasswordForm() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isConfigured = hasSupabaseEnv();

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      if (!supabase) {
        if (isMounted) {
          setIsCheckingSession(false);
        }
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (sessionError || !data.session) {
        setError(
          "This password reset link is invalid or has expired. Request a new reset email to continue."
        );
      }

      setIsCheckingSession(false);
    }

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  async function handleSubmit(formData: FormData) {
    if (!supabase) {
      setError(
        "Supabase environment variables are missing. Add them in .env.local to enable password recovery."
      );
      return;
    }

    setError(null);
    setSuccess(null);

    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(
          getPublicErrorMessage(
            updateError,
            "We could not update your password right now. Request a new reset link and try again."
          )
        );
        return;
      }

      await supabase.auth.signOut();
      setSuccess("Password updated. Redirecting you to login...");
      router.push(`${APP_ROUTES.login}?reset=1`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md border border-white/80 bg-white/95 p-5 sm:p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan">
          New password
        </p>
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Choose a new password
        </h1>
        <p className="text-base text-slate">
          Create a fresh password for your account, then we&apos;ll take you back to
          login.
        </p>
      </div>

      <form action={handleSubmit} className="mt-6 space-y-5 sm:mt-8">
        <PasswordField
          autoComplete="new-password"
          label="New password"
          maxLength={128}
          minLength={8}
          name="password"
          placeholder="Create a secure password"
          required
        />

        <PasswordField
          autoComplete="new-password"
          label="Confirm password"
          maxLength={128}
          minLength={8}
          name="confirmPassword"
          placeholder="Repeat your new password"
          required
        />

        {error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
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

        <Button
          disabled={!isConfigured || isCheckingSession || isSubmitting}
          fullWidth
          type="submit"
        >
          {isCheckingSession
            ? "Checking reset link..."
            : isSubmitting
              ? "Updating password..."
              : "Update password"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate">
        Need a new email?{" "}
        <Link
          className="font-semibold text-cyan transition hover:text-teal"
          href={APP_ROUTES.forgotPassword}
        >
          Request another reset link
        </Link>
      </p>
    </Card>
  );
}
