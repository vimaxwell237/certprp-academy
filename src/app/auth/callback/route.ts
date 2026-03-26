import {
  createServerClient,
  type CookieOptions
} from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { APP_ROUTES } from "@/lib/auth/redirects";
import { buildAppUrl } from "@/lib/app-url";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/config";

type SupabaseCookie = {
  name: string;
  value: string;
  options?: CookieOptions;
};

function getSafeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return null;
  }

  return nextPath;
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

function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  request.cookies.getAll().forEach((cookie) => {
    if (!cookie.name.startsWith("sb-")) {
      return;
    }

    request.cookies.delete(cookie.name);
    response.cookies.set(cookie.name, "", {
      expires: new Date(0),
      maxAge: 0,
      path: "/"
    });
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

function createAppRedirect(
  pathname: string,
  params?: Record<string, string>,
  sourceResponse?: NextResponse
) {
  const redirectUrl = new URL(buildAppUrl(pathname));

  Object.entries(params ?? {}).forEach(([key, value]) => {
    redirectUrl.searchParams.set(key, value);
  });

  const redirectResponse = NextResponse.redirect(redirectUrl);

  return sourceResponse
    ? withSupabaseCookies(redirectResponse, sourceResponse)
    : redirectResponse;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const mode = searchParams.get("mode");
  const nextPath =
    getSafeNextPath(searchParams.get("next")) ??
    (mode === "confirm"
      ? APP_ROUTES.login
      : mode === "recovery"
        ? APP_ROUTES.resetPassword
        : APP_ROUTES.dashboard);
  const failedRedirectPath =
    mode === "recovery" ? APP_ROUTES.forgotPassword : APP_ROUTES.login;
  const failedRedirectError =
    mode === "recovery" ? "recovery_link" : "verification_link";

  if (searchParams.get("error") || searchParams.get("error_description") || !code) {
    return createAppRedirect(failedRedirectPath, {
      error: failedRedirectError
    });
  }

  if (!hasSupabaseEnv()) {
    return createAppRedirect(failedRedirectPath, {
      error: failedRedirectError
    });
  }

  const { supabase, getResponse } = createRouteHandlerSupabaseClient(request);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return createAppRedirect(failedRedirectPath, {
      error: failedRedirectError
    }, getResponse());
  }

  if (mode === "confirm") {
    await supabase.auth.signOut();
    const clearedResponse = clearSupabaseAuthCookies(request, getResponse());

    return createAppRedirect(APP_ROUTES.login, {
      verified: "1"
    }, clearedResponse);
  }

  return createAppRedirect(nextPath, undefined, getResponse());
}
