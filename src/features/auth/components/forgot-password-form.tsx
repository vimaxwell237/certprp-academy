"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordField } from "@/features/auth/components/password-field";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/config";

const PASSWORD_RESET_COOLDOWN_MS = 60_000;
const PASSWORD_RESET_COOLDOWN_KEY = "certprep:password-reset-cooldown-until";
type ResetStep = "request" | "verify";

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0);
  const [email, setEmail] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<ResetStep>("request");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isConfigured = hasSupabaseEnv();
  const errorParam = searchParams?.get("error");
  const recoveryLinkError =
    errorParam === "recovery_link"
      ? "That password reset link is invalid or has expired. Request a new reset code below."
      : null;
  const cooldownRemainingSeconds = Math.ceil(cooldownRemainingMs / 1000);

  function setCooldown(durationMs: number) {
    const endsAt = Date.now() + durationMs;

    window.localStorage.setItem(PASSWORD_RESET_COOLDOWN_KEY, String(endsAt));
    setCooldownRemainingMs(durationMs);
  }

  function normalizeOtp(value: string) {
    return value.replace(/\s+/g, "").trim();
  }

  useEffect(() => {
    const savedEndsAt = window.localStorage.getItem(PASSWORD_RESET_COOLDOWN_KEY);

    if (!savedEndsAt) {
      return;
    }

    const remainingMs = Number(savedEndsAt) - Date.now();

    if (remainingMs > 0) {
      setCooldownRemainingMs(remainingMs);
      return;
    }

    window.localStorage.removeItem(PASSWORD_RESET_COOLDOWN_KEY);
  }, []);

  useEffect(() => {
    if (cooldownRemainingMs <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const savedEndsAt = window.localStorage.getItem(PASSWORD_RESET_COOLDOWN_KEY);

      if (!savedEndsAt) {
        setCooldownRemainingMs(0);
        window.clearInterval(intervalId);
        return;
      }

      const remainingMs = Number(savedEndsAt) - Date.now();

      if (remainingMs <= 0) {
        window.localStorage.removeItem(PASSWORD_RESET_COOLDOWN_KEY);
        setCooldownRemainingMs(0);
        window.clearInterval(intervalId);
        return;
      }

      setCooldownRemainingMs(remainingMs);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [cooldownRemainingMs]);

  async function requestPasswordResetCode(nextEmail: string) {
    if (!isConfigured) {
      setError(
        "Supabase environment variables are missing. Add them in .env.local to enable password recovery."
      );
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (cooldownRemainingMs > 0) {
        setError(
          `Please wait ${cooldownRemainingSeconds}s before requesting another reset email.`
        );
        return;
      }

      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: nextEmail
        })
      });
      const result = (await response.json().catch(() => null)) as
        | {
            error?: string;
          }
        | null;

      if (!response.ok) {
        setError(
          result?.error ??
            "We could not send the reset email right now. Please try again in a minute."
        );

        if (response.status === 429) {
          setCooldown(PASSWORD_RESET_COOLDOWN_MS);
        }
      } else {
        setPendingEmail(nextEmail);
        setStep("verify");
        setSuccess(
          "If an account exists for that email, we sent a security code. Enter the newest code from your inbox below."
        );
        setCooldown(PASSWORD_RESET_COOLDOWN_MS);
      }
    } catch {
      setError(
        "We could not send the reset email right now. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRequestSubmit(formData: FormData) {
    const nextEmail = String(formData.get("email") ?? "").trim().toLowerCase();

    setEmail(nextEmail);
    await requestPasswordResetCode(nextEmail);
  }

  async function handleVerifySubmit(formData: FormData) {
    if (!supabase) {
      setError(
        "Supabase environment variables are missing. Add them in .env.local to enable password recovery."
      );
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const code = normalizeOtp(String(formData.get("code") ?? ""));
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!pendingEmail) {
      setError("Start over and request a new password reset code.");
      setIsSubmitting(false);
      return;
    }

    if (!code) {
      setError("Enter the security code from your email.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Your password confirmation does not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: code,
        type: "recovery"
      });

      if (verifyError) {
        setError(
          getPublicErrorMessage(
            verifyError,
            "That reset code is invalid or has expired. Request a new one and try again."
          )
        );
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(
          getPublicErrorMessage(
            updateError,
            "We could not update your password right now. Request a new code and try again."
          )
        );
        return;
      }

      await supabase.auth.signOut();
      setSuccess("Password updated. Redirecting you to login...");
      window.localStorage.removeItem(PASSWORD_RESET_COOLDOWN_KEY);
      setCooldownRemainingMs(0);
      window.location.assign(`${APP_ROUTES.login}?reset=1`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md border border-white/80 bg-white/95 p-5 sm:p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan">
          Password help
        </p>
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          {step === "request" ? "Reset your password" : "Enter your reset code"}
        </h1>
        <p className="text-base text-slate">
          {step === "request"
            ? "Enter your email and we&apos;ll send you a security code to finish resetting your password."
            : "Use the newest security code from your email, then choose a new password."}
        </p>
      </div>

      <form
        action={step === "request" ? handleRequestSubmit : handleVerifySubmit}
        className="mt-6 space-y-5 sm:mt-8"
      >
        {step === "request" ? (
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink">Email</span>
            <input
              required
              className="w-full rounded-2xl border border-mist bg-pearl px-4 py-3 text-base text-ink outline-none transition placeholder:text-slate/60 focus:border-cyan focus:bg-white"
              maxLength={254}
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
          </label>
        ) : (
          <>
            <div className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
              Enter the newest code sent to <strong>{pendingEmail}</strong>.
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink">Security code</span>
              <input
                required
                autoComplete="one-time-code"
                className="w-full rounded-2xl border border-mist bg-pearl px-4 py-3 text-base tracking-[0.3em] text-ink outline-none transition placeholder:tracking-normal placeholder:text-slate/60 focus:border-cyan focus:bg-white"
                inputMode="numeric"
                maxLength={8}
                name="code"
                placeholder="123456"
                type="text"
              />
            </label>

            <PasswordField
              autoComplete="new-password"
              helperText="Use at least 8 characters."
              label="New password"
              maxLength={128}
              minLength={8}
              name="password"
              placeholder="Create a secure password"
              required
            />

            <PasswordField
              autoComplete="new-password"
              label="Confirm new password"
              maxLength={128}
              minLength={8}
              name="confirmPassword"
              placeholder="Repeat your new password"
              required
            />
          </>
        )}

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
        {cooldownRemainingMs > 0 ? (
          <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
            Another reset email can be requested in about {cooldownRemainingSeconds}s.
          </p>
        ) : null}

        {!isConfigured ? (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Authentication is disabled until Supabase credentials are added to{" "}
            <code>.env.local</code>.
          </p>
        ) : null}

        <Button
          disabled={
            !isConfigured ||
            isSubmitting ||
            (step === "request" && cooldownRemainingMs > 0)
          }
          fullWidth
          type="submit"
        >
          {isSubmitting
            ? step === "request"
              ? "Sending code..."
              : "Updating password..."
            : cooldownRemainingMs > 0 && step === "request"
              ? `Wait ${cooldownRemainingSeconds}s`
              : step === "request"
                ? "Send reset code"
                : "Verify code and update password"}
        </Button>

        {step === "verify" ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1"
              disabled={!isConfigured || isSubmitting || cooldownRemainingMs > 0}
              onClick={() => {
                void requestPasswordResetCode(pendingEmail);
              }}
              type="button"
              variant="secondary"
            >
              {cooldownRemainingMs > 0
                ? `Resend in ${cooldownRemainingSeconds}s`
                : "Resend code"}
            </Button>
            <Button
              className="flex-1"
              disabled={isSubmitting}
              onClick={() => {
                setError(null);
                setSuccess(null);
                setStep("request");
              }}
              type="button"
              variant="secondary"
            >
              Use another email
            </Button>
          </div>
        ) : null}
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
