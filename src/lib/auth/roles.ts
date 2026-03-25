import { redirect } from "next/navigation";

import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AppRole = "admin" | "tutor" | "learner";

export interface AuthenticatedAppUser {
  id: string;
  email: string | undefined;
  role: AppRole;
}

async function resolveUserRole(userId: string): Promise<AppRole> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return "learner";
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve user role: ${error.message}`);
  }

  const role = (data?.role ?? "learner") as AppRole;

  return ["admin", "tutor", "learner"].includes(role) ? role : "learner";
}

export async function getCurrentUserRole(): Promise<AppRole | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return resolveUserRole(user.id);
}

export async function getCurrentAuthenticatedAppUser(): Promise<AuthenticatedAppUser | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: await resolveUserRole(user.id)
  };
}

export async function requireAuthenticatedAppUser(): Promise<AuthenticatedAppUser> {
  const user = await getCurrentAuthenticatedAppUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  return user;
}

export async function requireAdminUser(): Promise<AuthenticatedAppUser> {
  const user = await requireAuthenticatedAppUser();

  if (user.role !== "admin") {
    redirect(APP_ROUTES.dashboard);
  }

  return user;
}

export async function isAdminUser(): Promise<boolean> {
  const role = await getCurrentUserRole();

  return role === "admin";
}

export async function requireTutorUser(): Promise<AuthenticatedAppUser> {
  const user = await requireAuthenticatedAppUser();

  if (user.role !== "tutor") {
    redirect(APP_ROUTES.dashboard);
  }

  return user;
}

export async function isTutorUser(): Promise<boolean> {
  const role = await getCurrentUserRole();

  return role === "tutor";
}
