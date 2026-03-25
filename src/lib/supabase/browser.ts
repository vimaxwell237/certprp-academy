"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/config";

let client: SupabaseClient | null = null;

export function createBrowserSupabaseClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  if (!client) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

    client = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  }

  return client;
}

