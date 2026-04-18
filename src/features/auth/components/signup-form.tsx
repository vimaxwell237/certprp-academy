"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordField } from "@/features/auth/components/password-field";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/config";

type SignupStep = "create" | "verify";

export function SignupForm() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [email, setEmail] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<SignupStep>("create");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isConfigured = hasSupabaseEnv();

  function normalizeOtp(value: string) {
    return value.replace(/\s+/g, "").trim();
  }

  async function requestSignupCode(nextEmail: string, nextPassword: string) {
    if (!isConfigured) {
      setError(
        "Supabase environment variables are missing. Add them in .env.local to enable sign up."
      );
      return;
    }

    setError(null);
    setSuccess(null);

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: nextEmail,
          password: nextPassword
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
            "We could not create your account right now. Please review your details and try again."
        );
        return;
      }

      setPendingEmail(nextEmail);
      setPendingPassword(nextPassword);
      setStep("verify");
      setSuccess(
        "Account created. Enter the newest confirmation code from your email to finish signing up."
      );
    } catch {
      setError(
        "We could not create your account right now. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateSubmit(formData: FormData) {
    const nextEmail = String(formData.get("email") ?? "").trim().toLowerCase();
    const nextPassword = String(formData.get("password") ?? "");

    setError(null);
    setSuccess(null);
    setEmail(nextEmail);
    setPendingEmail(nextEmail);
    setPendingPassword(nextPassword);

    if (nextPassword.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    await requestSignupCode(nextEmail, nextPassword);
  }

  async function handleVerifySubmit(formData: FormData) {
    if (!supabase) {
      setError(
        "Supabase environment variables are missing. Add them in .env.local to enable sign up."
      );
      return;
    }

    const code = normalizeOtp(String(formData.get("code") ?? ""));

    setError(null);
    setSuccess(null);

    if (!pendingEmail) {
      setError("Start over and create your account again.");
      return;
    }

    if (!code) {
      setError("Enter the confirmation code from your email.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: code,
        type: "signup"
      });

      if (verifyError) {
        setError(
          getPublicErrorMessage(
            verifyError,
            "That confirmation code is invalid or has expired. Request a new one and try again."
          )
        );
        return;
      }

      if (data.session) {
        setSuccess("Email confirmed. Redirecting you to your dashboard...");
        router.push(APP_ROUTES.dashboard);
        router.refresh();
        return;
      }

      setSuccess("Email confirmed. Redirecting you to login...");
      router.push(`${APP_ROUTES.login}?verified=1`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md border border-white/80 bg-white/95 p-5 sm:p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan">
          Start learning
        </p>
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          {step === "create" ? "Create your account" : "Confirm your email"}
        </h1>
        <p className="text-base text-slate">
          {step === "create"
            ? "Begin your CCNA journey now with a foundation built to grow into multiple certification tracks."
            : "Enter the newest confirmation code from your email to activate your account."}
        </p>
      </div>

      <form
        action={step === "create" ? handleCreateSubmit : handleVerifySubmit}
        className="mt-6 space-y-5 sm:mt-8"
      >
        {step === "create" ? (
          <>
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

            <PasswordField
              autoComplete="new-password"
              helperText="Use at least 8 characters."
              label="Password"
              maxLength={128}
              minLength={8}
              name="password"
              onChange={(event) => setPendingPassword(event.target.value)}
              placeholder="Create a secure password"
              required
              value={pendingPassword}
            />
          </>
        ) : (
          <>
            <div className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
              Enter the newest code sent to <strong>{pendingEmail}</strong>.
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink">Confirmation code</span>
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
          </>
        )}

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

        <Button disabled={!isConfigured || isSubmitting} fullWidth type="submit">
          {isSubmitting
            ? step === "create"
              ? "Creating account..."
              : "Confirming email..."
            : step === "create"
              ? "Get Started"
              : "Verify code"}
        </Button>

        {step === "verify" ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1"
              disabled={!isConfigured || isSubmitting || !pendingPassword}
              onClick={() => {
                void requestSignupCode(pendingEmail, pendingPassword);
              }}
              type="button"
              variant="secondary"
            >
              Resend code
            </Button>
            <Button
              className="flex-1"
              disabled={isSubmitting}
              onClick={() => {
                setError(null);
                setSuccess(null);
                setStep("create");
              }}
              type="button"
              variant="secondary"
            >
              Edit details
            </Button>
          </div>
        ) : null}
      </form>

      <p className="mt-6 text-sm text-slate">
        Already have an account?{" "}
        <Link
          className="font-semibold text-cyan transition hover:text-teal"
          href={APP_ROUTES.login}
        >
          Login
        </Link>
      </p>
    </Card>
  );
}
