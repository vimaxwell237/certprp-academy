"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordField } from "@/features/auth/components/password-field";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { buildAppUrl } from "@/lib/app-url";
import { getSafeAuthErrorMessage } from "@/lib/errors/public-error";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export function SignupForm() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isConfigured = hasSupabaseEnv();

  async function handleSubmit(formData: FormData) {
    if (!supabase) {
      setError(
        "Supabase environment variables are missing. Add them in .env.local to enable sign up."
      );
      return;
    }

    setError(null);
    setSuccess(null);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    const callbackParams = new URLSearchParams({
      next: APP_ROUTES.login,
      mode: "confirm"
    });

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: buildAppUrl(
          `${APP_ROUTES.authCallback}?${callbackParams.toString()}`
        )
      }
    });

    if (signUpError) {
      setError(getSafeAuthErrorMessage("signup", signUpError));
      return;
    }

    if (data.session) {
      startTransition(() => {
        router.push(APP_ROUTES.dashboard);
        router.refresh();
      });
      return;
    }

    setSuccess(
      "Account created. Check your email for the verification link. After you confirm, we will send you back to log in."
    );
  }

  return (
    <Card className="w-full max-w-md border border-white/80 bg-white/95 p-5 sm:p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan">
          Start learning
        </p>
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Create your account
        </h1>
        <p className="text-base text-slate">
          Begin your CCNA journey now with a foundation built to grow into multiple
          certification tracks.
        </p>
      </div>

      <form action={handleSubmit} className="mt-6 space-y-5 sm:mt-8">
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

        <PasswordField
          autoComplete="new-password"
          helperText="Use at least 8 characters."
          label="Password"
          maxLength={128}
          minLength={8}
          name="password"
          placeholder="Create a secure password"
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

        <Button disabled={!isConfigured || isPending} fullWidth type="submit">
          {isPending ? "Creating account..." : "Get Started"}
        </Button>
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
