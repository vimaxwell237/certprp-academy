import { redirect } from "next/navigation";

import { APP_ROUTES } from "@/lib/auth/redirects";
import { isRecoverableAuthSessionError } from "@/lib/supabase/auth-errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    return user;
  } catch (error) {
    if (isRecoverableAuthSessionError(error)) {
      return null;
    }

    throw error;
  }
}

export async function redirectIfAuthenticated() {
  const user = await getCurrentUser();

  if (user) {
    redirect(APP_ROUTES.dashboard);
  }
}
