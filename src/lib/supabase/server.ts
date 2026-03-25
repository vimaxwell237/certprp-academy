import {
  createServerClient,
  type CookieOptions
} from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/config";

type SupabaseCookie = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function createServerSupabaseClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const cookieStore = await cookies();
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: SupabaseCookie[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components may not persist cookies; middleware handles refreshes.
        }
      }
    }
  });
}
