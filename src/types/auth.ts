import type { User } from "@supabase/supabase-js";

import type { AppRole } from "@/lib/auth/roles";

export type AuthMode = "login" | "signup";

export interface AuthStatus {
  error: string | null;
  success: string | null;
}

export interface NavigationUser {
  email?: User["email"];
  role?: AppRole;
  notificationUnreadCount?: number;
}
