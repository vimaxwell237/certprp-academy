import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NOTIFICATION_PREFERENCE_DEFINITIONS } from "@/features/delivery/lib/preferences";
import type {
  NotificationPreferenceItem,
  NotificationTemplateKey
} from "@/types/delivery";

type ServerSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

type PreferenceRow = {
  channel: "in_app" | "email";
  notification_type: NotificationTemplateKey;
  is_enabled: boolean;
};

async function getSupabaseClient(): Promise<ServerSupabaseClient> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return supabase;
}

export async function fetchNotificationPreferences(
  userId: string
): Promise<NotificationPreferenceItem[]> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("channel,notification_type,is_enabled")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to load notification preferences: ${error.message}`);
  }

  const preferenceMap = new Map(
    (((data as PreferenceRow[] | null) ?? [])).map((row) => [
      `${row.channel}:${row.notification_type}`,
      row.is_enabled
    ])
  );

  return NOTIFICATION_PREFERENCE_DEFINITIONS.map((definition) => ({
    notificationType: definition.notificationType,
    label: definition.label,
    description: definition.description,
    inAppEnabled: preferenceMap.get(`in_app:${definition.notificationType}`) ?? true,
    emailEnabled: preferenceMap.get(`email:${definition.notificationType}`) ?? true
  }));
}

export async function updateEmailNotificationPreferences(
  userId: string,
  updates: Record<NotificationTemplateKey, boolean>
) {
  const supabase = await getSupabaseClient();
  const rows = Object.entries(updates).map(([notificationType, isEnabled]) => ({
    user_id: userId,
    channel: "email" as const,
    notification_type: notificationType as NotificationTemplateKey,
    is_enabled: isEnabled
  }));

  const { error } = await supabase.from("notification_preferences").upsert(rows, {
    onConflict: "user_id,channel,notification_type"
  });

  if (error) {
    throw new Error(`Failed to update notification preferences: ${error.message}`);
  }
}
