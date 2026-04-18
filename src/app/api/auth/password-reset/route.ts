import { NextRequest, NextResponse } from "next/server";

import { buildPasswordRecoveryEmail } from "@/features/auth/lib/password-recovery-email";
import {
  getConfiguredEmailProviderKind,
  getEmailProvider
} from "@/features/delivery/lib/provider";
import {
  checkSlidingWindowRateLimit,
  isTrustedRequestOrigin
} from "@/lib/http/request-security";
import {
  createServiceRoleSupabaseClient,
  isMissingServiceRoleConfigError
} from "@/lib/supabase/admin";

const PASSWORD_RESET_RATE_LIMIT = {
  limit: 5,
  windowMs: 60_000
} as const;

function isValidEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getClientAddress(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function isMissingUserRecoveryError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return message.includes("user not found") || message.includes("email not found");
}

export async function POST(request: NextRequest) {
  if (!isTrustedRequestOrigin(request)) {
    return NextResponse.json(
      {
        error: "This password reset request was blocked. Refresh the page and try again."
      },
      {
        status: 403
      }
    );
  }

  const rateLimit = checkSlidingWindowRateLimit({
    key: `password-reset:${getClientAddress(request)}`,
    ...PASSWORD_RESET_RATE_LIMIT
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error:
          "Too many reset emails were requested recently. Wait a minute, then try again."
      },
      {
        status: 429
      }
    );
  }

  const payload = (await request.json().catch(() => null)) as {
    email?: unknown;
  } | null;
  const email =
    typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";

  if (!email || email.length > 254 || !isValidEmailAddress(email)) {
    return NextResponse.json(
      {
        error: "Enter a valid email address and try again."
      },
      {
        status: 400
      }
    );
  }

  if (getConfiguredEmailProviderKind() === "log") {
    return NextResponse.json(
      {
        error:
          "Password recovery email delivery is not configured yet. Add a real email provider and try again."
      },
      {
        status: 503
      }
    );
  }

  try {
    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email
    });

    if (error) {
      if (isMissingUserRecoveryError(error)) {
        return NextResponse.json({ ok: true });
      }

      throw error;
    }

    const emailOtp = data.properties?.email_otp;

    if (!emailOtp) {
      throw new Error("Supabase did not return a password recovery code.");
    }

    const emailProvider = getEmailProvider();
    const sendResult = await emailProvider.send(
      buildPasswordRecoveryEmail({
        to: email,
        code: emailOtp
      })
    );

    if (sendResult.status !== "sent") {
      throw new Error(sendResult.errorMessage ?? "Password recovery email send failed.");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isMissingServiceRoleConfigError(error)) {
      return NextResponse.json(
        {
          error:
            "Password recovery is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY and try again."
        },
        {
          status: 503
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "We could not send the reset email right now. Please try again in a minute."
      },
      {
        status: 500
      }
    );
  }
}
