import assert from "node:assert/strict";
import test from "node:test";

import { hasValidAutomationSecret } from "@/features/delivery/lib/automation-auth";
import { NOTIFICATION_TYPES } from "@/features/delivery/lib/preferences";
import {
  buildNextRetryAt,
  canRetry,
  getRetryDelayMinutes
} from "@/features/delivery/lib/retry";

test("retry delays escalate with a capped backoff schedule", () => {
  assert.equal(getRetryDelayMinutes(1), 5);
  assert.equal(getRetryDelayMinutes(2), 15);
  assert.equal(getRetryDelayMinutes(3), 60);
  assert.equal(getRetryDelayMinutes(5), 60);
});

test("buildNextRetryAt returns a deterministic timestamp from the retry schedule", () => {
  const now = new Date("2026-03-10T12:00:00.000Z");

  assert.equal(buildNextRetryAt(1, now), "2026-03-10T12:05:00.000Z");
  assert.equal(buildNextRetryAt(2, now), "2026-03-10T12:15:00.000Z");
  assert.equal(buildNextRetryAt(3, now), "2026-03-10T13:00:00.000Z");
});

test("canRetry stops after the max retry threshold is reached", () => {
  assert.equal(canRetry(0, 3), true);
  assert.equal(canRetry(2, 3), true);
  assert.equal(canRetry(3, 3), false);
});

test("automation secret validation requires an exact match", () => {
  assert.equal(hasValidAutomationSecret("secret-123", "secret-123"), true);
  assert.equal(hasValidAutomationSecret("secret-123", "secret-456"), false);
  assert.equal(hasValidAutomationSecret(null, "secret-123"), false);
  assert.equal(hasValidAutomationSecret("secret-123", undefined), false);
});

test("notification preference definitions cover the supported event types once", () => {
  assert.deepEqual([...new Set(NOTIFICATION_TYPES)].sort(), [...NOTIFICATION_TYPES].sort());
  assert.deepEqual([...NOTIFICATION_TYPES].sort(), [
    "followup_added",
    "session_booked",
    "session_canceled",
    "session_completed",
    "session_confirmed",
    "session_reminder"
  ]);
});
