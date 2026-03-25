import type {
  AdminTriageIssue
} from "@/types/operations";
import type { NotificationDeliveryStatus, ScheduledJobStatus } from "@/types/delivery";

export const STALE_QUEUE_MINUTES = 30;

function isOlderThanMinutes(
  timestamp: string | null | undefined,
  minutes: number,
  now = Date.now()
) {
  if (!timestamp) {
    return false;
  }

  return new Date(timestamp).getTime() <= now - minutes * 60 * 1000;
}

export function buildDeliveryTriageIssues(input: {
  status: NotificationDeliveryStatus;
  retryCount: number;
  maxRetries: number;
  errorMessage: string | null;
  createdAt: string;
  nextAttemptAt: string | null;
  missingTargetInfo?: boolean;
  invalidRelatedEntity?: boolean;
}) {
  const issues: AdminTriageIssue[] = [];
  const staleReference = input.nextAttemptAt ?? input.createdAt;

  if (input.status === "failed" && input.retryCount >= input.maxRetries) {
    issues.push({
      code: "retry_exhausted",
      label: "Retry budget exhausted",
      severity: "danger"
    });
  } else if (input.retryCount >= 2) {
    issues.push({
      code: "repeated_failures",
      label: "Repeated delivery failures",
      severity: "warning"
    });
  }

  if (input.status === "pending" && isOlderThanMinutes(staleReference, STALE_QUEUE_MINUTES)) {
    issues.push({
      code: "stale_pending",
      label: "Pending longer than expected",
      severity: "warning"
    });
  }

  if (input.missingTargetInfo) {
    issues.push({
      code: "missing_target",
      label: "Missing notification or target data",
      severity: "danger"
    });
  }

  if (input.invalidRelatedEntity) {
    issues.push({
      code: "invalid_related_entity",
      label: "Linked session is invalid for delivery",
      severity: "danger"
    });
  }

  if (input.status === "failed" && !input.errorMessage) {
    issues.push({
      code: "missing_error",
      label: "Failure without error detail",
      severity: "warning"
    });
  }

  return issues;
}

export function buildJobTriageIssues(input: {
  status: ScheduledJobStatus;
  retryCount: number;
  maxRetries: number;
  errorMessage: string | null;
  scheduledFor: string;
  missingTargetInfo?: boolean;
  invalidRelatedEntity?: boolean;
}) {
  const issues: AdminTriageIssue[] = [];

  if (input.status === "failed" && input.retryCount >= input.maxRetries) {
    issues.push({
      code: "retry_exhausted",
      label: "Retry budget exhausted",
      severity: "danger"
    });
  } else if (input.retryCount >= 2) {
    issues.push({
      code: "repeated_failures",
      label: "Repeated job failures",
      severity: "warning"
    });
  }

  if (input.status === "pending" && isOlderThanMinutes(input.scheduledFor, STALE_QUEUE_MINUTES)) {
    issues.push({
      code: "stale_pending",
      label: "Pending longer than expected",
      severity: "warning"
    });
  }

  if (input.missingTargetInfo) {
    issues.push({
      code: "missing_target",
      label: "Missing reminder target data",
      severity: "danger"
    });
  }

  if (input.invalidRelatedEntity) {
    issues.push({
      code: "invalid_related_entity",
      label: "Linked session is invalid for reminder",
      severity: "danger"
    });
  }

  if (input.status === "failed" && !input.errorMessage) {
    issues.push({
      code: "missing_error",
      label: "Failure without error detail",
      severity: "warning"
    });
  }

  return issues;
}

export function hasNeedsAttention(issues: AdminTriageIssue[]) {
  return issues.length > 0;
}

export function isStaleQueueItem(timestamp: string | null | undefined) {
  return isOlderThanMinutes(timestamp, STALE_QUEUE_MINUTES);
}
