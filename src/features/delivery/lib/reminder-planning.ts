import type { ReminderJobType } from "@/types/delivery";

export interface ReminderWindow {
  jobType: ReminderJobType;
  scheduledFor: string;
}

export function buildReminderDedupeKey(
  jobType: ReminderJobType,
  sessionId: string,
  userId: string
) {
  const suffix = jobType === "session_reminder_24h" ? "24h" : "soon";

  return `session-reminder-${suffix}:${sessionId}:${userId}`;
}

export function getReminderWindows(
  sessionStartsAt: string,
  now = new Date()
): ReminderWindow[] {
  const startTime = new Date(sessionStartsAt).getTime();
  const nowTime = now.getTime();

  if (!Number.isFinite(startTime) || startTime <= nowTime) {
    return [];
  }

  const windows: ReminderWindow[] = [];
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  const oneHourMs = 60 * 60 * 1000;
  const fifteenMinutesMs = 15 * 60 * 1000;

  if (startTime - nowTime > twentyFourHoursMs) {
    windows.push({
      jobType: "session_reminder_24h",
      scheduledFor: new Date(startTime - twentyFourHoursMs).toISOString()
    });
  }

  if (startTime - nowTime > fifteenMinutesMs) {
    windows.push({
      jobType: "session_reminder_soon",
      scheduledFor: new Date(Math.max(nowTime + 60 * 1000, startTime - oneHourMs)).toISOString()
    });
  }

  return windows;
}
