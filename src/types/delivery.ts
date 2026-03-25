export type NotificationChannel = "in_app" | "email";

export type DeliveryChannel = "email";

export type NotificationTemplateKey =
  | "session_booked"
  | "session_confirmed"
  | "session_canceled"
  | "session_reminder"
  | "session_completed"
  | "followup_added";

export type NotificationDeliveryStatus = "pending" | "sent" | "failed" | "ignored";

export type ScheduledJobStatus = "pending" | "processed" | "failed" | "canceled";

export type ReminderJobType = "session_reminder_24h" | "session_reminder_soon";

export interface NotificationDeliverySummary {
  id: string;
  channel: DeliveryChannel;
  templateKey: NotificationTemplateKey;
  status: NotificationDeliveryStatus;
  sentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  retryCount: number;
  maxRetries: number;
  lastAttemptedAt: string | null;
}

export interface SessionReminderState {
  pendingCount: number;
  nextScheduledFor: string | null;
  retryCount: number;
}

export interface DashboardDeliverySnapshot {
  pendingReminderCount: number;
  pendingDeliveryCount: number;
  failedDeliveryCount: number;
  latestDelivery: NotificationDeliverySummary | null;
}

export interface NotificationPreferenceItem {
  notificationType: NotificationTemplateKey;
  label: string;
  description: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
}
