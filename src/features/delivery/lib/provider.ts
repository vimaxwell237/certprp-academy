import { randomUUID } from "node:crypto";

import type { DeliveryChannel } from "@/types/delivery";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailSendResult {
  status: "sent" | "failed";
  externalMessageId?: string | null;
  errorMessage?: string | null;
  retryable?: boolean;
}

export interface EmailProvider {
  channel: DeliveryChannel;
  send(message: EmailMessage): Promise<EmailSendResult>;
}

function getFromAddress() {
  return (
    process.env.NOTIFICATION_FROM_EMAIL ??
    process.env.EMAIL_FROM_ADDRESS ??
    "no-reply@certprep.local"
  );
}

function clipProviderErrorMessage(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return null;
  }

  return normalized.length > 240 ? `${normalized.slice(0, 237)}...` : normalized;
}

function createLogEmailProvider(): EmailProvider {
  return {
    channel: "email",
    async send(message) {
      console.info("[certprep-email-log]", {
        from: getFromAddress(),
        to: message.to,
        subject: message.subject
      });

      return {
        status: "sent",
        externalMessageId: `dev-${randomUUID()}`
      };
    }
  };
}

function createResendEmailProvider(apiKey: string): EmailProvider {
  return {
    channel: "email",
    async send(message) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          signal: AbortSignal.timeout(10_000),
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: getFromAddress(),
            to: [message.to],
            subject: message.subject,
            html: message.html,
            text: message.text
          })
        });

        if (!response.ok) {
          const errorText = await response.text();

          return {
            status: "failed",
            errorMessage: clipProviderErrorMessage(errorText) ?? "Resend request failed.",
            retryable: response.status >= 500 || response.status === 429
          };
        }

        const data = (await response.json()) as { id?: string };

        return {
          status: "sent",
          externalMessageId: data.id ?? `resend-${randomUUID()}`
        };
      } catch (error) {
        return {
          status: "failed",
          errorMessage:
            error instanceof Error
              ? clipProviderErrorMessage(error.message) ?? "Email provider request failed."
              : "Unknown email provider error.",
          retryable: true
        };
      }
    }
  };
}

export function getEmailProvider(): EmailProvider {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    return createResendEmailProvider(resendApiKey);
  }

  return createLogEmailProvider();
}
