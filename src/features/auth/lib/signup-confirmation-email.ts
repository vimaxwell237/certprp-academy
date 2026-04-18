import type { EmailMessage } from "@/features/delivery/lib/provider";

export function buildSignupConfirmationEmail(input: {
  confirmationUrl: string;
  to: string;
}): EmailMessage {
  const subject = "Confirm your CertPrep Academy email";
  const text = [
    "Confirm your email",
    "",
    "Welcome to CertPrep Academy.",
    "Use the secure link below to confirm your email address and activate your account:",
    input.confirmationUrl,
    "",
    "If you did not create this account, you can ignore this email."
  ].join("\n");

  const html = `
    <div style="background:#f5f7fb;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a;">
      <div style="margin:0 auto;max-width:560px;border-radius:20px;background:#ffffff;padding:32px;box-shadow:0 18px 40px rgba(15,23,42,0.1);">
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">Confirm your email</h1>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#334155;">
          Welcome to CertPrep Academy.
        </p>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#334155;">
          Use the secure button below to confirm your email address and activate your account.
        </p>
        <p style="margin:24px 0;">
          <a href="${input.confirmationUrl}" style="display:inline-block;border-radius:999px;background:#0f172a;padding:14px 22px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">
            Confirm email
          </a>
        </p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;">
          If you did not create this account, you can ignore this email.
        </p>
      </div>
    </div>
  `.trim();

  return {
    to: input.to,
    subject,
    html,
    text
  };
}
