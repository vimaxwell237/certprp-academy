import type { NotificationDeliverySummary } from "@/types/delivery";

export type NotificationType =
  | "session_booked"
  | "session_confirmed"
  | "session_canceled"
  | "session_reminder"
  | "session_completed"
  | "followup_added"
  | "operator_mentioned"
  | "operation_watch_update"
  | "operation_subscription_match"
  | "automation_acknowledgement_assignment"
  | "automation_acknowledgement_reminder"
  | "automation_acknowledgement_overdue"
  | "automation_verification_needed";

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
  latestDelivery: NotificationDeliverySummary | null;
}

export interface NotificationNavSnapshot {
  unreadCount: number;
}

export interface DashboardNotificationSnapshot {
  unreadCount: number;
  latestSessionUpdate: NotificationItem | null;
  pendingReminderCount: number;
}
