"use client";

import { useEffect, useState } from "react";

import { SelectionAskAiTutor } from "@/features/ai-tutor/components/selection-ask-ai-tutor";
import { TutorWidget } from "@/features/ai-tutor/components/tutor-widget";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { NavbarShell } from "@/components/layout/navbar-shell";
import type { NavigationUser } from "@/types/auth";

function normalizeRole(role: string | null | undefined) {
  if (role === "admin" || role === "tutor" || role === "learner") {
    return role;
  }

  return "learner";
}

export function LayoutChrome() {
  const [user, setUser] = useState<NavigationUser | null>(null);

  useEffect(() => {
    const client = createBrowserSupabaseClient();

    if (!client) {
      return;
    }

    const supabase = client;

    let isActive = true;

    async function loadNavigationUser() {
      try {
        const {
          data: { user: authUser }
        } = await supabase.auth.getUser();

        if (!isActive) {
          return;
        }

        if (!authUser) {
          setUser(null);
          return;
        }

        const [roleResult, unreadResult] = await Promise.all([
          supabase.from("user_roles").select("role").eq("user_id", authUser.id).maybeSingle(),
          supabase
            .from("notifications")
            .select("id", { count: "exact", head: true })
            .eq("user_id", authUser.id)
            .eq("is_read", false)
        ]);

        if (!isActive) {
          return;
        }

        setUser({
          email: authUser.email,
          role: normalizeRole(roleResult.data?.role),
          notificationUnreadCount: unreadResult.error ? 0 : unreadResult.count ?? 0
        });
      } catch {
        if (isActive) {
          setUser(null);
        }
      }
    }

    void loadNavigationUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      void loadNavigationUser();
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAuthenticated = Boolean(user?.email);

  return (
    <>
      <NavbarShell user={user} />
      {isAuthenticated ? <SelectionAskAiTutor /> : null}
      {isAuthenticated ? <TutorWidget /> : null}
    </>
  );
}
