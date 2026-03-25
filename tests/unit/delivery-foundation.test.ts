import assert from "node:assert/strict";
import test from "node:test";

import { buildNotificationEmailTemplate } from "@/features/delivery/lib/email-templates";
import {
  buildReminderDedupeKey,
  getReminderWindows
} from "@/features/delivery/lib/reminder-planning";

test("getReminderWindows returns 24h and near-session reminders when eligible", () => {
  const now = new Date("2026-03-10T12:00:00.000Z");
  const sessionStartsAt = "2026-03-12T15:00:00.000Z";
  const windows = getReminderWindows(sessionStartsAt, now);

  assert.deepEqual(
    windows.map((window) => window.jobType),
    ["session_reminder_24h", "session_reminder_soon"]
  );
  assert.equal(windows[0]?.scheduledFor, "2026-03-11T15:00:00.000Z");
  assert.equal(windows[1]?.scheduledFor, "2026-03-12T14:00:00.000Z");
});

test("getReminderWindows skips invalid or stale reminder windows", () => {
  const now = new Date("2026-03-10T12:00:00.000Z");

  assert.deepEqual(getReminderWindows("2026-03-10T12:05:00.000Z", now), []);
  assert.deepEqual(getReminderWindows("2026-03-11T08:00:00.000Z", now), [
    {
      jobType: "session_reminder_soon",
      scheduledFor: "2026-03-11T07:00:00.000Z"
    }
  ]);
});

test("buildReminderDedupeKey is stable per user, session, and reminder kind", () => {
  assert.equal(
    buildReminderDedupeKey(
      "session_reminder_24h",
      "session-123",
      "user-456"
    ),
    "session-reminder-24h:session-123:user-456"
  );
  assert.equal(
    buildReminderDedupeKey(
      "session_reminder_soon",
      "session-123",
      "user-456"
    ),
    "session-reminder-soon:session-123:user-456"
  );
});

test("buildNotificationEmailTemplate includes branded session metadata and CTA links", () => {
  const message = buildNotificationEmailTemplate({
    to: "learner@example.com",
    templateKey: "session_confirmed",
    notificationTitle: "Tutor session confirmed",
    notificationMessage: "Your session was confirmed by the tutor.",
    linkUrl: "/sessions",
    session: {
      subject: "OSPF troubleshooting",
      category: "lab_help",
      scheduledStartsAt: "2026-03-12T15:00:00.000Z",
      scheduledEndsAt: "2026-03-12T16:00:00.000Z",
      tutorDisplayName: "Jordan Rivers",
      meetingLink: "https://meet.example.com/ospf"
    }
  });

  assert.equal(message.subject, "CertPrep Academy | Tutor session confirmed");
  assert.match(message.html, /CertPrep Academy/);
  assert.match(message.html, /OSPF troubleshooting/);
  assert.match(message.html, /Jordan Rivers/);
  assert.match(message.html, /http:\/\/localhost:3000\/sessions/);
  assert.match(message.text, /Meeting link: https:\/\/meet\.example\.com\/ospf/);
});
