import type { EmailMessage } from "@/features/delivery/lib/provider";

export function buildSignupConfirmationEmail(input: {
  code: string;
  to: string;
}): EmailMessage {
  const subject = "Your CertPrep Academy confirmation code";
  const text = [
    "Email confirmation code",
    "",
    "Welcome to CertPrep Academy.",
    "Enter this security code on the sign-up screen to confirm your email address:",
    input.code,
    "",
    "This code expires soon.",
    "",
    "If you did not create this account, you can ignore this email."
  ].join("\n");

  const html = `
    <div style="background:#f5f7fb;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a;">
      <div style="margin:0 auto;max-width:560px;border-radius:20px;background:#ffffff;padding:32px;box-shadow:0 18px 40px rgba(15,23,42,0.1);">
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">Email confirmation code</h1>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#334155;">
          Welcome to CertPrep Academy.
        </p>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#334155;">
          Enter this security code on the sign-up screen to confirm your email address.
        </p>
        <p style="margin:24px 0;border-radius:18px;background:#e2e8f0;padding:18px 20px;text-align:center;font-size:32px;font-weight:700;letter-spacing:0.24em;color:#0f172a;">
          ${input.code}
        </p>
        <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#64748b;">
          This code expires soon.
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
