import type { NotificationTemplateKey } from "@/types/delivery";

export const NOTIFICATION_PREFERENCE_DEFINITIONS: Array<{
  notificationType: NotificationTemplateKey;
  label: string;
  description: string;
}> = [
  {
    notificationType: "session_booked",
    label: "Session booked",
    description: "Tutor alert when a learner books a new live-help request."
  },
  {
    notificationType: "session_confirmed",
    label: "Session confirmed",
    description: "Learner update when a tutor confirms a session or adds a meeting link."
  },
  {
    notificationType: "session_canceled",
    label: "Session canceled",
    description: "Learner or tutor update when a booked session is canceled."
  },
  {
    notificationType: "session_reminder",
    label: "Session reminders",
    description: "Reminder alerts for upcoming confirmed live sessions."
  },
  {
    notificationType: "session_completed",
    label: "Session completed",
    description: "Learner update when a tutor marks the session complete."
  },
  {
    notificationType: "followup_added",
    label: "Tutor follow-up",
    description: "Learner update when a tutor posts post-session guidance."
  }
];

export const NOTIFICATION_TYPES = NOTIFICATION_PREFERENCE_DEFINITIONS.map(
  (item) => item.notificationType
);
