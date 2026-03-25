"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { NOTIFICATION_TYPES } from "@/features/delivery/lib/preferences";
import { updateEmailNotificationPreferences } from "@/features/delivery/data/preferences-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";
import type { NotificationTemplateKey } from "@/types/delivery";

export async function updateNotificationPreferencesAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const updates = NOTIFICATION_TYPES.reduce(
    (accumulator, notificationType) => {
      accumulator[notificationType] = formData.get(`email-${notificationType}`) === "on";
      return accumulator;
    },
    {} as Record<NotificationTemplateKey, boolean>
  );

  try {
    await updateEmailNotificationPreferences(user.id, updates);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update notification preferences.";
    redirect(
      `${APP_ROUTES.settingsNotifications}?error=${encodeURIComponent(message)}`
    );
  }

  revalidatePath(APP_ROUTES.settingsNotifications);
  revalidatePath(APP_ROUTES.notifications);
  revalidatePath(APP_ROUTES.dashboard);
  redirect(
    `${APP_ROUTES.settingsNotifications}?success=${encodeURIComponent("Notification preferences updated.")}`
  );
}
