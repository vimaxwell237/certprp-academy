import { NextRequest, NextResponse } from "next/server";

import {
  checkSlidingWindowRateLimit,
  isTrustedRequestOrigin
} from "@/lib/http/request-security";
import {
  createServiceRoleSupabaseClient,
  isMissingServiceRoleConfigError
} from "@/lib/supabase/admin";

const SIGNUP_RATE_LIMIT = {
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

export async function POST(request: NextRequest) {
  if (!isTrustedRequestOrigin(request)) {
    return NextResponse.json(
      {
        error: "This sign-up request was blocked. Refresh the page and try again."
      },
      {
        status: 403
      }
    );
  }

  const rateLimit = checkSlidingWindowRateLimit({
    key: `signup:${getClientAddress(request)}`,
    ...SIGNUP_RATE_LIMIT
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error:
          "Too many sign-up attempts were made recently. Wait a minute, then try again."
      },
      {
        status: 429
      }
    );
  }

  const payload = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
  } | null;
  const email =
    typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload?.password === "string" ? payload.password : "";

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

  if (password.length < 8) {
    return NextResponse.json(
      {
        error: "Use at least 8 characters for your password."
      },
      {
        status: 400
      }
    );
  }

  try {
    const supabase = createServiceRoleSupabaseClient();
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) {
      return NextResponse.json(
        {
          error:
            "We could not create your account right now. If this email is already registered, try logging in instead."
        },
        {
          status: 400
        }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isMissingServiceRoleConfigError(error)) {
      return NextResponse.json(
        {
          error:
            "Account creation is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY and try again."
        },
        {
          status: 503
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "We could not create your account right now. Please try again in a minute."
      },
      {
        status: 500
      }
    );
  }
}
