import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { redirectIfAuthenticated } from "@/lib/auth/session";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Forgot Password",
  description:
    "Request a password reset email for your CertPrep Academy account.",
  path: "/forgot-password",
  keywords: ["forgot password", "reset password", "CertPrep account recovery"]
});

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();

  return (
    <div className="flex w-full items-center justify-center py-8">
      <ForgotPasswordForm />
    </div>
  );
}
