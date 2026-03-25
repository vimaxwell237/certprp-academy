import { createClient } from "@supabase/supabase-js";

import {
  getSupabaseServiceRoleEnv,
  hasSupabaseServiceRoleEnv
} from "@/lib/supabase/config";

export function createServiceRoleSupabaseClient() {
  if (!hasSupabaseServiceRoleEnv()) {
    throw new Error("Supabase service role environment variables are not configured.");
  }

  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseServiceRoleEnv();

  return createClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
