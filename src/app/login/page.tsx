import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/login-form";
import { redirectIfAuthenticated } from "@/lib/auth/session";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Log In",
  description: "Log in to CertPrep Academy to access your CCNA dashboard, lessons, labs, and study tools.",
  path: "/login",
  keywords: ["CertPrep login", "CCNA dashboard login"]
});

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <div className="flex w-full items-center justify-center py-8">
      <LoginForm />
    </div>
  );
}
