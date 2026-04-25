import {
  createServerClient,
  type CookieOptions
} from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import {
  checkSlidingWindowRateLimit,
  isTrustedRequestOrigin
} from "@/lib/http/request-security";
import {
  createServiceRoleSupabaseClient,
  isMissingServiceRoleConfigError
} from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/supabase/config";

const SIGNUP_RATE_LIMIT = {
  limit: 5,
  windowMs: 60_000
} as const;

type SupabaseCookie = {
  name: string;
  value: string;
  options?: CookieOptions;
};

type AuthErrorLike = {
  code?: string;
  message?: string;
};

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

function isDuplicateEmailError(error: unknown) {
  const authError = error as AuthErrorLike | null | undefined;
  const code = authError?.code?.toLowerCase() ?? "";
  const message = authError?.message?.toLowerCase() ?? "";

  return (
    code === "email_exists" ||
    code === "user_already_exists" ||
    message.includes("already registered") ||
    message.includes("already exists") ||
    message.includes("already been registered") ||
    message.includes("duplicate key value") ||
    message.includes("users_email_key")
  );
}

function withSupabaseCookies(
  response: NextResponse,
  sourceResponse: NextResponse
) {
  sourceResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });

  return response;
}

function createRouteHandlerSupabaseClient(request: NextRequest) {
  let response = NextResponse.next({
    request
  });
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: SupabaseCookie[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  return {
    supabase,
    getResponse() {
      return response;
    }
  };
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
    const serviceRoleSupabase = createServiceRoleSupabaseClient();
    const { data, error } = await serviceRoleSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) {
      if (isDuplicateEmailError(error)) {
        return NextResponse.json(
          {
            error: "An account with this email address already exists. Log in instead."
          },
          {
            status: 409
          }
        );
      }

      return NextResponse.json(
        {
          error: "We could not create your account right now. Please try again."
        },
        {
          status: 400
        }
      );
    }

    const { supabase, getResponse } = createRouteHandlerSupabaseClient(request);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      if (data.user?.id) {
        await serviceRoleSupabase.auth.admin.deleteUser(data.user.id).catch(() => null);
      }

      return NextResponse.json(
        {
          error: "We could not sign you in right after creating your account. Please try again."
        },
        {
          status: 500
        }
      );
    }

    return withSupabaseCookies(
      NextResponse.json({ ok: true }),
      getResponse()
    );
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
