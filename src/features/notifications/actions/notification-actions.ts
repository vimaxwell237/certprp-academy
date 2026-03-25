"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { markNotificationRead } from "@/features/notifications/data/notification-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export async function markNotificationReadAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const notificationId = String(formData.get("notificationId") ?? "");

  if (!notificationId) {
    redirect(`${APP_ROUTES.notifications}?error=${encodeURIComponent("Notification id is required.")}`);
  }

  try {
    await markNotificationRead(user.id, notificationId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to mark the notification as read.";
    redirect(`${APP_ROUTES.notifications}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(APP_ROUTES.notifications);
  revalidatePath(APP_ROUTES.dashboard);
  redirect(`${APP_ROUTES.notifications}?success=${encodeURIComponent("Notification marked as read.")}`);
}
