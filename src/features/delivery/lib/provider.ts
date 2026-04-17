import { randomUUID } from "node:crypto";

import nodemailer from "nodemailer";

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

export type EmailProviderKind = "smtp" | "resend" | "log";

function getFromAddress() {
  return (
    process.env.NOTIFICATION_FROM_EMAIL ??
    process.env.EMAIL_FROM_ADDRESS ??
    "no-reply@certprep.local"
  );
}

function readBooleanEnv(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return null;
}

function getSmtpPort() {
  const configuredPort = Number(process.env.EMAIL_SMTP_PORT ?? "");

  if (Number.isInteger(configuredPort) && configuredPort > 0) {
    return configuredPort;
  }

  return 587;
}

function getSmtpConfig() {
  const host = process.env.EMAIL_SMTP_HOST?.trim();
  const username = process.env.EMAIL_SMTP_USERNAME?.trim();
  const password = process.env.EMAIL_SMTP_PASSWORD;

  if (!host || !username || !password) {
    return null;
  }

  const port = getSmtpPort();
  const configuredSecure = readBooleanEnv(process.env.EMAIL_SMTP_SECURE);

  return {
    host,
    port,
    secure: configuredSecure ?? port === 465,
    auth: {
      user: username,
      pass: password
    }
  };
}

function clipProviderErrorMessage(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return null;
  }

  return normalized.length > 240 ? `${normalized.slice(0, 237)}...` : normalized;
}

function createSmtpEmailProvider(config: NonNullable<ReturnType<typeof getSmtpConfig>>): EmailProvider {
  const transport = nodemailer.createTransport(config);

  return {
    channel: "email",
    async send(message) {
      try {
        const result = await transport.sendMail({
          from: getFromAddress(),
          to: message.to,
          subject: message.subject,
          html: message.html,
          text: message.text
        });

        if (result.accepted.length === 0 && result.rejected.length > 0) {
          return {
            status: "failed",
            errorMessage: "SMTP provider rejected the recipient address.",
            retryable: false
          };
        }

        return {
          status: "sent",
          externalMessageId: result.messageId ?? `smtp-${randomUUID()}`
        };
      } catch (error) {
        return {
          status: "failed",
          errorMessage:
            error instanceof Error
              ? clipProviderErrorMessage(error.message) ?? "SMTP provider request failed."
              : "Unknown SMTP provider error.",
          retryable: true
        };
      }
    }
  };
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

export function getConfiguredEmailProviderKind(): EmailProviderKind {
  if (getSmtpConfig()) {
    return "smtp";
  }

  if (process.env.RESEND_API_KEY) {
    return "resend";
  }

  return "log";
}

export function getEmailProvider(): EmailProvider {
  const smtpConfig = getSmtpConfig();

  if (smtpConfig) {
    return createSmtpEmailProvider(smtpConfig);
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    return createResendEmailProvider(resendApiKey);
  }

  return createLogEmailProvider();
}
