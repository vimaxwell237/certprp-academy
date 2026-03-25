import type { Metadata } from "next";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Set New Password",
  description:
    "Create a new password for your CertPrep Academy account after using a recovery link.",
  path: "/reset-password",
  keywords: ["reset password", "account recovery", "new password"]
});

export default function ResetPasswordPage() {
  return (
    <div className="flex w-full items-center justify-center py-8">
      <ResetPasswordForm />
    </div>
  );
}
