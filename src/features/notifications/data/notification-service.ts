import { fetchDashboardDeliverySnapshot, processNotificationDeliveryPipeline } from "@/features/delivery/data/delivery-service";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { NotificationTemplateKey } from "@/types/delivery";
import type {
  DashboardNotificationSnapshot,
  NotificationItem,
  NotificationNavSnapshot,
  NotificationType
} from "@/types/notifications";

type ServerSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
  deliveries: Array<{
    id: string;
    channel: "email";
    template_key: NotificationTemplateKey;
    status: "pending" | "sent" | "failed";
    sent_at: string | null;
    error_message: string | null;
    created_at: string;
    retry_count: number;
    max_retries: number;
    last_attempted_at: string | null;
  }> | null;
};

function mapNotification(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    linkUrl: row.link_url,
    isRead: row.is_read,
    createdAt: row.created_at,
    latestDelivery: row.deliveries?.[0]
      ? {
          id: row.deliveries[0].id,
          channel: row.deliveries[0].channel,
          templateKey: row.deliveries[0].template_key,
          status: row.deliveries[0].status,
          sentAt: row.deliveries[0].sent_at,
          errorMessage: row.deliveries[0].error_message,
          createdAt: row.deliveries[0].created_at,
          retryCount: row.deliveries[0].retry_count,
          maxRetries: row.deliveries[0].max_retries,
          lastAttemptedAt: row.deliveries[0].last_attempted_at
        }
      : null
  };
}

async function getSupabaseClient(): Promise<ServerSupabaseClient> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return supabase;
}

export async function fetchNotificationNavSnapshot(
  userId: string
): Promise<NotificationNavSnapshot> {
  const supabase = await getSupabaseClient();
  await processNotificationDeliveryPipeline(userId);

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    throw new Error(`Failed to load notification count: ${error.message}`);
  }

  return {
    unreadCount: count ?? 0
  };
}

export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const supabase = await getSupabaseClient();
  await processNotificationDeliveryPipeline(userId);
  const { data, error } = await supabase
    .from("notifications")
    .select(
      "id,user_id,type,title,message,link_url,is_read,created_at,deliveries:notification_deliveries(id,channel,template_key,status,sent_at,error_message,created_at,retry_count,max_retries,last_attempted_at)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to load notifications: ${error.message}`);
  }

  return ((data as NotificationRow[] | null) ?? []).map(mapNotification);
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }

  if (!data) {
    throw new Error("Notification not found or not accessible.");
  }
}

export async function fetchDashboardNotificationSnapshot(
  userId: string
): Promise<DashboardNotificationSnapshot | null> {
  const supabase = await getSupabaseClient();
  await processNotificationDeliveryPipeline(userId);
  const [countData, latestData, deliverySnapshot] = await Promise.all([
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false),
    supabase
      .from("notifications")
      .select("id,user_id,type,title,message,link_url,is_read,created_at")
      .eq("user_id", userId)
      .in("type", [
        "session_booked",
        "session_confirmed",
        "session_canceled",
        "session_reminder",
        "session_completed",
        "followup_added"
      ])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    fetchDashboardDeliverySnapshot(userId)
  ]);

  if (countData.error) {
    throw new Error(`Failed to count dashboard notifications: ${countData.error.message}`);
  }

  if (latestData.error) {
    throw new Error(`Failed to load latest session update notification: ${latestData.error.message}`);
  }

  return {
    unreadCount: countData.count ?? 0,
    latestSessionUpdate: latestData.data
      ? mapNotification({
          ...(latestData.data as NotificationRow),
          deliveries: null
        })
      : null,
    pendingReminderCount: deliverySnapshot.pendingReminderCount
  };
}
