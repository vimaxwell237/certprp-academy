import { createHash } from "node:crypto";

import type {
  AdminDeliveryFilters,
  AdminDeliveryRecord,
  AdminJobFilters,
  AdminScheduledJobRecord,
  OperationAutomationControlState,
  OperationAutomationRunStatus,
  OperationEntityType
} from "@/types/operations";

export function getCooldownWindow(
  lastRunAt: string | null,
  cooldownMinutes: number,
  now = new Date()
) {
  if (!lastRunAt || cooldownMinutes <= 0) {
    return {
      eligible: true,
      nextEligibleAt: null as string | null
    };
  }

  const nextEligible = new Date(new Date(lastRunAt).getTime() + cooldownMinutes * 60 * 1000);

  return {
    eligible: nextEligible.getTime() <= now.getTime(),
    nextEligibleAt: nextEligible.toISOString()
  };
}

export function getAutomationControlState(
  isMuted: boolean,
  snoozedUntil: string | null,
  now = new Date()
): OperationAutomationControlState {
  if (isMuted) {
    return "muted";
  }

  if (snoozedUntil && new Date(snoozedUntil).getTime() > now.getTime()) {
    return "snoozed";
  }

  return "active";
}

export function getAutomationEligibility(input: {
  isMuted: boolean;
  snoozedUntil: string | null;
  lastRunAt: string | null;
  cooldownMinutes: number;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const controlState = getAutomationControlState(input.isMuted, input.snoozedUntil, now);

  if (controlState === "muted") {
    return {
      eligible: false,
      controlState,
      skipReason: "Muted by operator.",
      nextEligibleAt: null as string | null
    };
  }

  if (controlState === "snoozed") {
    return {
      eligible: false,
      controlState,
      skipReason: `Snoozed until ${new Date(input.snoozedUntil as string).toISOString()}.`,
      nextEligibleAt: input.snoozedUntil
    };
  }

  const cooldown = getCooldownWindow(input.lastRunAt, input.cooldownMinutes, now);

  if (!cooldown.eligible) {
    return {
      eligible: false,
      controlState,
      skipReason: "Cooldown window is still active.",
      nextEligibleAt: cooldown.nextEligibleAt
    };
  }

  return {
    eligible: true,
    controlState,
    skipReason: null as string | null,
    nextEligibleAt: cooldown.nextEligibleAt
  };
}

export function limitMatchesForRun<T>(matches: T[], maxMatchesPerRun: number) {
  if (!Number.isFinite(maxMatchesPerRun) || maxMatchesPerRun < 1) {
    return matches;
  }

  return matches.slice(0, Math.floor(maxMatchesPerRun));
}

export function buildOperationMatchExplanation(
  entityType: OperationEntityType,
  filters: AdminDeliveryFilters | AdminJobFilters
) {
  const parts: string[] = [];

  if (filters.status !== "all") {
    parts.push(`status=${filters.status}`);
  }

  if (entityType === "notification_delivery") {
    const deliveryFilters = filters as AdminDeliveryFilters;

    if (deliveryFilters.templateKey !== "all") {
      parts.push(`template_key=${deliveryFilters.templateKey}`);
    }

    if (deliveryFilters.channel !== "all") {
      parts.push(`channel=${deliveryFilters.channel}`);
    }
  } else {
    const jobFilters = filters as AdminJobFilters;

    if (jobFilters.jobType !== "all") {
      parts.push(`job_type=${jobFilters.jobType}`);
    }
  }

  if (filters.workflowState !== "all") {
    parts.push(`workflow_state=${filters.workflowState}`);
  }

  if (filters.ownership === "unassigned") {
    parts.push("unassigned");
  } else if (filters.ownership === "assigned_to_me") {
    parts.push("assigned_to_me");
  }

  if (filters.needsAttention) {
    parts.push("needs_attention");
  }

  if (filters.watchedOnly) {
    parts.push("watched_only");
  }

  if (filters.escalatedOnly) {
    parts.push("escalated_only");
  }

  if (filters.relatedEntityType) {
    parts.push(`related_entity_type=${filters.relatedEntityType}`);
  }

  if (parts.length === 0) {
    return entityType === "notification_delivery"
      ? "Matches all notification deliveries in this queue."
      : "Matches all scheduled jobs in this queue.";
  }

  return `Matched because ${parts.join(", ")}.`;
}

export function buildDigestFingerprint(
  entityType: OperationEntityType,
  matches: Array<AdminDeliveryRecord | AdminScheduledJobRecord>
) {
  const normalized = matches.map((match) =>
    entityType === "notification_delivery"
      ? {
          id: match.id,
          status: (match as AdminDeliveryRecord).status,
          workflowState: match.workflowState,
          escalationReason: match.escalationReason,
          isEscalated: match.isEscalated
        }
      : {
          id: match.id,
          status: (match as AdminScheduledJobRecord).status,
          workflowState: match.workflowState,
          escalationReason: match.escalationReason,
          isEscalated: match.isEscalated
        }
  );

  return createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}

export function buildDigestSummary(
  entityType: OperationEntityType,
  name: string,
  explanation: string,
  matches: Array<AdminDeliveryRecord | AdminScheduledJobRecord>
) {
  const escalatedCount = matches.filter((match) => match.isEscalated).length;
  const attentionCount = matches.filter((match) => match.needsAttention).length;

  return `${name}: ${matches.length} ${entityType === "notification_delivery" ? "deliveries" : "jobs"} matched. ${attentionCount} need attention, ${escalatedCount} are already escalated. ${explanation}`;
}

export function buildMaxMatchCapReason(totalMatches: number, processedMatches: number) {
  if (processedMatches >= totalMatches) {
    return null;
  }

  return `Max-match cap applied; ${totalMatches - processedMatches} incident(s) were skipped this run.`;
}

export function buildAutomationHealthUpdate(
  current: {
    consecutiveSkipCount: number;
    consecutiveFailureCount: number;
    lastSuccessAt: string | null;
    lastFailureAt: string | null;
  },
  input: {
    runStatus: OperationAutomationRunStatus;
    occurredAt: string;
    skipReason?: string | null;
  }
) {
  if (input.runStatus === "success") {
    return {
      consecutive_skip_count: 0,
      consecutive_failure_count: 0,
      last_success_at: input.occurredAt,
      last_failure_at: current.lastFailureAt,
      last_skip_reason: null
    };
  }

  if (input.runStatus === "skipped") {
    return {
      consecutive_skip_count: current.consecutiveSkipCount + 1,
      consecutive_failure_count: 0,
      last_success_at: current.lastSuccessAt,
      last_failure_at: current.lastFailureAt,
      last_skip_reason: input.skipReason?.trim() || "Skipped by automation controls."
    };
  }

  return {
    consecutive_skip_count: 0,
    consecutive_failure_count: current.consecutiveFailureCount + 1,
    last_success_at: current.lastSuccessAt,
    last_failure_at: input.occurredAt,
    last_skip_reason: null
  };
}

export function isAutomationUnhealthy(
  consecutiveSkipCount: number,
  consecutiveFailureCount: number
) {
  return consecutiveFailureCount > 0 || consecutiveSkipCount >= 3;
}
