import type { Metadata } from "next";

import { SignupForm } from "@/features/auth/components/signup-form";
import { redirectIfAuthenticated } from "@/lib/auth/session";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Create Account",
  description: "Create a CertPrep Academy account to start preparing for CCNA with guided lessons, subnetting tools, and practice labs.",
  path: "/signup",
  keywords: ["CCNA signup", "create CertPrep account"]
});

export default async function SignupPage() {
  await redirectIfAuthenticated();

  return (
    <div className="flex w-full items-center justify-center py-8">
      <SignupForm />
    </div>
  );
}
