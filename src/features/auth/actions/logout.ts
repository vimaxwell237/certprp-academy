"use server";

import { redirect } from "next/navigation";

import { APP_ROUTES } from "@/lib/auth/redirects";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect(APP_ROUTES.home);
}

