import type {
  AdminDeliveryFilters,
  AdminJobFilters,
  AdminOperatorOption,
  OperationEntityType
} from "@/types/operations";
import type { NotificationTemplateKey } from "@/types/delivery";

const deliveryTemplateKeys = new Set<NotificationTemplateKey>([
  "session_booked",
  "session_confirmed",
  "session_canceled",
  "session_reminder",
  "session_completed",
  "followup_added"
]);

function sanitizeHandle(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "").replace(/^[._-]+|[._-]+$/g, "");
}

export function buildMentionHandle(label: string) {
  const base = label.includes("@") ? label.split("@")[0] : label;
  const handle = sanitizeHandle(base);

  return handle || "operator";
}

export function assignOperatorHandles(
  operators: Array<{ userId: string; label: string }>
): AdminOperatorOption[] {
  const usedHandles = new Set<string>();

  return operators
    .map((operator) => {
      const baseHandle = buildMentionHandle(operator.label);
      let handle = baseHandle;
      let counter = 2;

      while (usedHandles.has(handle)) {
        handle = `${baseHandle}${counter}`;
        counter += 1;
      }

      usedHandles.add(handle);

      return {
        ...operator,
        handle
      };
    })
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function extractMentionHandles(commentBody: string) {
  const matches = commentBody.match(/(^|\s)@([a-z0-9][a-z0-9._-]{0,49})/gi) ?? [];

  return [
    ...new Set(
      matches.map((match) =>
        match
          .trim()
          .slice(1)
          .toLowerCase()
          .replace(/[.,!?;:]+$/g, "")
      )
    )
  ];
}

export function getOperationsEntityLabel(entityType: OperationEntityType) {
  return entityType === "notification_delivery" ? "delivery" : "job";
}

export const DEFAULT_DELIVERY_FILTERS: AdminDeliveryFilters = {
  status: "all",
  userId: "",
  channel: "all",
  templateKey: "all",
  relatedEntityType: "",
  needsAttention: false,
  ownership: "all",
  workflowState: "all",
  recentlyHandedOff: false,
  watchedOnly: false,
  escalatedOnly: false,
  sort: "newest"
};

export const DEFAULT_JOB_FILTERS: AdminJobFilters = {
  status: "all",
  userId: "",
  jobType: "all",
  relatedEntityType: "",
  needsAttention: false,
  ownership: "all",
  workflowState: "all",
  recentlyHandedOff: false,
  watchedOnly: false,
  escalatedOnly: false,
  sort: "newest"
};

export function normalizeDeliverySavedViewFilters(
  raw: Partial<Record<keyof AdminDeliveryFilters, unknown>> | null | undefined
): AdminDeliveryFilters {
  return {
    ...DEFAULT_DELIVERY_FILTERS,
    status:
      raw?.status === "pending" ||
      raw?.status === "failed" ||
      raw?.status === "sent" ||
      raw?.status === "ignored"
        ? raw.status
        : "all",
    userId: typeof raw?.userId === "string" ? raw.userId.trim() : "",
    channel: typeof raw?.channel === "string" && raw.channel ? raw.channel : "all",
    templateKey:
      typeof raw?.templateKey === "string" && deliveryTemplateKeys.has(raw.templateKey as NotificationTemplateKey)
        ? (raw.templateKey as NotificationTemplateKey)
        : "all",
    relatedEntityType:
      typeof raw?.relatedEntityType === "string" ? raw.relatedEntityType.trim() : "",
    needsAttention: raw?.needsAttention === true,
    ownership:
      raw?.ownership === "assigned_to_me" || raw?.ownership === "unassigned"
        ? raw.ownership
        : "all",
    workflowState:
      raw?.workflowState === "open" ||
      raw?.workflowState === "investigating" ||
      raw?.workflowState === "waiting" ||
      raw?.workflowState === "resolved"
        ? raw.workflowState
        : "all",
    recentlyHandedOff: raw?.recentlyHandedOff === true,
    watchedOnly: raw?.watchedOnly === true,
    escalatedOnly: raw?.escalatedOnly === true,
    sort:
      raw?.sort === "oldest" ||
      raw?.sort === "highest_retry_count" ||
      raw?.sort === "recently_failed"
        ? raw.sort
        : "newest"
  };
}

export function normalizeJobSavedViewFilters(
  raw: Partial<Record<keyof AdminJobFilters, unknown>> | null | undefined
): AdminJobFilters {
  return {
    ...DEFAULT_JOB_FILTERS,
    status:
      raw?.status === "pending" ||
      raw?.status === "failed" ||
      raw?.status === "processed" ||
      raw?.status === "canceled"
        ? raw.status
        : "all",
    userId: typeof raw?.userId === "string" ? raw.userId.trim() : "",
    jobType: typeof raw?.jobType === "string" && raw.jobType ? raw.jobType : "all",
    relatedEntityType:
      typeof raw?.relatedEntityType === "string" ? raw.relatedEntityType.trim() : "",
    needsAttention: raw?.needsAttention === true,
    ownership:
      raw?.ownership === "assigned_to_me" || raw?.ownership === "unassigned"
        ? raw.ownership
        : "all",
    workflowState:
      raw?.workflowState === "open" ||
      raw?.workflowState === "investigating" ||
      raw?.workflowState === "waiting" ||
      raw?.workflowState === "resolved"
        ? raw.workflowState
        : "all",
    recentlyHandedOff: raw?.recentlyHandedOff === true,
    watchedOnly: raw?.watchedOnly === true,
    escalatedOnly: raw?.escalatedOnly === true,
    sort:
      raw?.sort === "oldest" ||
      raw?.sort === "highest_retry_count" ||
      raw?.sort === "recently_failed"
        ? raw.sort
        : "newest"
  };
}
