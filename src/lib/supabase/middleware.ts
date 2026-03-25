import {
  createServerClient,
  type CookieOptions
} from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { APP_ROUTES, AUTH_ROUTES } from "@/lib/auth/redirects";
import { isRecoverableAuthSessionError } from "@/lib/supabase/auth-errors";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/config";

type SupabaseCookie = {
  name: string;
  value: string;
  options?: CookieOptions;
};

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

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  });

  const pathname = request.nextUrl.pathname;
  const protectedRoutePrefixes = [
    APP_ROUTES.tutorRoot,
    APP_ROUTES.bookSession,
    APP_ROUTES.sessions,
    APP_ROUTES.notifications,
    APP_ROUTES.settingsNotifications,
    APP_ROUTES.admin,
    APP_ROUTES.billing,
    APP_ROUTES.recommendations,
    APP_ROUTES.studyPlan,
    APP_ROUTES.aiTutor,
    APP_ROUTES.community,
    APP_ROUTES.dashboard,
    APP_ROUTES.courses,
    APP_ROUTES.subnettingPractice,
    APP_ROUTES.labs,
    APP_ROUTES.cliPractice,
    APP_ROUTES.support,
    APP_ROUTES.tutors,
    APP_ROUTES.quizzes,
    APP_ROUTES.examSimulator
  ];
  const isProtectedRoute = protectedRoutePrefixes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => route === pathname);

  if (!hasSupabaseEnv()) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL(APP_ROUTES.login, request.url));
    }

    return response;
  }

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

  let user = null;

  try {
    const {
      data: { user: authUser }
    } = await supabase.auth.getUser();

    user = authUser;
  } catch (error) {
    if (!isRecoverableAuthSessionError(error)) {
      throw error;
    }

    const clearedResponse = clearSupabaseAuthCookies(
      request,
      NextResponse.next({
        request
      })
    );

    if (isProtectedRoute) {
      const redirectResponse = NextResponse.redirect(
        new URL(APP_ROUTES.login, request.url)
      );

      return withSupabaseCookies(
        clearSupabaseAuthCookies(request, redirectResponse),
        clearedResponse
      );
    }

    return withSupabaseCookies(clearedResponse, response);
  }

  if (!user && isProtectedRoute) {
    const redirectResponse = NextResponse.redirect(
      new URL(APP_ROUTES.login, request.url)
    );

    return withSupabaseCookies(redirectResponse, response);
  }

  if (user && isAuthRoute) {
    const redirectResponse = NextResponse.redirect(
      new URL(APP_ROUTES.dashboard, request.url)
    );

    return withSupabaseCookies(redirectResponse, response);
  }

  return response;
}
