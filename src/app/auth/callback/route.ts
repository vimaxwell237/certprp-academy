import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { APP_ROUTES } from "@/lib/auth/redirects";
import { buildAppUrl } from "@/lib/app-url";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getSafeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return null;
  }

  return nextPath;
}

function createAppRedirect(
  pathname: string,
  params?: Record<string, string>
) {
  const redirectUrl = new URL(buildAppUrl(pathname));

  Object.entries(params ?? {}).forEach(([key, value]) => {
    redirectUrl.searchParams.set(key, value);
  });

  return NextResponse.redirect(redirectUrl);
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

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return createAppRedirect(failedRedirectPath, {
      error: failedRedirectError
    });
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return createAppRedirect(failedRedirectPath, {
      error: failedRedirectError
    });
  }

  if (mode === "confirm") {
    await supabase.auth.signOut();

    return createAppRedirect(APP_ROUTES.login, {
      verified: "1"
    });
  }

  return createAppRedirect(nextPath);
}
