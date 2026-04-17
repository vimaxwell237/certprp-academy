import assert from "node:assert/strict";
import test from "node:test";

import { getConfiguredEmailProviderKind } from "@/features/delivery/lib/provider";

function withEnv(updates: Record<string, string | undefined>) {
  const previous = new Map<string, string | undefined>();

  for (const [key, value] of Object.entries(updates)) {
    previous.set(key, process.env[key]);

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  return () => {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };
}

test("email provider falls back to log mode when no delivery credentials are configured", () => {
  const restoreEnv = withEnv({
    RESEND_API_KEY: undefined,
    EMAIL_SMTP_HOST: undefined,
    EMAIL_SMTP_PORT: undefined,
    EMAIL_SMTP_USERNAME: undefined,
    EMAIL_SMTP_PASSWORD: undefined,
    EMAIL_SMTP_SECURE: undefined
  });

  try {
    assert.equal(getConfiguredEmailProviderKind(), "log");
  } finally {
    restoreEnv();
  }
});

test("email provider uses Resend when the API key is configured", () => {
  const restoreEnv = withEnv({
    RESEND_API_KEY: "re_test_123",
    EMAIL_SMTP_HOST: undefined,
    EMAIL_SMTP_PORT: undefined,
    EMAIL_SMTP_USERNAME: undefined,
    EMAIL_SMTP_PASSWORD: undefined,
    EMAIL_SMTP_SECURE: undefined
  });

  try {
    assert.equal(getConfiguredEmailProviderKind(), "resend");
  } finally {
    restoreEnv();
  }
});

test("email provider prefers SMTP when complete SMTP credentials are configured", () => {
  const restoreEnv = withEnv({
    RESEND_API_KEY: "re_test_123",
    EMAIL_SMTP_HOST: "smtp.example.com",
    EMAIL_SMTP_PORT: "587",
    EMAIL_SMTP_USERNAME: "smtp-user",
    EMAIL_SMTP_PASSWORD: "smtp-pass",
    EMAIL_SMTP_SECURE: "false"
  });

  try {
    assert.equal(getConfiguredEmailProviderKind(), "smtp");
  } finally {
    restoreEnv();
  }
});
