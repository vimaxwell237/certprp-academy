"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordField } from "@/features/auth/components/password-field";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export function SignupForm() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isConfigured = hasSupabaseEnv();

  async function createAccount(nextEmail: string, nextPassword: string) {
    if (!isConfigured || !supabase) {
      setError(
        "Supabase environment variables are missing. Add them in .env.local to enable account creation."
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

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: nextEmail,
        password: nextPassword
      });

      if (signInError) {
        router.push(`${APP_ROUTES.login}?created=1`);
        router.refresh();
        return;
      }

      setSuccess("Account created. Redirecting you to your dashboard...");
      router.push(APP_ROUTES.dashboard);
      router.refresh();
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
    setPassword(nextPassword);

    if (nextPassword.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    await createAccount(nextEmail, nextPassword);
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
          Begin your CCNA journey now with a foundation built to grow into
          multiple certification tracks.
        </p>
      </div>

      <form action={handleCreateSubmit} className="mt-6 space-y-5 sm:mt-8">
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
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a secure password"
          required
          value={password}
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

        <Button disabled={!isConfigured || isSubmitting} fullWidth type="submit">
          {isSubmitting ? "Creating account..." : "Get Started"}
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
