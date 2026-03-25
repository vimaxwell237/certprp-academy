import {
  normalizeDeliverySavedViewFilters,
  normalizeJobSavedViewFilters
} from "@/features/operations/lib/collaboration";
import type {
  AdminDeliveryFilters,
  AdminDeliveryRecord,
  AdminJobFilters,
  AdminScheduledJobRecord,
  OperationEntityType
} from "@/types/operations";

type MatchContext = {
  adminUserId: string;
  isWatching: boolean;
  recentlyHandedOff?: boolean;
};

type MatchSummary = {
  currentMatchCount: number;
  escalatedMatchCount: number;
  staleMatchCount: number;
};

export function normalizeSubscriptionFilters(
  entityType: OperationEntityType,
  raw: unknown
) {
  return entityType === "notification_delivery"
    ? normalizeDeliverySavedViewFilters(raw as Partial<Record<keyof AdminDeliveryFilters, unknown>> | null | undefined)
    : normalizeJobSavedViewFilters(raw as Partial<Record<keyof AdminJobFilters, unknown>> | null | undefined);
}

export function serializeOperationFilters(
  entityType: OperationEntityType,
  filters: AdminDeliveryFilters | AdminJobFilters
) {
  return JSON.stringify(normalizeSubscriptionFilters(entityType, filters));
}

export function summarizeMatchedIncidents(
  matches: Array<{
    isEscalated: boolean;
    triageIssues: Array<{ code: string }>;
  }>
): MatchSummary {
  return {
    currentMatchCount: matches.length,
    escalatedMatchCount: matches.filter((match) => match.isEscalated).length,
    staleMatchCount: matches.filter((match) =>
      match.triageIssues.some((issue) => issue.code === "stale_pending")
    ).length
  };
}

export function matchesDeliverySubscription(
  delivery: AdminDeliveryRecord,
  filters: AdminDeliveryFilters,
  context: MatchContext
) {
  if (filters.status !== "all" && delivery.status !== filters.status) {
    return false;
  }

  if (filters.userId && delivery.userId !== filters.userId) {
    return false;
  }

  if (filters.channel !== "all" && delivery.channel !== filters.channel) {
    return false;
  }

  if (filters.templateKey !== "all" && delivery.templateKey !== filters.templateKey) {
    return false;
  }

  if (filters.relatedEntityType && delivery.relatedEntityType !== filters.relatedEntityType) {
    return false;
  }

  if (filters.needsAttention && !delivery.needsAttention) {
    return false;
  }

  if (filters.workflowState !== "all" && delivery.workflowState !== filters.workflowState) {
    return false;
  }

  if (filters.ownership === "assigned_to_me" && delivery.assignedAdminUserId !== context.adminUserId) {
    return false;
  }

  if (filters.ownership === "unassigned" && delivery.assignedAdminUserId) {
    return false;
  }

  if (filters.recentlyHandedOff && !context.recentlyHandedOff) {
    return false;
  }

  if (filters.watchedOnly && !context.isWatching) {
    return false;
  }

  if (filters.escalatedOnly && !delivery.isEscalated) {
    return false;
  }

  return true;
}

export function matchesJobSubscription(
  job: AdminScheduledJobRecord,
  filters: AdminJobFilters,
  context: MatchContext
) {
  if (filters.status !== "all" && job.status !== filters.status) {
    return false;
  }

  if (filters.userId && job.userId !== filters.userId) {
    return false;
  }

  if (filters.jobType !== "all" && job.jobType !== filters.jobType) {
    return false;
  }

  if (filters.relatedEntityType && job.relatedEntityType !== filters.relatedEntityType) {
    return false;
  }

  if (filters.needsAttention && !job.needsAttention) {
    return false;
  }

  if (filters.workflowState !== "all" && job.workflowState !== filters.workflowState) {
    return false;
  }

  if (filters.ownership === "assigned_to_me" && job.assignedAdminUserId !== context.adminUserId) {
    return false;
  }

  if (filters.ownership === "unassigned" && job.assignedAdminUserId) {
    return false;
  }

  if (filters.recentlyHandedOff && !context.recentlyHandedOff) {
    return false;
  }

  if (filters.watchedOnly && !context.isWatching) {
    return false;
  }

  if (filters.escalatedOnly && !job.isEscalated) {
    return false;
  }

  return true;
}
