import assert from "node:assert/strict";
import test from "node:test";

import {
  matchesDeliverySubscription,
  matchesJobSubscription,
  normalizeSubscriptionFilters,
  summarizeMatchedIncidents
} from "@/features/operations/lib/subscriptions";
import type {
  AdminDeliveryFilters,
  AdminDeliveryRecord,
  AdminJobFilters,
  AdminScheduledJobRecord
} from "@/types/operations";

const delivery: AdminDeliveryRecord = {
  id: "delivery-1",
  notificationId: "notification-1",
  userId: "user-1",
  channel: "email",
  templateKey: "session_confirmed",
  status: "failed",
  retryCount: 2,
  maxRetries: 3,
  errorMessage: "Timeout",
  sentAt: null,
  lastAttemptedAt: null,
  createdAt: "2026-03-12T12:00:00.000Z",
  nextAttemptAt: null,
  relatedEntityType: "tutor_session",
  relatedEntityId: "session-1",
  assignedAdminUserId: null,
  assignedAdminUserLabel: null,
  assignedAt: null,
  handoffNote: null,
  workflowState: "investigating",
  workflowStateUpdatedAt: "2026-03-12T12:00:00.000Z",
  isEscalated: true,
  escalatedAt: "2026-03-12T12:00:00.000Z",
  escalatedByAdminUserId: "admin-1",
  escalatedByAdminUserLabel: "admin@example.com",
  escalationReason: "Needs team review",
  watcherCount: 2,
  watchedByTeam: true,
  teamAttention: true,
  needsAttention: true,
  triageIssues: []
};

const job: AdminScheduledJobRecord = {
  id: "job-1",
  userId: "user-1",
  jobType: "session_reminder_24h",
  relatedEntityType: "tutor_session",
  relatedEntityId: "session-1",
  status: "failed",
  retryCount: 2,
  maxRetries: 3,
  scheduledFor: "2026-03-12T12:00:00.000Z",
  processedAt: null,
  errorMessage: "Timeout",
  lastAttemptedAt: null,
  createdAt: "2026-03-12T12:00:00.000Z",
  payloadPreview: "{}",
  assignedAdminUserId: "admin-1",
  assignedAdminUserLabel: "admin@example.com",
  assignedAt: "2026-03-12T12:00:00.000Z",
  handoffNote: null,
  workflowState: "waiting",
  workflowStateUpdatedAt: "2026-03-12T12:00:00.000Z",
  isEscalated: false,
  escalatedAt: null,
  escalatedByAdminUserId: null,
  escalatedByAdminUserLabel: null,
  escalationReason: null,
  watcherCount: 1,
  watchedByTeam: false,
  teamAttention: true,
  needsAttention: true,
  triageIssues: []
};

test("normalizeSubscriptionFilters retains watched and escalated filters", () => {
  const filters = normalizeSubscriptionFilters("notification_delivery", {
    watchedOnly: true,
    escalatedOnly: true,
    workflowState: "investigating"
  });

  assert.equal(filters.watchedOnly, true);
  assert.equal(filters.escalatedOnly, true);
  assert.equal(filters.workflowState, "investigating");
});

test("matchesDeliverySubscription respects watched and escalated filters", () => {
  const matched = matchesDeliverySubscription(
    delivery,
    normalizeSubscriptionFilters("notification_delivery", {
      watchedOnly: true,
      escalatedOnly: true,
      workflowState: "investigating"
    }) as AdminDeliveryFilters,
    {
      adminUserId: "admin-2",
      isWatching: true,
      recentlyHandedOff: false
    }
  );

  assert.equal(matched, true);
});

test("matchesJobSubscription rejects assigned-to-me filters for other admins", () => {
  const filters = normalizeSubscriptionFilters("scheduled_job", {
    ownership: "assigned_to_me",
    workflowState: "waiting"
  }) as AdminJobFilters;

  const matched = matchesJobSubscription(job, filters, {
    adminUserId: "admin-2",
    isWatching: true,
    recentlyHandedOff: false
  });

  assert.equal(matched, false);
});

test("summarizeMatchedIncidents counts total, escalated, and stale rows", () => {
  const summary = summarizeMatchedIncidents([
    {
      isEscalated: true,
      triageIssues: [
        {
          code: "stale_pending"
        }
      ]
    },
    {
      isEscalated: true,
      triageIssues: []
    },
    {
      isEscalated: false,
      triageIssues: []
    }
  ]);

  assert.deepEqual(summary, {
    currentMatchCount: 3,
    escalatedMatchCount: 2,
    staleMatchCount: 1
  });
});
