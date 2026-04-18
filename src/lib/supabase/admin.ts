import { createClient } from "@supabase/supabase-js";

import {
  getSupabaseServiceRoleEnv,
  hasSupabaseServiceRoleEnv
} from "@/lib/supabase/config";

export const SUPABASE_SERVICE_ROLE_MISSING_MESSAGE =
  "Supabase server-side auth key environment variables are not configured.";

export function createServiceRoleSupabaseClient() {
  if (!hasSupabaseServiceRoleEnv()) {
    throw new Error(SUPABASE_SERVICE_ROLE_MISSING_MESSAGE);
  }

  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseServiceRoleEnv();

  return createClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function isMissingServiceRoleConfigError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes(SUPABASE_SERVICE_ROLE_MISSING_MESSAGE)
  );
}
