import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import {
  assignOperatorHandles,
  DEFAULT_DELIVERY_FILTERS,
  DEFAULT_JOB_FILTERS,
  extractMentionHandles,
  getOperationsEntityLabel,
  normalizeDeliverySavedViewFilters,
  normalizeJobSavedViewFilters
} from "@/features/operations/lib/collaboration";
import {
  buildAutomationHealthUpdate,
  buildMaxMatchCapReason,
  buildDigestFingerprint,
  buildDigestSummary,
  buildOperationMatchExplanation,
  getAutomationControlState,
  getAutomationEligibility,
  getCooldownWindow,
  isAutomationUnhealthy,
  limitMatchesForRun
} from "@/features/operations/lib/automation";
import {
  buildAutomationTrendWindows,
  buildManualRerunGuidance,
  classifyAutomationHealthStatus,
  summarizeAutomationReasons
} from "@/features/operations/lib/health";
import {
  buildAutomationRerunReadiness,
  buildPostRerunVerificationGuidance,
  buildRemediationPlaybooks
} from "@/features/operations/lib/playbooks";
import {
  matchesDeliverySubscription,
  matchesJobSubscription,
  normalizeSubscriptionFilters,
  summarizeMatchedIncidents
} from "@/features/operations/lib/subscriptions";
import {
  buildDeliveryTriageIssues,
  buildJobTriageIssues,
  hasNeedsAttention,
  STALE_QUEUE_MINUTES
} from "@/features/operations/lib/triage";
import {
  OperationsError,
  canTransitionAutomationAcknowledgementStatus,
  canTransitionAutomationVerificationStatus,
  validateBulkViewExecution,
  canTransitionWorkflowState,
  canCancelJob,
  canIgnoreDelivery,
  canReplayJob,
  canRetryDelivery
} from "@/features/operations/lib/validation";
import {
  DEFAULT_WATCH_PREFERENCES,
  normalizeWatchPreferences,
  shouldNotifyWatcher
} from "@/features/operations/lib/watch-preferences";
import type {
  AdminOperatorOption,
  BulkActionSummary,
  AdminDeliveryDetail,
  AdminDeliveryFilters,
  AdminDeliveryRecord,
  AdminFailureCategory,
  AdminJobFilters,
  OperationCommentRecord,
  AdminOperationsOverview,
  AdminOperationsSnapshot,
  OperationAutomationAcknowledgementRecord,
  OperationAutomationAcknowledgementStatus,
  OperationAutomationEntityType,
  OperationAutomationReminderLastAction,
  OperationAutomationReminderState,
  OperationAuditEntityType,
  OperationAutomationTrendSummary,
  OperationAutomationRunStatus,
  OperationAutomationVerificationStatus,
  OperationAutomationVerificationState,
  OperationDigestDeliveredVia,
  OperationEscalationRuleDetail,
  OperationEscalationRuleRecord,
  OperationEscalationRuleRunRecord,
  OperationQueueSubscriptionDetail,
  OperationQueueSubscriptionRecord,
  OperationRerunReadiness,
  OperationSavedViewRecord,
  OperationRuleRunMode,
  OperationRuleRunTrigger,
  OperationSubscriptionDigestRunRecord,
  AdminScheduledJobDetail,
  AdminScheduledJobRecord,
  OperationAssignmentHistoryRecord,
  OperationAuditEventRecord,
  OperationAuditEventType,
  OperationEntityType,
  OperationNoteRecord,
  OperationWatcherRecord,
  OperationWorkflowState
} from "@/types/operations";
import type { NotificationTemplateKey } from "@/types/delivery";

type DeliveryRow = {
  id: string;
  notification_id: string | null;
  user_id: string;
  channel: string;
  template_key: NotificationTemplateKey;
  status: "pending" | "sent" | "failed" | "ignored";
  retry_count: number;
  max_retries: number;
  error_message: string | null;
  sent_at: string | null;
  last_attempted_at: string | null;
  created_at: string;
  next_attempt_at: string | null;
  assigned_admin_user_id: string | null;
  assigned_at: string | null;
  handoff_note: string | null;
  workflow_state: OperationWorkflowState;
  workflow_state_updated_at: string | null;
  is_escalated: boolean;
  escalated_at: string | null;
  escalated_by_admin_user_id: string | null;
  escalation_reason: string | null;
  external_message_id?: string | null;
  processing_started_at?: string | null;
  notification:
    | Array<{
        id: string;
        title: string;
        message: string;
        link_url: string | null;
        related_entity_type: string | null;
        related_entity_id: string | null;
      }>
    | null;
};

type JobRow = {
  id: string;
  user_id: string;
  job_type: string;
  related_entity_type: string;
  related_entity_id: string;
  status: "pending" | "processed" | "failed" | "canceled";
  retry_count: number;
  max_retries: number;
  scheduled_for: string;
  processed_at: string | null;
  error_message: string | null;
  last_attempted_at: string | null;
  created_at: string;
  assigned_admin_user_id: string | null;
  assigned_at: string | null;
  handoff_note: string | null;
  workflow_state: OperationWorkflowState;
  workflow_state_updated_at: string | null;
  is_escalated: boolean;
  escalated_at: string | null;
  escalated_by_admin_user_id: string | null;
  escalation_reason: string | null;
  dedupe_key?: string | null;
  payload: Record<string, unknown> | null;
  processing_started_at?: string | null;
};

type SessionRow = {
  id: string;
  status: string;
  scheduled_ends_at: string;
};

type OperationNoteRow = {
  id: string;
  entity_type: OperationEntityType;
  entity_id: string;
  admin_user_id: string;
  note_body: string;
  created_at: string;
  updated_at: string;
};

type OperationAuditEventRow = {
  id: string;
  entity_type: OperationAuditEntityType;
  entity_id: string;
  admin_user_id: string | null;
  event_type: OperationAuditEventType;
  event_summary: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type OperationAutomationAcknowledgementRow = {
  id: string;
  entity_type: OperationAutomationEntityType;
  entity_id: string;
  admin_user_id: string;
  status: OperationAutomationAcknowledgementStatus;
  note: string | null;
  assigned_admin_user_id: string | null;
  assigned_at: string | null;
  remind_at: string | null;
  reminder_state: OperationAutomationReminderState;
  last_reminded_at: string | null;
  reminder_dismissed_at: string | null;
  reminder_snoozed_until: string | null;
  reminder_snooze_reason: string | null;
  reminder_last_action: OperationAutomationReminderLastAction;
  rerun_outcome: OperationAutomationRunStatus | null;
  last_rerun_at: string | null;
  verification_state: OperationAutomationVerificationState;
  verification_summary: string | null;
  verification_status: OperationAutomationVerificationStatus;
  verification_completed_at: string | null;
  verification_completed_by_admin_user_id: string | null;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
};

type OperationCommentRow = {
  id: string;
  entity_type: OperationEntityType;
  entity_id: string;
  admin_user_id: string;
  comment_body: string;
  created_at: string;
  updated_at: string;
};

type OperationSavedViewRow = {
  id: string;
  admin_user_id: string;
  entity_type: OperationEntityType;
  name: string;
  filters_json: Record<string, unknown> | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

type OperationQueueSubscriptionRow = {
  id: string;
  admin_user_id: string;
  entity_type: OperationEntityType;
  name: string;
  filters_json: Record<string, unknown> | null;
  is_active: boolean;
  is_muted: boolean;
  snoozed_until: string | null;
  muted_or_snoozed_reason: string | null;
  digest_cooldown_minutes: number | null;
  last_digest_at: string | null;
  last_digest_hash: string | null;
  consecutive_skip_count: number | null;
  consecutive_failure_count: number | null;
  last_success_at: string | null;
  last_failure_at: string | null;
  last_skip_reason: string | null;
  created_at: string;
  updated_at: string;
};

type OperationEscalationRuleRow = {
  id: string;
  created_by_admin_user_id: string;
  entity_type: OperationEntityType;
  name: string;
  filters_json: Record<string, unknown> | null;
  escalation_reason: string;
  is_active: boolean;
  is_muted: boolean;
  snoozed_until: string | null;
  muted_or_snoozed_reason: string | null;
  run_mode: OperationRuleRunMode;
  last_run_at: string | null;
  next_run_at: string | null;
  cooldown_minutes: number | null;
  max_matches_per_run: number | null;
  consecutive_skip_count: number | null;
  consecutive_failure_count: number | null;
  last_success_at: string | null;
  last_failure_at: string | null;
  last_skip_reason: string | null;
  created_at: string;
  updated_at: string;
};

type OperationEscalationRuleRunRow = {
  id: string;
  operation_escalation_rule_id: string;
  triggered_by: OperationRuleRunTrigger;
  triggered_by_admin_user_id: string | null;
  matched_count: number;
  escalated_count: number;
  skipped_count: number;
  run_status: OperationAutomationRunStatus;
  skip_reason: string | null;
  failure_reason: string | null;
  duration_ms: number | null;
  run_summary: string;
  created_at: string;
};

type OperationSubscriptionDigestRunRow = {
  id: string;
  operation_queue_subscription_id: string;
  triggered_by: OperationRuleRunTrigger;
  triggered_by_admin_user_id: string | null;
  match_count: number;
  run_status: OperationAutomationRunStatus;
  skip_reason: string | null;
  failure_reason: string | null;
  duration_ms: number | null;
  digest_summary: string;
  delivered_via: OperationDigestDeliveredVia;
  created_at: string;
};

type OperationWatcherRow = {
  id: string;
  entity_type: OperationEntityType;
  entity_id: string;
  admin_user_id: string;
  created_at: string;
  is_muted: boolean;
  notify_on_comment: boolean;
  notify_on_owner_change: boolean;
  notify_on_workflow_change: boolean;
  notify_on_resolve: boolean;
  updated_at: string;
};

type OperationAssignmentHistoryRow = {
  id: string;
  entity_type: OperationEntityType;
  entity_id: string;
  previous_admin_user_id: string | null;
  new_admin_user_id: string | null;
  changed_by_admin_user_id: string;
  handoff_note: string | null;
  created_at: string;
};

type WatcherMeta = {
  count: number;
  watchedByCurrentAdmin: boolean;
};

const DELIVERY_SELECT =
  "id,notification_id,user_id,channel,template_key,status,retry_count,max_retries,error_message,sent_at,last_attempted_at,created_at,next_attempt_at,assigned_admin_user_id,assigned_at,handoff_note,workflow_state,workflow_state_updated_at,is_escalated,escalated_at,escalated_by_admin_user_id,escalation_reason,external_message_id,processing_started_at,notification:notifications(id,title,message,link_url,related_entity_type,related_entity_id)";

const JOB_SELECT =
  "id,user_id,job_type,related_entity_type,related_entity_id,status,retry_count,max_retries,scheduled_for,processed_at,error_message,last_attempted_at,created_at,assigned_admin_user_id,assigned_at,handoff_note,workflow_state,workflow_state_updated_at,is_escalated,escalated_at,escalated_by_admin_user_id,escalation_reason,dedupe_key,payload,processing_started_at";

function getOperationsClient() {
  return createServiceRoleSupabaseClient();
}

function isProcessingLocked(processingStartedAt: string | null | undefined) {
  if (!processingStartedAt) {
    return false;
  }

  return new Date(processingStartedAt).getTime() > Date.now() - 10 * 60 * 1000;
}

function previewJson(payload: Record<string, unknown> | null) {
  if (!payload || Object.keys(payload).length === 0) {
    return "{}";
  }

  const json = JSON.stringify(payload);

  return json.length > 160 ? `${json.slice(0, 157)}...` : json;
}

function getEmptySummary(): AdminOperationsSnapshot["summary"] {
  return {
    deliveries: {
      pending: 0,
      failed: 0,
      sent: 0,
      ignored: 0,
      needingAttention: 0,
      failedNeedingAttention: 0,
      stalePending: 0,
      assignedToMe: 0,
      unassignedNeedingAttention: 0,
      investigating: 0,
      waiting: 0,
      resolved: 0
    },
    jobs: {
      pending: 0,
      failed: 0,
      processed: 0,
      canceled: 0,
      needingAttention: 0,
      failedNeedingAttention: 0,
      stalePending: 0,
      assignedToMe: 0,
      unassignedNeedingAttention: 0,
      investigating: 0,
      waiting: 0,
      resolved: 0
    },
    myAssignedIncidents: 0,
    investigating: 0,
    waiting: 0,
    resolvedToday: 0,
    unassignedNeedingAttention: 0,
    recentlyHandedOff: 0,
    recentComments: 0,
    watchedIncidents: 0,
    mutedWatchedIncidents: 0,
    watchedUnresolvedIncidents: 0,
    activeSubscriptions: 0,
    escalatedIncidents: 0,
    watchedByTeamIncidents: 0,
    unassignedEscalatedIncidents: 0,
    activeEscalationRules: 0,
    activeAutomatedRules: 0,
    recentRuleRuns: 0,
    recentDigestRuns: 0,
    rulesInCooldown: 0,
    subscriptionsWithActiveMatches: 0,
    mutedRules: 0,
    snoozedSubscriptions: 0,
    unhealthyRules: 0,
    unhealthySubscriptions: 0,
    healthyAutomation: 0,
    warningAutomation: 0,
    unhealthyAutomation: 0,
    recentSkippedRuns: 0,
    recentFailedRuns: 0,
    unacknowledgedUnhealthyAutomation: 0,
    acknowledgedUnresolvedAutomation: 0,
    fixedPendingRerunAutomation: 0,
    resolvedRecentlyAutomation: 0,
    assignedUnhealthyAutomation: 0,
    unassignedUnhealthyAutomation: 0,
    overdueAcknowledgementReminders: 0,
    fixedPendingRerunAwaitingVerification: 0,
    overdueAssignedAutomation: 0,
    verificationPendingAutomation: 0,
    verificationFailedAutomation: 0,
    dismissedReminderAutomation: 0,
    snoozedReminderAutomation: 0
  };
}

async function countTableRows(
  table:
    | "notification_deliveries"
    | "scheduled_jobs"
    | "operation_audit_events"
    | "operation_assignment_history"
    | "operation_comments"
    | "operation_watchers"
    | "operation_queue_subscriptions"
    | "operation_escalation_rules"
    | "operation_escalation_rule_runs"
    | "operation_subscription_digest_runs",
  build?: (query: any) => any
) {
  const client = getOperationsClient();
  let query = client.from(table).select("id", { count: "exact", head: true });

  if (build) {
    query = build(query);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Failed to count ${table}: ${error.message}`);
  }

  return count ?? 0;
}

async function fetchSessionMap(sessionIds: string[]) {
  if (sessionIds.length === 0) {
    return new Map<string, SessionRow>();
  }

  const client = getOperationsClient();
  const { data, error } = await client
    .from("tutor_sessions")
    .select("id,status,scheduled_ends_at")
    .in("id", [...new Set(sessionIds)]);

  if (error) {
    throw new Error(`Failed to resolve related tutor sessions: ${error.message}`);
  }

  return new Map(
    (((data as SessionRow[] | null) ?? []).map((session) => [session.id, session]))
  );
}

async function fetchAdminUserLabelMap(userIds: Array<string | null | undefined>) {
  const client = getOperationsClient();
  const labelMap = new Map<string, string>();

  for (const userId of [...new Set(userIds.filter(Boolean) as string[])]) {
    try {
      const { data, error } = await client.auth.admin.getUserById(userId);

      if (error) {
        labelMap.set(userId, userId);
        continue;
      }

      labelMap.set(userId, data.user.email ?? userId);
    } catch {
      labelMap.set(userId, userId);
    }
  }

  return labelMap;
}

async function fetchAdminUserHandleMap(userIds: Array<string | null | undefined>) {
  const operators = await fetchAdminOperators();
  const requested = new Set(userIds.filter(Boolean) as string[]);
  const handleMap = new Map<string, string>();

  for (const operator of operators) {
    if (requested.has(operator.userId)) {
      handleMap.set(operator.userId, operator.handle);
    }
  }

  return handleMap;
}

async function assertAdminTarget(userId: string) {
  const client = getOperationsClient();
  const { data, error } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to validate admin assignee: ${error.message}`);
  }

  if (!data || data.role !== "admin") {
    throw new OperationsError("Assignment target must be an admin user.");
  }
}

async function assertAdminActor(userId: string) {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    throw new OperationsError("Admin access is required for this operation.");
  }

  const client = getOperationsClient();
  const { data, error } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", normalizedUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to validate admin operator: ${error.message}`);
  }

  if (!data || data.role !== "admin") {
    throw new OperationsError("Admin access is required for this operation.");
  }
}

export async function fetchAdminOperators(adminUserId?: string): Promise<AdminOperatorOption[]> {
  if (adminUserId) {
    await assertAdminActor(adminUserId);
  }

  const client = getOperationsClient();
  const { data, error } = await client
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");

  if (error) {
    throw new Error(`Failed to load admin operators: ${error.message}`);
  }

  const userIds = (((data as Array<{ user_id: string }> | null) ?? []).map((row) => row.user_id));
  const labelMap = await fetchAdminUserLabelMap(userIds);

  return assignOperatorHandles(
    userIds.map((userId) => ({
      userId,
      label: labelMap.get(userId) ?? userId
    }))
  );
}

function applyDeliveryOrdering(query: any, sort: AdminDeliveryFilters["sort"]) {
  switch (sort) {
    case "oldest":
      return query.order("created_at", { ascending: true });
    case "highest_retry_count":
      return query.order("retry_count", { ascending: false }).order("created_at", {
        ascending: false
      });
    case "recently_failed":
      return query.order("last_attempted_at", { ascending: false }).order("created_at", {
        ascending: false
      });
    case "newest":
    default:
      return query.order("created_at", { ascending: false });
  }
}

function applyJobOrdering(query: any, sort: AdminJobFilters["sort"]) {
  switch (sort) {
    case "oldest":
      return query.order("created_at", { ascending: true });
    case "highest_retry_count":
      return query.order("retry_count", { ascending: false }).order("created_at", {
        ascending: false
      });
    case "recently_failed":
      return query.order("last_attempted_at", { ascending: false }).order("created_at", {
        ascending: false
      });
    case "newest":
    default:
      return query.order("created_at", { ascending: false });
  }
}

function mapOperationNote(
  row: OperationNoteRow,
  labelMap: Map<string, string>
): OperationNoteRecord {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    adminUserId: row.admin_user_id,
    adminUserLabel: labelMap.get(row.admin_user_id) ?? row.admin_user_id,
    noteBody: row.note_body,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapOperationComment(
  row: OperationCommentRow,
  labelMap: Map<string, string>,
  handleMap: Map<string, string>
): OperationCommentRecord {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    adminUserId: row.admin_user_id,
    adminUserLabel: labelMap.get(row.admin_user_id) ?? row.admin_user_id,
    adminUserHandle: handleMap.get(row.admin_user_id) ?? "operator",
    commentBody: row.comment_body,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapOperationAuditEvent(
  row: OperationAuditEventRow,
  labelMap: Map<string, string>
): OperationAuditEventRecord {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    adminUserId: row.admin_user_id,
    adminUserLabel: row.admin_user_id ? (labelMap.get(row.admin_user_id) ?? row.admin_user_id) : null,
    eventType: row.event_type,
    eventSummary: row.event_summary,
    metadataPreview: previewJson(row.metadata ?? {}),
    createdAt: row.created_at
  };
}

function mapAutomationAcknowledgementRow(
  row: OperationAutomationAcknowledgementRow,
  labelMap: Map<string, string>
): OperationAutomationAcknowledgementRecord {
  const reminderSnoozedUntil = row.reminder_snoozed_until;
  const isReminderSnoozed =
    Boolean(reminderSnoozedUntil) &&
    new Date(reminderSnoozedUntil as string).getTime() > Date.now();
  const isOverdue =
    Boolean(row.assigned_admin_user_id) &&
    row.status !== "resolved" &&
    Boolean(row.remind_at) &&
    !isReminderSnoozed &&
    row.reminder_state !== "dismissed" &&
    new Date(row.remind_at as string).getTime() <= Date.now();

  let nextFollowUpAction: string | null = null;

  if (row.status !== "resolved") {
    if (row.verification_status === "pending") {
      nextFollowUpAction = "Review the rerun result and complete or fail verification after checking the queue.";
    } else if (isOverdue) {
      nextFollowUpAction = "This follow-up is overdue. Review the issue now, or snooze or reschedule the reminder.";
    } else if (isReminderSnoozed) {
      nextFollowUpAction = `Reminder is snoozed until ${new Date(reminderSnoozedUntil as string).toLocaleString()}.`;
    } else if (row.reminder_state === "dismissed") {
      nextFollowUpAction = "Reminder is dismissed. Reschedule it if this automation still needs follow-up.";
    } else if (row.remind_at) {
      nextFollowUpAction = `Next reminder is due ${new Date(row.remind_at).toLocaleString()}.`;
    } else if (row.status === "fixed_pending_rerun") {
      nextFollowUpAction = "Run verification after the next rerun and update the acknowledgement once the result is confirmed.";
    } else {
      nextFollowUpAction = "Assign an owner and schedule the next follow-up step for this unhealthy automation.";
    }
  }

  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    adminUserId: row.admin_user_id,
    adminUserLabel: labelMap.get(row.admin_user_id) ?? row.admin_user_id,
    status: row.status,
    note: row.note,
    assignedAdminUserId: row.assigned_admin_user_id,
    assignedAdminUserLabel: row.assigned_admin_user_id
      ? (labelMap.get(row.assigned_admin_user_id) ?? row.assigned_admin_user_id)
      : null,
    assignedAt: row.assigned_at,
    remindAt: row.remind_at,
    reminderState: row.reminder_state,
    lastRemindedAt: row.last_reminded_at,
    reminderDismissedAt: row.reminder_dismissed_at,
    reminderSnoozedUntil: row.reminder_snoozed_until,
    reminderSnoozeReason: row.reminder_snooze_reason,
    reminderLastAction: row.reminder_last_action,
    rerunOutcome: row.rerun_outcome,
    lastRerunAt: row.last_rerun_at,
    verificationState: row.verification_state,
    verificationSummary: row.verification_summary,
    verificationStatus: row.verification_status,
    verificationCompletedAt: row.verification_completed_at,
    verificationCompletedByAdminUserId: row.verification_completed_by_admin_user_id,
    verificationCompletedByAdminUserLabel: row.verification_completed_by_admin_user_id
      ? (labelMap.get(row.verification_completed_by_admin_user_id) ??
        row.verification_completed_by_admin_user_id)
      : null,
    verificationNotes: row.verification_notes,
    isOverdue,
    nextFollowUpAction,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapAssignmentHistoryRow(
  row: OperationAssignmentHistoryRow,
  labelMap: Map<string, string>
): OperationAssignmentHistoryRecord {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    previousAdminUserId: row.previous_admin_user_id,
    previousAdminUserLabel: row.previous_admin_user_id
      ? (labelMap.get(row.previous_admin_user_id) ?? row.previous_admin_user_id)
      : null,
    newAdminUserId: row.new_admin_user_id,
    newAdminUserLabel: row.new_admin_user_id
      ? (labelMap.get(row.new_admin_user_id) ?? row.new_admin_user_id)
      : null,
    changedByAdminUserId: row.changed_by_admin_user_id,
    changedByAdminUserLabel:
      labelMap.get(row.changed_by_admin_user_id) ?? row.changed_by_admin_user_id,
    handoffNote: row.handoff_note,
    createdAt: row.created_at
  };
}

function mapSavedViewRow(row: OperationSavedViewRow): OperationSavedViewRecord {
  return {
    id: row.id,
    adminUserId: row.admin_user_id,
    entityType: row.entity_type,
    name: row.name,
    filters:
      row.entity_type === "notification_delivery"
        ? normalizeDeliverySavedViewFilters(row.filters_json)
        : normalizeJobSavedViewFilters(row.filters_json),
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapQueueSubscriptionRow(
  row: OperationQueueSubscriptionRow,
  stats?: {
    currentMatchCount?: number;
    escalatedMatchCount?: number;
    staleMatchCount?: number;
  }
): OperationQueueSubscriptionRecord {
  const automationState = getAutomationControlState(row.is_muted, row.snoozed_until);
  const healthStatus = classifyAutomationHealthStatus({
    automationState,
    consecutiveSkipCount: row.consecutive_skip_count ?? 0,
    consecutiveFailureCount: row.consecutive_failure_count ?? 0,
    lastSuccessAt: row.last_success_at,
    lastFailureAt: row.last_failure_at,
    lastSkipReason: row.last_skip_reason
  });

  return {
    id: row.id,
    adminUserId: row.admin_user_id,
    entityType: row.entity_type,
    name: row.name,
    filters: normalizeSubscriptionFilters(row.entity_type, row.filters_json),
    isActive: row.is_active,
    automationState,
    healthStatus,
    isMuted: row.is_muted,
    snoozedUntil: row.snoozed_until,
    mutedOrSnoozedReason: row.muted_or_snoozed_reason,
    currentMatchCount: stats?.currentMatchCount ?? 0,
    escalatedMatchCount: stats?.escalatedMatchCount ?? 0,
    staleMatchCount: stats?.staleMatchCount ?? 0,
    matchExplanation: buildOperationMatchExplanation(
      row.entity_type,
      normalizeSubscriptionFilters(row.entity_type, row.filters_json)
    ),
    digestCooldownMinutes: row.digest_cooldown_minutes ?? 180,
    lastDigestAt: row.last_digest_at,
    lastDigestHash: row.last_digest_hash,
    consecutiveSkipCount: row.consecutive_skip_count ?? 0,
    consecutiveFailureCount: row.consecutive_failure_count ?? 0,
    lastSuccessAt: row.last_success_at,
    lastFailureAt: row.last_failure_at,
    lastSkipReason: row.last_skip_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapEscalationRuleRow(
  row: OperationEscalationRuleRow,
  currentMatchCount = 0
): OperationEscalationRuleRecord {
  const automationState = getAutomationControlState(row.is_muted, row.snoozed_until);
  const healthStatus = classifyAutomationHealthStatus({
    automationState,
    consecutiveSkipCount: row.consecutive_skip_count ?? 0,
    consecutiveFailureCount: row.consecutive_failure_count ?? 0,
    lastSuccessAt: row.last_success_at,
    lastFailureAt: row.last_failure_at,
    lastSkipReason: row.last_skip_reason
  });

  return {
    id: row.id,
    createdByAdminUserId: row.created_by_admin_user_id,
    entityType: row.entity_type,
    name: row.name,
    filters: normalizeSubscriptionFilters(row.entity_type, row.filters_json),
    escalationReason: row.escalation_reason,
    isActive: row.is_active,
    automationState,
    healthStatus,
    isMuted: row.is_muted,
    snoozedUntil: row.snoozed_until,
    mutedOrSnoozedReason: row.muted_or_snoozed_reason,
    runMode: row.run_mode ?? "manual",
    cooldownMinutes: row.cooldown_minutes ?? 30,
    maxMatchesPerRun: row.max_matches_per_run ?? 25,
    lastRunAt: row.last_run_at,
    nextRunAt: row.next_run_at,
    consecutiveSkipCount: row.consecutive_skip_count ?? 0,
    consecutiveFailureCount: row.consecutive_failure_count ?? 0,
    lastSuccessAt: row.last_success_at,
    lastFailureAt: row.last_failure_at,
    lastSkipReason: row.last_skip_reason,
    currentMatchCount,
    matchExplanation: buildOperationMatchExplanation(
      row.entity_type,
      normalizeSubscriptionFilters(row.entity_type, row.filters_json)
    ),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapEscalationRuleRunRow(
  row: OperationEscalationRuleRunRow,
  labelMap: Map<string, string>
): OperationEscalationRuleRunRecord {
  return {
    id: row.id,
    operationEscalationRuleId: row.operation_escalation_rule_id,
    triggeredBy: row.triggered_by,
    triggeredByAdminUserId: row.triggered_by_admin_user_id,
    triggeredByAdminUserLabel: row.triggered_by_admin_user_id
      ? (labelMap.get(row.triggered_by_admin_user_id) ?? row.triggered_by_admin_user_id)
      : null,
    matchedCount: row.matched_count,
    escalatedCount: row.escalated_count,
    skippedCount: row.skipped_count,
    runStatus: row.run_status,
    skipReason: row.skip_reason,
    failureReason: row.failure_reason,
    durationMs: row.duration_ms,
    runSummary: row.run_summary,
    createdAt: row.created_at
  };
}

function mapSubscriptionDigestRunRow(
  row: OperationSubscriptionDigestRunRow,
  labelMap: Map<string, string>
): OperationSubscriptionDigestRunRecord {
  return {
    id: row.id,
    operationQueueSubscriptionId: row.operation_queue_subscription_id,
    triggeredBy: row.triggered_by,
    triggeredByAdminUserId: row.triggered_by_admin_user_id,
    triggeredByAdminUserLabel: row.triggered_by_admin_user_id
      ? (labelMap.get(row.triggered_by_admin_user_id) ?? row.triggered_by_admin_user_id)
      : null,
    matchCount: row.match_count,
    runStatus: row.run_status,
    skipReason: row.skip_reason,
    failureReason: row.failure_reason,
    durationMs: row.duration_ms,
    digestSummary: row.digest_summary,
    deliveredVia: row.delivered_via,
    createdAt: row.created_at
  };
}

function getIncidentLink(entityType: OperationEntityType, entityId: string) {
  return entityType === "notification_delivery"
    ? `/admin/operations/deliveries/${entityId}`
    : `/admin/operations/jobs/${entityId}`;
}

function getQueueLink(
  entityType: OperationEntityType,
  filters: AdminDeliveryFilters | AdminJobFilters
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (typeof value === "boolean") {
      if (value) {
        params.set(key, "true");
      }
    } else if (value && value !== "all" && value !== "newest") {
      params.set(key, String(value));
    }
  }

  const basePath =
    entityType === "notification_delivery"
      ? "/admin/operations/deliveries"
      : "/admin/operations/jobs";
  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
}

function mapWatcherRow(
  row: OperationWatcherRow,
  labelMap: Map<string, string>,
  handleMap: Map<string, string>
): OperationWatcherRecord {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    adminUserId: row.admin_user_id,
    adminUserLabel: labelMap.get(row.admin_user_id) ?? row.admin_user_id,
    adminUserHandle: handleMap.get(row.admin_user_id) ?? "operator",
    isMuted: row.is_muted,
    notifyOnComment: row.notify_on_comment,
    notifyOnOwnerChange: row.notify_on_owner_change,
    notifyOnWorkflowChange: row.notify_on_workflow_change,
    notifyOnResolve: row.notify_on_resolve,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function enrichDeliveries(
  rows: DeliveryRow[],
  currentAdminUserId?: string
): Promise<AdminDeliveryRecord[]> {
  const sessionMap = await fetchSessionMap(
    rows
      .map((row) => row.notification?.[0]?.related_entity_id ?? null)
      .filter((value): value is string => Boolean(value))
  );
  const ownerLabelMap = await fetchAdminUserLabelMap(
    rows.flatMap((row) => [row.assigned_admin_user_id, row.escalated_by_admin_user_id])
  );
  const watcherMeta = await fetchWatcherMeta(
    "notification_delivery",
    rows.map((row) => row.id),
    currentAdminUserId
  );

  return rows.map((row) => {
    const notification = row.notification?.[0] ?? null;
    const relatedSession =
      notification?.related_entity_type === "tutor_session" && notification.related_entity_id
        ? sessionMap.get(notification.related_entity_id) ?? null
        : null;
    const invalidRelatedEntity =
      notification?.related_entity_type === "tutor_session"
        ? !relatedSession ||
          relatedSession.status !== "confirmed" ||
          new Date(relatedSession.scheduled_ends_at).getTime() <= Date.now()
        : false;
    const triageIssues = buildDeliveryTriageIssues({
      status: row.status,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      errorMessage: row.error_message,
      createdAt: row.created_at,
      nextAttemptAt: row.next_attempt_at,
      missingTargetInfo: !notification,
      invalidRelatedEntity
    });
    const meta = watcherMeta.get(row.id) ?? {
      count: 0,
      watchedByCurrentAdmin: false
    };

    return {
      id: row.id,
      notificationId: row.notification_id,
      userId: row.user_id,
      channel: row.channel,
      templateKey: row.template_key,
      status: row.status,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      errorMessage: row.error_message,
      sentAt: row.sent_at,
      lastAttemptedAt: row.last_attempted_at,
      createdAt: row.created_at,
      nextAttemptAt: row.next_attempt_at,
      relatedEntityType: notification?.related_entity_type ?? null,
      relatedEntityId: notification?.related_entity_id ?? null,
      assignedAdminUserId: row.assigned_admin_user_id,
      assignedAdminUserLabel: row.assigned_admin_user_id
        ? (ownerLabelMap.get(row.assigned_admin_user_id) ?? row.assigned_admin_user_id)
        : null,
      assignedAt: row.assigned_at,
      handoffNote: row.handoff_note,
      workflowState: row.workflow_state,
      workflowStateUpdatedAt: row.workflow_state_updated_at,
      isEscalated: row.is_escalated,
      escalatedAt: row.escalated_at,
      escalatedByAdminUserId: row.escalated_by_admin_user_id ?? null,
      escalatedByAdminUserLabel: row.escalated_by_admin_user_id
        ? (ownerLabelMap.get(row.escalated_by_admin_user_id) ?? row.escalated_by_admin_user_id)
        : null,
      escalationReason: row.escalation_reason,
      watcherCount: meta.count,
      watchedByTeam: meta.count > 1,
      teamAttention: meta.count > 1 || (meta.count > 0 && !row.assigned_admin_user_id) || row.is_escalated,
      needsAttention: hasNeedsAttention(triageIssues),
      triageIssues
    };
  });
}

async function enrichJobs(
  rows: JobRow[],
  currentAdminUserId?: string
): Promise<AdminScheduledJobRecord[]> {
  const sessionMap = await fetchSessionMap(
    rows
      .filter((row) => row.related_entity_type === "tutor_session")
      .map((row) => row.related_entity_id)
  );
  const ownerLabelMap = await fetchAdminUserLabelMap(
    rows.flatMap((row) => [row.assigned_admin_user_id, row.escalated_by_admin_user_id])
  );
  const watcherMeta = await fetchWatcherMeta(
    "scheduled_job",
    rows.map((row) => row.id),
    currentAdminUserId
  );

  return rows.map((row) => {
    const relatedSession =
      row.related_entity_type === "tutor_session"
        ? sessionMap.get(row.related_entity_id) ?? null
        : null;
    const invalidRelatedEntity =
      row.related_entity_type === "tutor_session"
        ? !relatedSession ||
          relatedSession.status !== "confirmed" ||
          new Date(relatedSession.scheduled_ends_at).getTime() <= Date.now()
        : false;
    const triageIssues = buildJobTriageIssues({
      status: row.status,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      errorMessage: row.error_message,
      scheduledFor: row.scheduled_for,
      missingTargetInfo: !row.related_entity_id,
      invalidRelatedEntity
    });
    const meta = watcherMeta.get(row.id) ?? {
      count: 0,
      watchedByCurrentAdmin: false
    };

    return {
      id: row.id,
      userId: row.user_id,
      jobType: row.job_type,
      relatedEntityType: row.related_entity_type,
      relatedEntityId: row.related_entity_id,
      status: row.status,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      scheduledFor: row.scheduled_for,
      processedAt: row.processed_at,
      errorMessage: row.error_message,
      lastAttemptedAt: row.last_attempted_at,
      createdAt: row.created_at,
      payloadPreview: previewJson(row.payload),
      assignedAdminUserId: row.assigned_admin_user_id,
      assignedAdminUserLabel: row.assigned_admin_user_id
        ? (ownerLabelMap.get(row.assigned_admin_user_id) ?? row.assigned_admin_user_id)
        : null,
      assignedAt: row.assigned_at,
      handoffNote: row.handoff_note,
      workflowState: row.workflow_state,
      workflowStateUpdatedAt: row.workflow_state_updated_at,
      isEscalated: row.is_escalated,
      escalatedAt: row.escalated_at,
      escalatedByAdminUserId: row.escalated_by_admin_user_id ?? null,
      escalatedByAdminUserLabel: row.escalated_by_admin_user_id
        ? (ownerLabelMap.get(row.escalated_by_admin_user_id) ?? row.escalated_by_admin_user_id)
        : null,
      escalationReason: row.escalation_reason,
      watcherCount: meta.count,
      watchedByTeam: meta.count > 1,
      teamAttention: meta.count > 1 || (meta.count > 0 && !row.assigned_admin_user_id) || row.is_escalated,
      needsAttention: hasNeedsAttention(triageIssues),
      triageIssues
    };
  });
}

async function listOperationNotes(entityType: OperationEntityType, entityId: string) {
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_notes")
    .select("id,entity_type,entity_id,admin_user_id,note_body,created_at,updated_at")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load operation notes: ${error.message}`);
  }

  const rows = (data as OperationNoteRow[] | null) ?? [];
  const labelMap = await fetchAdminUserLabelMap(rows.map((row) => row.admin_user_id));

  return rows.map((row) => mapOperationNote(row, labelMap));
}

async function listOperationComments(entityType: OperationEntityType, entityId: string) {
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_comments")
    .select("id,entity_type,entity_id,admin_user_id,comment_body,created_at,updated_at")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load operation comments: ${error.message}`);
  }

  const rows = (data as OperationCommentRow[] | null) ?? [];
  const [labelMap, handleMap] = await Promise.all([
    fetchAdminUserLabelMap(rows.map((row) => row.admin_user_id)),
    fetchAdminUserHandleMap(rows.map((row) => row.admin_user_id))
  ]);

  return rows.map((row) => mapOperationComment(row, labelMap, handleMap));
}

async function listOperationWatchers(entityType: OperationEntityType, entityId: string) {
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_watchers")
    .select(
      "id,entity_type,entity_id,admin_user_id,is_muted,notify_on_comment,notify_on_owner_change,notify_on_workflow_change,notify_on_resolve,created_at,updated_at"
    )
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load incident watchers: ${error.message}`);
  }

  const rows = (data as OperationWatcherRow[] | null) ?? [];
  const [labelMap, handleMap] = await Promise.all([
    fetchAdminUserLabelMap(rows.map((row) => row.admin_user_id)),
    fetchAdminUserHandleMap(rows.map((row) => row.admin_user_id))
  ]);

  return rows.map((row) => mapWatcherRow(row, labelMap, handleMap));
}

async function fetchWatchedEntityIds(entityType: OperationEntityType, adminUserId: string) {
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_watchers")
    .select("entity_id")
    .eq("entity_type", entityType)
    .eq("admin_user_id", adminUserId)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    throw new Error(`Failed to load watched incidents: ${error.message}`);
  }

  return [...new Set((((data as Array<{ entity_id: string }> | null) ?? []).map((row) => row.entity_id)))];
}

async function countWatchedUnresolvedIncidents(entityType: OperationEntityType, adminUserId: string) {
  const watchedIds = await fetchWatchedEntityIds(entityType, adminUserId);

  if (watchedIds.length === 0) {
    return 0;
  }

  const client = getOperationsClient();
  const table = entityType === "notification_delivery" ? "notification_deliveries" : "scheduled_jobs";
  const { count, error } = await client
    .from(table)
    .select("id", { count: "exact", head: true })
    .in("id", watchedIds)
    .neq("workflow_state", "resolved");

  if (error) {
    throw new Error(`Failed to count unresolved watched incidents: ${error.message}`);
  }

  return count ?? 0;
}

async function countTeamFollowedIncidents() {
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_watchers")
    .select("entity_type,entity_id");

  if (error) {
    throw new Error(`Failed to count team-followed incidents: ${error.message}`);
  }

  const counts = new Map<string, number>();

  for (const row of ((data as Array<{ entity_type: string; entity_id: string }> | null) ?? [])) {
    const key = `${row.entity_type}:${row.entity_id}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.values()].filter((count) => count > 1).length;
}

async function fetchWatcherMeta(
  entityType: OperationEntityType,
  entityIds: string[],
  currentAdminUserId?: string
) {
  const normalizedIds = [...new Set(entityIds.filter(Boolean))];

  if (normalizedIds.length === 0) {
    return new Map<string, WatcherMeta>();
  }

  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_watchers")
    .select("entity_id,admin_user_id")
    .eq("entity_type", entityType)
    .in("entity_id", normalizedIds);

  if (error) {
    throw new Error(`Failed to load watcher metadata: ${error.message}`);
  }

  const meta = new Map<string, WatcherMeta>();

  for (const entityId of normalizedIds) {
    meta.set(entityId, {
      count: 0,
      watchedByCurrentAdmin: false
    });
  }

  for (const row of ((data as Array<{ entity_id: string; admin_user_id: string }> | null) ?? [])) {
    const current = meta.get(row.entity_id) ?? {
      count: 0,
      watchedByCurrentAdmin: false
    };

    meta.set(row.entity_id, {
      count: current.count + 1,
      watchedByCurrentAdmin:
        current.watchedByCurrentAdmin || row.admin_user_id === currentAdminUserId
    });
  }

  return meta;
}

export async function listOperationQueueSubscriptions(
  adminUserId: string,
  entityType: OperationEntityType
): Promise<OperationQueueSubscriptionRecord[]> {
  await assertAdminActor(adminUserId);
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_queue_subscriptions")
    .select(
      "id,admin_user_id,entity_type,name,filters_json,is_active,is_muted,snoozed_until,muted_or_snoozed_reason,digest_cooldown_minutes,last_digest_at,last_digest_hash,consecutive_skip_count,consecutive_failure_count,last_success_at,last_failure_at,last_skip_reason,created_at,updated_at"
    )
    .eq("admin_user_id", adminUserId)
    .eq("entity_type", entityType)
    .order("is_active", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load queue subscriptions: ${error.message}`);
  }

  const rows = (data as OperationQueueSubscriptionRow[] | null) ?? [];
  const records = rows.map((row) => mapQueueSubscriptionRow(row));
  const stats = await Promise.all(
    records.map(async (record) => {
      const matches =
        entityType === "notification_delivery"
          ? await listAdminDeliveries(record.filters as AdminDeliveryFilters, 200, adminUserId)
          : await listAdminJobs(record.filters as AdminJobFilters, 200, adminUserId);

      return {
        id: record.id,
        ...summarizeMatchedIncidents(matches)
      };
    })
  );
  const statsMap = new Map(stats.map((entry) => [entry.id, entry]));

  return rows.map((row) => mapQueueSubscriptionRow(row, statsMap.get(row.id)));
}

export async function listOperationEscalationRules(
  adminUserId: string,
  entityType: OperationEntityType
): Promise<OperationEscalationRuleRecord[]> {
  await assertAdminActor(adminUserId);
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_escalation_rules")
    .select(
      "id,created_by_admin_user_id,entity_type,name,filters_json,escalation_reason,is_active,is_muted,snoozed_until,muted_or_snoozed_reason,run_mode,last_run_at,next_run_at,cooldown_minutes,max_matches_per_run,consecutive_skip_count,consecutive_failure_count,last_success_at,last_failure_at,last_skip_reason,created_at,updated_at"
    )
    .eq("created_by_admin_user_id", adminUserId)
    .eq("entity_type", entityType)
    .order("is_active", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load escalation rules: ${error.message}`);
  }

  const rows = (data as OperationEscalationRuleRow[] | null) ?? [];
  const records = rows.map((row) => mapEscalationRuleRow(row));
  const matchCounts = await Promise.all(
    records.map(async (record) => {
      const matches =
        entityType === "notification_delivery"
          ? await listAdminDeliveries(record.filters as AdminDeliveryFilters, 200, adminUserId)
          : await listAdminJobs(record.filters as AdminJobFilters, 200, adminUserId);

      return {
        id: record.id,
        count: matches.length
      };
    })
  );
  const countMap = new Map(matchCounts.map((entry) => [entry.id, entry.count]));

  return rows.map((row) => mapEscalationRuleRow(row, countMap.get(row.id) ?? 0));
}

export async function listOperationEscalationRuleRuns(
  adminUserId: string,
  entityType?: OperationEntityType,
  limit = 10
): Promise<OperationEscalationRuleRunRecord[]> {
  await assertAdminActor(adminUserId);
  const client = getOperationsClient();
  let rulesQuery = client
    .from("operation_escalation_rules")
    .select("id,entity_type")
    .eq("created_by_admin_user_id", adminUserId);

  if (entityType) {
    rulesQuery = rulesQuery.eq("entity_type", entityType);
  }

  const { data: rules, error: rulesError } = await rulesQuery;

  if (rulesError) {
    throw new Error(`Failed to load escalation rules for run history: ${rulesError.message}`);
  }

  const ruleIds = ((rules as Array<{ id: string }> | null) ?? []).map((rule) => rule.id);

  if (ruleIds.length === 0) {
    return [];
  }

  const { data, error } = await client
    .from("operation_escalation_rule_runs")
    .select(
      "id,operation_escalation_rule_id,triggered_by,triggered_by_admin_user_id,matched_count,escalated_count,skipped_count,run_status,skip_reason,failure_reason,duration_ms,run_summary,created_at"
    )
    .in("operation_escalation_rule_id", ruleIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load escalation rule runs: ${error.message}`);
  }

  const rows = (data as OperationEscalationRuleRunRow[] | null) ?? [];
  const labelMap = await fetchAdminUserLabelMap(rows.map((row) => row.triggered_by_admin_user_id));

  return rows.map((row) => mapEscalationRuleRunRow(row, labelMap));
}

export async function listOperationSubscriptionDigestRuns(
  adminUserId: string,
  entityType?: OperationEntityType,
  limit = 10
): Promise<OperationSubscriptionDigestRunRecord[]> {
  await assertAdminActor(adminUserId);
  const client = getOperationsClient();
  let subscriptionQuery = client
    .from("operation_queue_subscriptions")
    .select("id,entity_type")
    .eq("admin_user_id", adminUserId);

  if (entityType) {
    subscriptionQuery = subscriptionQuery.eq("entity_type", entityType);
  }

  const { data: subscriptions, error: subscriptionsError } = await subscriptionQuery;

  if (subscriptionsError) {
    throw new Error(
      `Failed to load queue subscriptions for digest history: ${subscriptionsError.message}`
    );
  }

  const subscriptionIds = ((subscriptions as Array<{ id: string }> | null) ?? []).map(
    (subscription) => subscription.id
  );

  if (subscriptionIds.length === 0) {
    return [];
  }

  const { data, error } = await client
    .from("operation_subscription_digest_runs")
    .select("id,operation_queue_subscription_id,triggered_by,triggered_by_admin_user_id,match_count,run_status,skip_reason,failure_reason,duration_ms,digest_summary,delivered_via,created_at")
    .in("operation_queue_subscription_id", subscriptionIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load subscription digest runs: ${error.message}`);
  }

  const rows = (data as OperationSubscriptionDigestRunRow[] | null) ?? [];
  const labelMap = await fetchAdminUserLabelMap(rows.map((row) => row.triggered_by_admin_user_id));

  return rows.map((row) => mapSubscriptionDigestRunRow(row, labelMap));
}

async function assertAutomationEntityExists(
  entityType: OperationAutomationEntityType,
  entityId: string
) {
  const client = getOperationsClient();
  const table =
    entityType === "operation_escalation_rule"
      ? "operation_escalation_rules"
      : "operation_queue_subscriptions";
  const { data, error } = await client.from(table).select("id").eq("id", entityId).maybeSingle();

  if (error) {
    throw new Error(`Failed to validate automation entity: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Automation entity could not be found.");
  }
}

async function fetchAutomationEntitySummary(
  entityType: OperationAutomationEntityType,
  entityId: string
) {
  const client = getOperationsClient();
  const query =
    entityType === "operation_escalation_rule"
      ? client.from("operation_escalation_rules").select("id,name").eq("id", entityId).maybeSingle()
      : client
          .from("operation_queue_subscriptions")
          .select("id,name")
          .eq("id", entityId)
          .maybeSingle();

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load automation entity summary: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Automation entity could not be found.");
  }

  return data as { id: string; name: string };
}

async function listAutomationAcknowledgements(
  entityType: OperationAutomationEntityType,
  entityIds: string[]
): Promise<OperationAutomationAcknowledgementRecord[]> {
  if (entityIds.length === 0) {
    return [];
  }

  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_automation_acknowledgements")
    .select(
      "id,entity_type,entity_id,admin_user_id,status,note,assigned_admin_user_id,assigned_at,remind_at,reminder_state,last_reminded_at,reminder_dismissed_at,reminder_snoozed_until,reminder_snooze_reason,reminder_last_action,rerun_outcome,last_rerun_at,verification_state,verification_summary,verification_status,verification_completed_at,verification_completed_by_admin_user_id,verification_notes,created_at,updated_at"
    )
    .eq("entity_type", entityType)
    .in("entity_id", entityIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load automation acknowledgements: ${error.message}`);
  }

  const rows = (data as OperationAutomationAcknowledgementRow[] | null) ?? [];
  const labelMap = await fetchAdminUserLabelMap(
    rows.flatMap((row) => [
      row.admin_user_id,
      row.assigned_admin_user_id,
      row.verification_completed_by_admin_user_id
    ])
  );

  return rows.map((row) => mapAutomationAcknowledgementRow(row, labelMap));
}

function getLatestAcknowledgements(
  acknowledgements: OperationAutomationAcknowledgementRecord[]
) {
  const latest = new Map<string, OperationAutomationAcknowledgementRecord>();

  for (const acknowledgement of acknowledgements) {
    if (!latest.has(acknowledgement.entityId)) {
      latest.set(acknowledgement.entityId, acknowledgement);
    }
  }

  return latest;
}

function isReminderSnoozed(
  acknowledgement: Pick<OperationAutomationAcknowledgementRecord, "reminderSnoozedUntil">
) {
  return (
    Boolean(acknowledgement.reminderSnoozedUntil) &&
    new Date(acknowledgement.reminderSnoozedUntil as string).getTime() > Date.now()
  );
}

function computeReminderState(input: {
  current: OperationAutomationAcknowledgementRecord | null;
  nextStatus: OperationAutomationAcknowledgementStatus;
  remindAt: string | null;
  statusChanged: boolean;
  reminderChanged: boolean;
}): {
  reminderState: OperationAutomationReminderState;
  reminderDismissedAt: string | null;
  reminderSnoozedUntil: string | null;
  reminderSnoozeReason: string | null;
  reminderLastAction: OperationAutomationReminderLastAction;
} {
  const current = input.current;

  if (!input.remindAt) {
    return {
      reminderState: current?.reminderState === "dismissed" ? "dismissed" : ("none" as const),
      reminderDismissedAt: current?.reminderDismissedAt ?? null,
      reminderSnoozedUntil: null,
      reminderSnoozeReason: null,
      reminderLastAction: current?.reminderLastAction ?? ("none" as const)
    };
  }

  if (current?.reminderState === "dismissed" && !input.statusChanged && !input.reminderChanged) {
    return {
      reminderState: "dismissed" as const,
      reminderDismissedAt: current.reminderDismissedAt ?? current.updatedAt,
      reminderSnoozedUntil: current.reminderSnoozedUntil,
      reminderSnoozeReason: current.reminderSnoozeReason,
      reminderLastAction: "dismissed" as const
    };
  }

  return {
    reminderState: "scheduled" as const,
    reminderDismissedAt: null,
    reminderSnoozedUntil: null,
    reminderSnoozeReason: null,
    reminderLastAction: input.reminderChanged
      ? ("rescheduled" as const)
      : current?.reminderState === "sent"
        ? ("scheduled" as const)
        : ((current?.reminderLastAction ?? "scheduled") as OperationAutomationReminderLastAction)
  };
}

async function insertAutomationAcknowledgementSnapshot(input: {
  entityType: OperationAutomationEntityType;
  entityId: string;
  adminUserId: string;
  status: OperationAutomationAcknowledgementStatus;
  note: string | null;
  assignedAdminUserId: string | null;
  assignedAt: string | null;
  remindAt: string | null;
  reminderState: OperationAutomationReminderState;
  lastRemindedAt: string | null;
  reminderDismissedAt: string | null;
  reminderSnoozedUntil: string | null;
  reminderSnoozeReason: string | null;
  reminderLastAction: OperationAutomationReminderLastAction;
  rerunOutcome: OperationAutomationRunStatus | null;
  lastRerunAt: string | null;
  verificationState: OperationAutomationVerificationState;
  verificationSummary: string | null;
  verificationStatus: OperationAutomationVerificationStatus;
  verificationCompletedAt: string | null;
  verificationCompletedByAdminUserId: string | null;
  verificationNotes: string | null;
}) {
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_automation_acknowledgements")
    .insert({
      entity_type: input.entityType,
      entity_id: input.entityId,
      admin_user_id: input.adminUserId,
      status: input.status,
      note: input.note,
      assigned_admin_user_id: input.assignedAdminUserId,
      assigned_at: input.assignedAt,
      remind_at: input.remindAt,
      reminder_state: input.reminderState,
      last_reminded_at: input.lastRemindedAt,
      reminder_dismissed_at: input.reminderDismissedAt,
      reminder_snoozed_until: input.reminderSnoozedUntil,
      reminder_snooze_reason: input.reminderSnoozeReason,
      reminder_last_action: input.reminderLastAction,
      rerun_outcome: input.rerunOutcome,
      last_rerun_at: input.lastRerunAt,
      verification_state: input.verificationState,
      verification_summary: input.verificationSummary,
      verification_status: input.verificationStatus,
      verification_completed_at: input.verificationCompletedAt,
      verification_completed_by_admin_user_id: input.verificationCompletedByAdminUserId,
      verification_notes: input.verificationNotes
    })
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to write automation acknowledgement snapshot: ${error.message}`);
  }

  return (data as { id: string } | null)?.id ?? null;
}

function getAutomationEntityLink(entityType: OperationAutomationEntityType, entityId: string) {
  return entityType === "operation_escalation_rule"
    ? `/admin/operations/rules/${entityId}`
    : `/admin/operations/subscriptions/${entityId}`;
}

async function insertOperationsNotification(input: {
  userId: string;
  type:
    | "automation_acknowledgement_assignment"
    | "automation_acknowledgement_reminder"
    | "automation_acknowledgement_overdue"
    | "automation_verification_needed";
  title: string;
  message: string;
  linkUrl: string;
  relatedEntityType: OperationAutomationEntityType;
  relatedEntityId: string;
  dedupeKey: string;
}) {
  const client = getOperationsClient();
  const { error } = await client.from("notifications").upsert(
    {
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link_url: input.linkUrl,
      related_entity_type: input.relatedEntityType,
      related_entity_id: input.relatedEntityId,
      dedupe_key: input.dedupeKey,
      is_read: false
    },
    {
      onConflict: "dedupe_key",
      ignoreDuplicates: true
    }
  );

  if (error) {
    throw new Error(`Failed to create operations notification: ${error.message}`);
  }
}

async function fetchEscalationRuleRunsByRuleId(
  ruleId: string,
  limit = 30
): Promise<OperationEscalationRuleRunRecord[]> {
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_escalation_rule_runs")
    .select(
      "id,operation_escalation_rule_id,triggered_by,triggered_by_admin_user_id,matched_count,escalated_count,skipped_count,run_status,skip_reason,failure_reason,duration_ms,run_summary,created_at"
    )
    .eq("operation_escalation_rule_id", ruleId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load escalation rule runs: ${error.message}`);
  }

  const rows = (data as OperationEscalationRuleRunRow[] | null) ?? [];
  const labelMap = await fetchAdminUserLabelMap(rows.map((row) => row.triggered_by_admin_user_id));

  return rows.map((row) => mapEscalationRuleRunRow(row, labelMap));
}

async function fetchSubscriptionDigestRunsBySubscriptionId(
  subscriptionId: string,
  limit = 30
): Promise<OperationSubscriptionDigestRunRecord[]> {
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_subscription_digest_runs")
    .select(
      "id,operation_queue_subscription_id,triggered_by,triggered_by_admin_user_id,match_count,run_status,skip_reason,failure_reason,duration_ms,digest_summary,delivered_via,created_at"
    )
    .eq("operation_queue_subscription_id", subscriptionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load subscription digest runs: ${error.message}`);
  }

  const rows = (data as OperationSubscriptionDigestRunRow[] | null) ?? [];
  const labelMap = await fetchAdminUserLabelMap(rows.map((row) => row.triggered_by_admin_user_id));

  return rows.map((row) => mapSubscriptionDigestRunRow(row, labelMap));
}

function buildRuleTrendWindows(
  runs: OperationEscalationRuleRunRecord[]
): OperationAutomationTrendSummary[] {
  return buildAutomationTrendWindows(
    runs.map((run) => ({
      runStatus: run.runStatus,
      skipReason: run.skipReason,
      failureReason: run.failureReason,
      createdAt: run.createdAt,
      matchCount: run.matchedCount
    }))
  );
}

function buildSubscriptionTrendWindows(
  runs: OperationSubscriptionDigestRunRecord[]
): OperationAutomationTrendSummary[] {
  return buildAutomationTrendWindows(
    runs.map((run) => ({
      runStatus: run.runStatus,
      skipReason: run.skipReason,
      failureReason: run.failureReason,
      createdAt: run.createdAt,
      matchCount: run.matchCount
    }))
  );
}

export async function fetchOperationEscalationRuleDetail(
  ruleId: string,
  adminUserId: string
): Promise<OperationEscalationRuleDetail | null> {
  await assertAdminActor(adminUserId);
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_escalation_rules")
    .select(
      "id,created_by_admin_user_id,entity_type,name,filters_json,escalation_reason,is_active,is_muted,snoozed_until,muted_or_snoozed_reason,run_mode,last_run_at,next_run_at,cooldown_minutes,max_matches_per_run,consecutive_skip_count,consecutive_failure_count,last_success_at,last_failure_at,last_skip_reason,created_at,updated_at"
    )
    .eq("id", ruleId)
    .eq("created_by_admin_user_id", adminUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load escalation rule detail: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const row = data as OperationEscalationRuleRow;
  const filters = normalizeSubscriptionFilters(row.entity_type, row.filters_json);
  const matches =
    row.entity_type === "notification_delivery"
      ? await listAdminDeliveries(filters as AdminDeliveryFilters, 200, adminUserId)
      : await listAdminJobs(filters as AdminJobFilters, 200, adminUserId);
  const rule = mapEscalationRuleRow(row, matches.length);
  const recentRuns = await fetchEscalationRuleRunsByRuleId(ruleId, 30);
  const acknowledgementHistory = await listAutomationAcknowledgements(
    "operation_escalation_rule",
    [ruleId]
  );
  const acknowledgement = acknowledgementHistory[0] ?? null;
  const remediationPlaybooks = buildRemediationPlaybooks(
    rule,
    recentRuns.map((run) => ({
      skipReason: run.skipReason,
      failureReason: run.failureReason
    }))
  );
  const rerunGuidance = buildManualRerunGuidance(
    rule,
    recentRuns.map((run) => ({
      runStatus: run.runStatus,
      skipReason: run.skipReason,
      failureReason: run.failureReason,
      createdAt: run.createdAt,
      matchCount: run.matchedCount
    }))
  );
  const verificationGuidance = buildPostRerunVerificationGuidance({
    acknowledgement,
    outcome: acknowledgement?.rerunOutcome ?? null,
    playbooks: remediationPlaybooks,
    currentMatchCount: rule.currentMatchCount,
    automationState: rule.automationState,
    lastSkipReason: rule.lastSkipReason,
    lastFailureAt: rule.lastFailureAt
  });

  return {
    rule,
    recentRuns,
    trendWindows: buildRuleTrendWindows(recentRuns),
    rerunGuidance,
    acknowledgement,
    acknowledgementHistory,
    remediationPlaybooks,
    rerunReadiness: buildAutomationRerunReadiness({
      record: rule,
      acknowledgement,
      playbooks: remediationPlaybooks,
      guidance: rerunGuidance
    }),
    verificationGuidance
  };
}

export async function fetchOperationQueueSubscriptionDetail(
  subscriptionId: string,
  adminUserId: string
): Promise<OperationQueueSubscriptionDetail | null> {
  await assertAdminActor(adminUserId);
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_queue_subscriptions")
    .select(
      "id,admin_user_id,entity_type,name,filters_json,is_active,is_muted,snoozed_until,muted_or_snoozed_reason,digest_cooldown_minutes,last_digest_at,last_digest_hash,consecutive_skip_count,consecutive_failure_count,last_success_at,last_failure_at,last_skip_reason,created_at,updated_at"
    )
    .eq("id", subscriptionId)
    .eq("admin_user_id", adminUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load queue subscription detail: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const row = data as OperationQueueSubscriptionRow;
  const filters = normalizeSubscriptionFilters(row.entity_type, row.filters_json);
  const matches =
    row.entity_type === "notification_delivery"
      ? await listAdminDeliveries(filters as AdminDeliveryFilters, 200, adminUserId)
      : await listAdminJobs(filters as AdminJobFilters, 200, adminUserId);
  const subscription = mapQueueSubscriptionRow(row, summarizeMatchedIncidents(matches));
  const recentRuns = await fetchSubscriptionDigestRunsBySubscriptionId(subscriptionId, 30);
  const acknowledgementHistory = await listAutomationAcknowledgements(
    "operation_queue_subscription",
    [subscriptionId]
  );
  const acknowledgement = acknowledgementHistory[0] ?? null;
  const remediationPlaybooks = buildRemediationPlaybooks(
    subscription,
    recentRuns.map((run) => ({
      skipReason: run.skipReason,
      failureReason: run.failureReason
    }))
  );
  const rerunGuidance = buildManualRerunGuidance(
    subscription,
    recentRuns.map((run) => ({
      runStatus: run.runStatus,
      skipReason: run.skipReason,
      failureReason: run.failureReason,
      createdAt: run.createdAt,
      matchCount: run.matchCount
    }))
  );
  const verificationGuidance = buildPostRerunVerificationGuidance({
    acknowledgement,
    outcome: acknowledgement?.rerunOutcome ?? null,
    playbooks: remediationPlaybooks,
    currentMatchCount: subscription.currentMatchCount,
    automationState: subscription.automationState,
    lastSkipReason: subscription.lastSkipReason,
    lastFailureAt: subscription.lastFailureAt
  });

  return {
    subscription,
    recentRuns,
    trendWindows: buildSubscriptionTrendWindows(recentRuns),
    rerunGuidance,
    acknowledgement,
    acknowledgementHistory,
    remediationPlaybooks,
    rerunReadiness: buildAutomationRerunReadiness({
      record: subscription,
      acknowledgement,
      playbooks: remediationPlaybooks,
      guidance: rerunGuidance
    }),
    verificationGuidance
  };
}

async function findMatchingSubscriptionsForIncident(
  adminUserId: string,
  entityType: OperationEntityType,
  incident: AdminDeliveryRecord | AdminScheduledJobRecord,
  options?: {
    recentlyHandedOff?: boolean;
    isWatching?: boolean;
  }
) {
  const subscriptions = await listOperationQueueSubscriptions(adminUserId, entityType);

  return subscriptions.filter((subscription) => {
    if (!subscription.isActive) {
      return false;
    }

    if (entityType === "notification_delivery") {
      return matchesDeliverySubscription(
        incident as AdminDeliveryRecord,
        subscription.filters as AdminDeliveryFilters,
        {
          adminUserId,
          isWatching: options?.isWatching ?? false,
          recentlyHandedOff: options?.recentlyHandedOff ?? false
        }
      );
    }

    return matchesJobSubscription(
      incident as AdminScheduledJobRecord,
      subscription.filters as AdminJobFilters,
      {
        adminUserId,
        isWatching: options?.isWatching ?? false,
        recentlyHandedOff: options?.recentlyHandedOff ?? false
      }
    );
  });
}

async function listOperationAuditEvents(entityType: OperationEntityType, entityId: string) {
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_audit_events")
    .select(
      "id,entity_type,entity_id,admin_user_id,event_type,event_summary,metadata,created_at"
    )
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load operation audit events: ${error.message}`);
  }

  const rows = (data as OperationAuditEventRow[] | null) ?? [];
  const labelMap = await fetchAdminUserLabelMap(rows.map((row) => row.admin_user_id));

  return rows.map((row) => mapOperationAuditEvent(row, labelMap));
}

async function listAssignmentHistory(entityType: OperationEntityType, entityId: string) {
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_assignment_history")
    .select(
      "id,entity_type,entity_id,previous_admin_user_id,new_admin_user_id,changed_by_admin_user_id,handoff_note,created_at"
    )
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load assignment history: ${error.message}`);
  }

  const rows = (data as OperationAssignmentHistoryRow[] | null) ?? [];
  const labelMap = await fetchAdminUserLabelMap(
    rows.flatMap((row) => [
      row.previous_admin_user_id,
      row.new_admin_user_id,
      row.changed_by_admin_user_id
    ])
  );

  return rows.map((row) => mapAssignmentHistoryRow(row, labelMap));
}

export async function listOperationSavedViews(
  adminUserId: string,
  entityType: OperationEntityType
): Promise<OperationSavedViewRecord[]> {
  await assertAdminActor(adminUserId);
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_saved_views")
    .select("id,admin_user_id,entity_type,name,filters_json,is_default,created_at,updated_at")
    .eq("admin_user_id", adminUserId)
    .eq("entity_type", entityType)
    .order("is_default", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load saved views: ${error.message}`);
  }

  return ((data as OperationSavedViewRow[] | null) ?? []).map((row) => mapSavedViewRow(row));
}

export async function fetchDefaultOperationSavedView(
  adminUserId: string,
  entityType: OperationEntityType
): Promise<OperationSavedViewRecord | null> {
  await assertAdminActor(adminUserId);
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_saved_views")
    .select("id,admin_user_id,entity_type,name,filters_json,is_default,created_at,updated_at")
    .eq("admin_user_id", adminUserId)
    .eq("entity_type", entityType)
    .eq("is_default", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load default saved view: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const row = data as OperationSavedViewRow;

  return mapSavedViewRow(row);
}

export async function createOperationQueueSubscription(input: {
  adminUserId: string;
  entityType: OperationEntityType;
  name: string;
  filters: AdminDeliveryFilters | AdminJobFilters;
  isActive: boolean;
  digestCooldownMinutes?: number;
}) {
  await assertAdminActor(input.adminUserId);
  const client = getOperationsClient();
  const name = input.name.trim();

  if (!name) {
    throw new OperationsError("A subscription name is required.");
  }

  const digestCooldownMinutes =
    typeof input.digestCooldownMinutes === "number"
      ? Math.max(0, Math.floor(input.digestCooldownMinutes))
      : 180;

  const normalizedFilters = normalizeSubscriptionFilters(input.entityType, input.filters);
  const { data: existing, error: existingError } = await client
    .from("operation_queue_subscriptions")
    .select("id")
    .eq("admin_user_id", input.adminUserId)
    .eq("entity_type", input.entityType)
    .ilike("name", name)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to validate subscription name: ${existingError.message}`);
  }

  if (existing) {
    throw new OperationsError("You already have a queue subscription with this name.");
  }

  const { data, error } = await client
    .from("operation_queue_subscriptions")
    .insert({
      admin_user_id: input.adminUserId,
      entity_type: input.entityType,
      name,
      filters_json: normalizedFilters,
      is_active: input.isActive,
      digest_cooldown_minutes: digestCooldownMinutes
    })
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to create queue subscription: ${error.message}`);
  }

  const subscriptionId = (data as { id: string } | null)?.id;

  if (!subscriptionId) {
    throw new OperationsError("Queue subscription could not be created.");
  }

  await recordOperationAuditEvent({
    entityType: input.entityType,
    entityId: subscriptionId,
    adminUserId: input.adminUserId,
    eventType: "subscription_created",
    eventSummary: "Operator created a queue subscription.",
    metadata: {
      name,
      isActive: input.isActive,
      digestCooldownMinutes
    }
  });
}

export async function updateOperationQueueSubscription(input: {
  subscriptionId: string;
  adminUserId: string;
  name?: string;
  filters?: AdminDeliveryFilters | AdminJobFilters;
  isActive?: boolean;
  digestCooldownMinutes?: number;
}) {
  await assertAdminActor(input.adminUserId);
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_queue_subscriptions")
    .select("id,admin_user_id,entity_type,name,filters_json,is_active,is_muted,snoozed_until,muted_or_snoozed_reason,digest_cooldown_minutes,last_digest_at,last_digest_hash,consecutive_skip_count,consecutive_failure_count,last_success_at,last_failure_at,last_skip_reason")
    .eq("id", input.subscriptionId)
    .eq("admin_user_id", input.adminUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load queue subscription: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Queue subscription not found.");
  }

  const row = data as Record<string, unknown>;
  const nextName =
    typeof input.name === "string" && input.name.trim() ? input.name.trim() : String(row.name);

  if (nextName !== String(row.name)) {
    const { data: existing, error: existingError } = await client
      .from("operation_queue_subscriptions")
      .select("id")
      .eq("admin_user_id", input.adminUserId)
      .eq("entity_type", String(row.entity_type))
      .ilike("name", nextName)
      .neq("id", input.subscriptionId)
      .maybeSingle();

    if (existingError) {
      throw new Error(`Failed to validate subscription name: ${existingError.message}`);
    }

    if (existing) {
      throw new OperationsError("You already have a queue subscription with this name.");
    }
  }

  const normalizedFilters =
    input.filters !== undefined
      ? normalizeSubscriptionFilters(
          row.entity_type as OperationEntityType,
          input.filters as unknown
        )
      : row.filters_json;
  const isActive =
    typeof input.isActive === "boolean" ? input.isActive : Boolean(row.is_active);
  const digestCooldownMinutes =
    typeof input.digestCooldownMinutes === "number"
      ? Math.max(0, Math.floor(input.digestCooldownMinutes))
      : Number(row.digest_cooldown_minutes ?? 180);

  const { error: updateError } = await client
    .from("operation_queue_subscriptions")
    .update({
      name: nextName,
      filters_json: normalizedFilters,
      is_active: isActive,
      digest_cooldown_minutes: digestCooldownMinutes
    })
    .eq("id", input.subscriptionId)
    .eq("admin_user_id", input.adminUserId);

  if (updateError) {
    throw new Error(`Failed to update queue subscription: ${updateError.message}`);
  }

  await recordOperationAuditEvent({
    entityType: row.entity_type as OperationEntityType,
    entityId: input.subscriptionId,
    adminUserId: input.adminUserId,
    eventType:
      typeof input.isActive === "boolean" && input.name === undefined && input.filters === undefined
        ? "subscription_toggled"
        : "subscription_updated",
    eventSummary:
      typeof input.isActive === "boolean" && input.name === undefined && input.filters === undefined
        ? "Operator changed queue-subscription active state."
        : "Operator updated a queue subscription.",
    metadata: {
      name: nextName,
      isActive,
      digestCooldownMinutes
    }
  });
}

function normalizeAutomationReason(value?: string | null) {
  return value?.trim() ? value.trim() : null;
}

function normalizeSnoozedUntil(value?: string | null) {
  if (!value?.trim()) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new OperationsError("Choose a valid snooze time.");
  }

  if (parsed.getTime() <= Date.now()) {
    throw new OperationsError("Snooze time must be in the future.");
  }

  return parsed.toISOString();
}

export async function updateOperationQueueSubscriptionAutomationControl(input: {
  subscriptionId: string;
  adminUserId: string;
  action: "mute" | "unmute" | "snooze" | "resume";
  snoozedUntil?: string | null;
  reason?: string | null;
}) {
  await assertAdminActor(input.adminUserId);
  if (!["mute", "unmute", "snooze", "resume"].includes(input.action)) {
    throw new OperationsError("Choose a valid subscription automation action.");
  }

  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_queue_subscriptions")
    .select(
      "id,entity_type,is_muted,snoozed_until,muted_or_snoozed_reason"
    )
    .eq("id", input.subscriptionId)
    .eq("admin_user_id", input.adminUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load queue subscription automation state: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Queue subscription not found.");
  }

  const nextReason = normalizeAutomationReason(input.reason);
  const nextSnoozedUntil =
    input.action === "snooze" ? normalizeSnoozedUntil(input.snoozedUntil) : null;
  const update =
    input.action === "mute"
      ? {
          is_muted: true,
          snoozed_until: null,
          muted_or_snoozed_reason: nextReason
        }
      : input.action === "unmute"
        ? {
            is_muted: false,
            muted_or_snoozed_reason: null
          }
        : input.action === "snooze"
          ? {
              is_muted: false,
              snoozed_until: nextSnoozedUntil,
              muted_or_snoozed_reason: nextReason
            }
          : {
              is_muted: false,
              snoozed_until: null,
              muted_or_snoozed_reason: null
            };

  const { error: updateError } = await client
    .from("operation_queue_subscriptions")
    .update(update)
    .eq("id", input.subscriptionId)
    .eq("admin_user_id", input.adminUserId);

  if (updateError) {
    throw new Error(
      `Failed to update queue subscription automation control: ${updateError.message}`
    );
  }

  await recordOperationAuditEvent({
    entityType: data.entity_type as OperationEntityType,
    entityId: input.subscriptionId,
    adminUserId: input.adminUserId,
    eventType:
      input.action === "mute"
        ? "automation_muted"
        : input.action === "unmute"
          ? "automation_unmuted"
          : input.action === "snooze"
            ? "automation_snoozed"
            : "automation_resumed",
    eventSummary:
      input.action === "mute"
        ? "Operator muted queue-subscription automation."
        : input.action === "unmute"
          ? "Operator unmuted queue-subscription automation."
          : input.action === "snooze"
            ? "Operator snoozed queue-subscription automation."
            : "Operator resumed queue-subscription automation.",
    metadata: {
      snoozedUntil: nextSnoozedUntil,
      reason: nextReason
    }
  });
}

export async function deleteOperationQueueSubscription(
  subscriptionId: string,
  adminUserId: string
) {
  await assertAdminActor(adminUserId);
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_queue_subscriptions")
    .select("entity_type")
    .eq("id", subscriptionId)
    .eq("admin_user_id", adminUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load queue subscription: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Queue subscription not found.");
  }

  const { error: deleteError } = await client
    .from("operation_queue_subscriptions")
    .delete()
    .eq("id", subscriptionId)
    .eq("admin_user_id", adminUserId);

  if (deleteError) {
    throw new Error(`Failed to delete queue subscription: ${deleteError.message}`);
  }

  await recordOperationAuditEvent({
    entityType: (data as { entity_type: OperationEntityType }).entity_type,
    entityId: subscriptionId,
    adminUserId,
    eventType: "subscription_deleted",
    eventSummary: "Operator deleted a queue subscription."
  });
}

export async function bulkManageQueueSubscriptions(input: {
  adminUserId: string;
  subscriptionIds: string[];
  action: "activate" | "deactivate" | "delete" | "duplicate";
}) {
  await assertAdminActor(input.adminUserId);
  const selectedIds = normalizeBulkSelection(input.subscriptionIds);

  if (selectedIds.length === 0) {
    throw new OperationsError("Select at least one subscription first.");
  }

  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_queue_subscriptions")
    .select(
      "id,admin_user_id,entity_type,name,filters_json,is_active,is_muted,snoozed_until,muted_or_snoozed_reason,digest_cooldown_minutes,last_digest_at,last_digest_hash,consecutive_skip_count,consecutive_failure_count,last_success_at,last_failure_at,last_skip_reason,created_at,updated_at"
    )
    .eq("admin_user_id", input.adminUserId)
    .in("id", selectedIds);

  if (error) {
    throw new Error(`Failed to load queue subscriptions: ${error.message}`);
  }

  const rows = (data as OperationQueueSubscriptionRow[] | null) ?? [];
  const summary = createBulkSummary(selectedIds.length);

  for (const subscriptionId of selectedIds) {
    const row = rows.find((entry) => entry.id === subscriptionId);

    if (!row) {
      summarizeFailure(summary, subscriptionId, new OperationsError("Subscription not found."));
      continue;
    }

    try {
      if (input.action === "delete") {
        await deleteOperationQueueSubscription(subscriptionId, input.adminUserId);
      } else if (input.action === "duplicate") {
        let name = `${row.name} Copy`;
        let suffix = 2;

        while (
          rows.some(
            (existing) =>
              existing.entity_type === row.entity_type &&
              existing.name.toLowerCase() === name.toLowerCase()
          )
        ) {
          name = `${row.name} Copy ${suffix}`;
          suffix += 1;
        }

        await createOperationQueueSubscription({
          adminUserId: input.adminUserId,
          entityType: row.entity_type,
          name,
          filters: normalizeSubscriptionFilters(row.entity_type, row.filters_json),
          isActive: row.is_active,
          digestCooldownMinutes: row.digest_cooldown_minutes ?? 180
        });
      } else {
        await updateOperationQueueSubscription({
          subscriptionId,
          adminUserId: input.adminUserId,
          isActive: input.action === "activate"
        });

        await recordOperationAuditEvent({
          entityType: row.entity_type,
          entityId: subscriptionId,
          adminUserId: input.adminUserId,
          eventType:
            input.action === "activate"
              ? "bulk_subscription_activated"
              : "bulk_subscription_deactivated",
          eventSummary:
            input.action === "activate"
              ? "Operator activated a queue subscription through a bulk action."
              : "Operator deactivated a queue subscription through a bulk action."
        });
      }

      if (input.action === "delete") {
        await recordOperationAuditEvent({
          entityType: row.entity_type,
          entityId: subscriptionId,
          adminUserId: input.adminUserId,
          eventType: "bulk_subscription_deleted",
          eventSummary: "Operator deleted a queue subscription through a bulk action."
        });
      }

      if (input.action === "duplicate") {
        await recordOperationAuditEvent({
          entityType: row.entity_type,
          entityId: subscriptionId,
          adminUserId: input.adminUserId,
          eventType: "bulk_subscription_duplicated",
          eventSummary: "Operator duplicated a queue subscription through a bulk action."
        });
      }

      summary.succeeded += 1;
    } catch (actionError) {
      summarizeFailure(summary, subscriptionId, actionError);
    }
  }

  return summary;
}

export async function createOperationEscalationRule(input: {
  adminUserId: string;
  entityType: OperationEntityType;
  name: string;
  filters: AdminDeliveryFilters | AdminJobFilters;
  escalationReason: string;
  isActive: boolean;
  runMode: OperationRuleRunMode;
  cooldownMinutes: number;
  maxMatchesPerRun: number;
}) {
  await assertAdminActor(input.adminUserId);
  const client = getOperationsClient();
  const name = input.name.trim();
  const escalationReason = input.escalationReason.trim();

  if (!name) {
    throw new OperationsError("An escalation-rule name is required.");
  }

  if (!escalationReason) {
    throw new OperationsError("An escalation reason is required.");
  }

  if (!["manual", "automated"].includes(input.runMode)) {
    throw new OperationsError("Select a valid escalation-rule run mode.");
  }

  if (!Number.isFinite(input.cooldownMinutes) || input.cooldownMinutes < 0) {
    throw new OperationsError("Cooldown minutes must be zero or greater.");
  }

  if (!Number.isFinite(input.maxMatchesPerRun) || input.maxMatchesPerRun < 1) {
    throw new OperationsError("Max matches per run must be at least 1.");
  }

  const { data: existing, error: existingError } = await client
    .from("operation_escalation_rules")
    .select("id")
    .eq("created_by_admin_user_id", input.adminUserId)
    .eq("entity_type", input.entityType)
    .ilike("name", name)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to validate escalation-rule name: ${existingError.message}`);
  }

  if (existing) {
    throw new OperationsError("You already have an escalation rule with this name.");
  }

  const { data, error } = await client
    .from("operation_escalation_rules")
    .insert({
      created_by_admin_user_id: input.adminUserId,
      entity_type: input.entityType,
      name,
      filters_json: normalizeSubscriptionFilters(input.entityType, input.filters),
      escalation_reason: escalationReason,
      is_active: input.isActive,
      run_mode: input.runMode,
      cooldown_minutes: Math.floor(input.cooldownMinutes),
      max_matches_per_run: Math.floor(input.maxMatchesPerRun),
      next_run_at:
        input.isActive && input.runMode === "automated" ? new Date().toISOString() : null
    })
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to create escalation rule: ${error.message}`);
  }

  const ruleId = (data as { id: string } | null)?.id;

  if (!ruleId) {
    throw new OperationsError("Escalation rule could not be created.");
  }

  await recordOperationAuditEvent({
    entityType: input.entityType,
    entityId: ruleId,
    adminUserId: input.adminUserId,
    eventType: "escalation_rule_created",
    eventSummary: "Operator created an escalation rule.",
    metadata: {
      name,
      isActive: input.isActive,
      runMode: input.runMode,
      cooldownMinutes: Math.floor(input.cooldownMinutes),
      maxMatchesPerRun: Math.floor(input.maxMatchesPerRun)
    }
  });
}

export async function updateOperationEscalationRule(input: {
  ruleId: string;
  adminUserId: string;
  name?: string;
  filters?: AdminDeliveryFilters | AdminJobFilters;
  escalationReason?: string;
  isActive?: boolean;
  runMode?: OperationRuleRunMode;
  cooldownMinutes?: number;
  maxMatchesPerRun?: number;
}) {
  await assertAdminActor(input.adminUserId);
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_escalation_rules")
    .select(
      "id,created_by_admin_user_id,entity_type,name,filters_json,escalation_reason,is_active,is_muted,snoozed_until,muted_or_snoozed_reason,run_mode,last_run_at,next_run_at,cooldown_minutes,max_matches_per_run,consecutive_skip_count,consecutive_failure_count,last_success_at,last_failure_at,last_skip_reason"
    )
    .eq("id", input.ruleId)
    .eq("created_by_admin_user_id", input.adminUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load escalation rule: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Escalation rule not found.");
  }

  const row = data as Record<string, unknown>;
  const nextName =
    typeof input.name === "string" && input.name.trim() ? input.name.trim() : String(row.name);
  const nextReason =
    typeof input.escalationReason === "string" && input.escalationReason.trim()
      ? input.escalationReason.trim()
      : String(row.escalation_reason);

  if (!nextReason) {
    throw new OperationsError("An escalation reason is required.");
  }

  const nextRunMode =
    input.runMode === "manual" || input.runMode === "automated"
      ? input.runMode
      : (String(row.run_mode ?? "manual") as OperationRuleRunMode);
  const nextCooldown =
    typeof input.cooldownMinutes === "number"
      ? Math.floor(input.cooldownMinutes)
      : Number(row.cooldown_minutes ?? 30);
  const nextMaxMatches =
    typeof input.maxMatchesPerRun === "number"
      ? Math.floor(input.maxMatchesPerRun)
      : Number(row.max_matches_per_run ?? 25);

  if (!Number.isFinite(nextCooldown) || nextCooldown < 0) {
    throw new OperationsError("Cooldown minutes must be zero or greater.");
  }

  if (!Number.isFinite(nextMaxMatches) || nextMaxMatches < 1) {
    throw new OperationsError("Max matches per run must be at least 1.");
  }

  if (nextName !== String(row.name)) {
    const { data: existing, error: existingError } = await client
      .from("operation_escalation_rules")
      .select("id")
      .eq("created_by_admin_user_id", input.adminUserId)
      .eq("entity_type", String(row.entity_type))
      .ilike("name", nextName)
      .neq("id", input.ruleId)
      .maybeSingle();

    if (existingError) {
      throw new Error(`Failed to validate escalation-rule name: ${existingError.message}`);
    }

    if (existing) {
      throw new OperationsError("You already have an escalation rule with this name.");
    }
  }

  const { error: updateError } = await client
    .from("operation_escalation_rules")
    .update({
      name: nextName,
      filters_json:
        input.filters !== undefined
          ? normalizeSubscriptionFilters(row.entity_type as OperationEntityType, input.filters)
          : row.filters_json,
      escalation_reason: nextReason,
      is_active: typeof input.isActive === "boolean" ? input.isActive : Boolean(row.is_active),
      run_mode: nextRunMode,
      cooldown_minutes: nextCooldown,
      max_matches_per_run: nextMaxMatches,
      next_run_at:
        (typeof input.isActive === "boolean" ? input.isActive : Boolean(row.is_active)) &&
        nextRunMode === "automated"
          ? String(row.next_run_at ?? new Date().toISOString())
          : null
    })
    .eq("id", input.ruleId)
    .eq("created_by_admin_user_id", input.adminUserId);

  if (updateError) {
    throw new Error(`Failed to update escalation rule: ${updateError.message}`);
  }

  await recordOperationAuditEvent({
    entityType: row.entity_type as OperationEntityType,
    entityId: input.ruleId,
    adminUserId: input.adminUserId,
    eventType:
      typeof input.isActive === "boolean" &&
      input.name === undefined &&
      input.filters === undefined &&
      input.escalationReason === undefined &&
      input.runMode === undefined &&
      input.cooldownMinutes === undefined &&
      input.maxMatchesPerRun === undefined
        ? "escalation_rule_toggled"
        : "escalation_rule_updated",
    eventSummary:
      typeof input.isActive === "boolean" &&
      input.name === undefined &&
      input.filters === undefined &&
      input.escalationReason === undefined &&
      input.runMode === undefined &&
      input.cooldownMinutes === undefined &&
      input.maxMatchesPerRun === undefined
        ? "Operator changed escalation-rule active state."
        : "Operator updated an escalation rule."
  });
}

export async function deleteOperationEscalationRule(ruleId: string, adminUserId: string) {
  await assertAdminActor(adminUserId);
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_escalation_rules")
    .select("entity_type")
    .eq("id", ruleId)
    .eq("created_by_admin_user_id", adminUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load escalation rule: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Escalation rule not found.");
  }

  const { error: deleteError } = await client
    .from("operation_escalation_rules")
    .delete()
    .eq("id", ruleId)
    .eq("created_by_admin_user_id", adminUserId);

  if (deleteError) {
    throw new Error(`Failed to delete escalation rule: ${deleteError.message}`);
  }

  await recordOperationAuditEvent({
    entityType: (data as { entity_type: OperationEntityType }).entity_type,
    entityId: ruleId,
    adminUserId,
    eventType: "escalation_rule_deleted",
    eventSummary: "Operator deleted an escalation rule."
  });
}

async function recordOperationEscalationRuleRun(input: {
  ruleId: string;
  triggeredBy: OperationRuleRunTrigger;
  triggeredByAdminUserId: string | null;
  matchedCount: number;
  escalatedCount: number;
  skippedCount: number;
  runStatus: OperationAutomationRunStatus;
  skipReason?: string | null;
  failureReason?: string | null;
  durationMs?: number | null;
  runSummary: string;
}) {
  const client = getOperationsClient();
  const { error } = await client.from("operation_escalation_rule_runs").insert({
    operation_escalation_rule_id: input.ruleId,
    triggered_by: input.triggeredBy,
    triggered_by_admin_user_id: input.triggeredByAdminUserId,
    matched_count: input.matchedCount,
    escalated_count: input.escalatedCount,
    skipped_count: input.skippedCount,
    run_status: input.runStatus,
    skip_reason: input.skipReason ?? null,
    failure_reason: input.failureReason ?? null,
    duration_ms: input.durationMs ?? null,
    run_summary: input.runSummary
  });

  if (error) {
    throw new Error(`Failed to record escalation rule run: ${error.message}`);
  }
}

async function recordOperationSubscriptionDigestRun(input: {
  subscriptionId: string;
  triggeredBy: OperationRuleRunTrigger;
  triggeredByAdminUserId: string | null;
  matchCount: number;
  runStatus: OperationAutomationRunStatus;
  skipReason?: string | null;
  failureReason?: string | null;
  durationMs?: number | null;
  digestSummary: string;
  deliveredVia: OperationDigestDeliveredVia;
}) {
  const client = getOperationsClient();
  const { error } = await client.from("operation_subscription_digest_runs").insert({
    operation_queue_subscription_id: input.subscriptionId,
    triggered_by: input.triggeredBy,
    triggered_by_admin_user_id: input.triggeredByAdminUserId,
    match_count: input.matchCount,
    run_status: input.runStatus,
    skip_reason: input.skipReason ?? null,
    failure_reason: input.failureReason ?? null,
    duration_ms: input.durationMs ?? null,
    digest_summary: input.digestSummary,
    delivered_via: input.deliveredVia
  });

  if (error) {
    throw new Error(`Failed to record subscription digest run: ${error.message}`);
  }
}

export async function applyOperationEscalationRule(input: {
  ruleId: string;
  adminUserId?: string;
  triggeredBy?: OperationRuleRunTrigger;
  bypassCooldown?: boolean;
  overrideAutomationState?: boolean;
}): Promise<
  BulkActionSummary & {
  runStatus: OperationAutomationRunStatus;
  skipReason: string | null;
  failureReason: string | null;
  }
> {
  if ((input.triggeredBy ?? "manual") === "manual") {
    if (!input.adminUserId) {
      throw new OperationsError("Admin access is required to run escalation rules manually.");
    }

    await assertAdminActor(input.adminUserId);
  }

  const client = getOperationsClient();
  const startedAt = Date.now();
  const { data, error } = await client
    .from("operation_escalation_rules")
    .select(
      "id,created_by_admin_user_id,entity_type,name,filters_json,escalation_reason,is_active,is_muted,snoozed_until,muted_or_snoozed_reason,run_mode,last_run_at,next_run_at,cooldown_minutes,max_matches_per_run,consecutive_skip_count,consecutive_failure_count,last_success_at,last_failure_at,last_skip_reason,created_at,updated_at"
    )
    .eq("id", input.ruleId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load escalation rule: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Escalation rule not found.");
  }

  const rule = mapEscalationRuleRow(data as OperationEscalationRuleRow);
  const triggeredBy = input.triggeredBy ?? "manual";
  const actingAdminUserId =
    triggeredBy === "manual" ? input.adminUserId ?? rule.createdByAdminUserId : rule.createdByAdminUserId;
  const durationMs = () => Date.now() - startedAt;

  const finalizeRuleRun = async (outcome: {
    runStatus: OperationAutomationRunStatus;
    matchedCount: number;
    escalatedCount: number;
    skippedCount: number;
    runSummary: string;
    skipReason?: string | null;
    failureReason?: string | null;
    nextRunAt?: string | null;
  }) => {
    const occurredAt = new Date().toISOString();
    const nextRunAt =
      outcome.nextRunAt !== undefined
        ? outcome.nextRunAt
        : rule.runMode === "automated"
          ? getCooldownWindow(occurredAt, rule.cooldownMinutes).nextEligibleAt
          : null;
    const healthUpdate = buildAutomationHealthUpdate(
      {
        consecutiveSkipCount: rule.consecutiveSkipCount,
        consecutiveFailureCount: rule.consecutiveFailureCount,
        lastSuccessAt: rule.lastSuccessAt,
        lastFailureAt: rule.lastFailureAt
      },
      {
        runStatus: outcome.runStatus,
        occurredAt,
        skipReason: outcome.skipReason
      }
    );

    const { error: updateError } = await client
      .from("operation_escalation_rules")
      .update({
        last_run_at: occurredAt,
        next_run_at: nextRunAt,
        ...healthUpdate
      })
      .eq("id", rule.id);

    if (updateError) {
      throw new Error(`Failed to update escalation-rule runtime metadata: ${updateError.message}`);
    }

    await recordOperationEscalationRuleRun({
      ruleId: rule.id,
      triggeredBy,
      triggeredByAdminUserId: triggeredBy === "manual" ? actingAdminUserId : null,
      matchedCount: outcome.matchedCount,
      escalatedCount: outcome.escalatedCount,
      skippedCount: outcome.skippedCount,
      runStatus: outcome.runStatus,
      skipReason: outcome.skipReason,
      failureReason: outcome.failureReason,
      durationMs: durationMs(),
      runSummary: outcome.runSummary
    });

    await recordOperationAuditEvent({
      entityType: rule.entityType,
      entityId: rule.id,
      adminUserId: triggeredBy === "manual" ? actingAdminUserId : null,
      eventType: "escalation_rule_run_recorded",
      eventSummary:
        triggeredBy === "manual"
          ? "Operator ran an escalation rule."
          : "Automation ran an escalation rule.",
      metadata: {
        matchedCount: outcome.matchedCount,
        escalatedCount: outcome.escalatedCount,
        skippedCount: outcome.skippedCount,
        triggeredBy,
        runStatus: outcome.runStatus,
        skipReason: outcome.skipReason ?? null,
        failureReason: outcome.failureReason ?? null
      }
    });
  };

  if (triggeredBy === "manual" && input.adminUserId && input.adminUserId !== rule.createdByAdminUserId) {
    throw new OperationsError("You can only apply escalation rules you created.");
  }

  if (!rule.isActive) {
    throw new OperationsError("Only active escalation rules can be applied.");
  }

  const eligibility = getAutomationEligibility({
    isMuted: rule.isMuted,
    snoozedUntil: rule.snoozedUntil,
    lastRunAt: rule.lastRunAt,
    cooldownMinutes: rule.cooldownMinutes
  });
  const cooldown = getCooldownWindow(rule.lastRunAt, rule.cooldownMinutes);

  if (
    (eligibility.controlState === "muted" || eligibility.controlState === "snoozed") &&
    (triggeredBy === "automation" || !input.overrideAutomationState)
  ) {
    const skipReason = eligibility.skipReason ?? "Automation controls skipped this run.";
    const runSummary = `${rule.name}: ${skipReason} ${rule.matchExplanation}`;
    await finalizeRuleRun({
      runStatus: "skipped",
      matchedCount: 0,
      escalatedCount: 0,
      skippedCount: 0,
      runSummary,
      skipReason,
      nextRunAt: eligibility.nextEligibleAt
    });
    throw new OperationsError(skipReason);
  }

  if (!input.bypassCooldown && !cooldown.eligible) {
    const skipReason = "Cooldown window is still active.";
    await finalizeRuleRun({
      runStatus: "skipped",
      matchedCount: 0,
      escalatedCount: 0,
      skippedCount: 0,
      runSummary: `${rule.name}: ${skipReason} ${rule.matchExplanation}`,
      skipReason,
      nextRunAt: cooldown.nextEligibleAt
    });
    throw new OperationsError(skipReason);
  }

  const matches =
    rule.entityType === "notification_delivery"
      ? await listAdminDeliveries(rule.filters as AdminDeliveryFilters, 200, rule.createdByAdminUserId)
      : await listAdminJobs(rule.filters as AdminJobFilters, 200, rule.createdByAdminUserId);

  if (matches.length === 0) {
    const skipReason = "No matching incidents were found.";
    await finalizeRuleRun({
      runStatus: "skipped",
      matchedCount: 0,
      escalatedCount: 0,
      skippedCount: 0,
      runSummary: `${rule.name}: ${skipReason} ${rule.matchExplanation}`,
      skipReason
    });
    throw new OperationsError(skipReason);
  }

  const limitedMatches = limitMatchesForRun<AdminDeliveryRecord | AdminScheduledJobRecord>(
    matches,
    rule.maxMatchesPerRun
  );
  const summary = createBulkSummary(limitedMatches.length);
  let skippedCount = matches.length - limitedMatches.length;
  let escalatedCount = 0;
  const capReason = buildMaxMatchCapReason(matches.length, limitedMatches.length);

  for (const match of limitedMatches) {
    try {
      if (match.isEscalated) {
        summary.succeeded += 1;
        skippedCount += 1;
        continue;
      }

      await setIncidentEscalation({
        entityType: rule.entityType,
        entityId: match.id,
        adminUserId: actingAdminUserId,
        isEscalated: true,
        escalationReason: rule.escalationReason
      });

      await recordOperationAuditEvent({
        entityType: rule.entityType,
        entityId: match.id,
        adminUserId: actingAdminUserId,
        eventType: "escalation_rule_applied",
        eventSummary: "Operator applied an escalation rule to this incident.",
        metadata: {
          ruleId: rule.id,
          ruleName: rule.name,
          triggeredBy
        }
      });

      summary.succeeded += 1;
      escalatedCount += 1;
    } catch (applyError) {
      summarizeFailure(summary, match.id, applyError);
      skippedCount += 1;
    }
  }

  const failureReason =
    summary.failed > 0
      ? summary.failureMessages.join(" | ")
      : null;
  const runStatus: OperationAutomationRunStatus = summary.failed > 0 ? "failed" : "success";
  const runSummary = `${rule.name}: matched ${matches.length}, escalated ${escalatedCount}, skipped ${skippedCount}. ${rule.matchExplanation}${capReason ? ` ${capReason}` : ""}`;

  await finalizeRuleRun({
    runStatus,
    matchedCount: matches.length,
    escalatedCount,
    skippedCount,
    runSummary,
    skipReason: capReason,
    failureReason
  });

  return {
    ...summary,
    runStatus,
    skipReason: capReason,
    failureReason
  };
}

async function recordAssignmentHistory(input: {
  entityType: OperationEntityType;
  entityId: string;
  previousAdminUserId: string | null;
  newAdminUserId: string | null;
  changedByAdminUserId: string;
  handoffNote?: string | null;
}) {
  const client = getOperationsClient();
  const { error } = await client.from("operation_assignment_history").insert({
    entity_type: input.entityType,
    entity_id: input.entityId,
    previous_admin_user_id: input.previousAdminUserId,
    new_admin_user_id: input.newAdminUserId,
    changed_by_admin_user_id: input.changedByAdminUserId,
    handoff_note: input.handoffNote?.trim() ? input.handoffNote.trim() : null
  });

  if (error) {
    throw new Error(`Failed to record assignment history: ${error.message}`);
  }
}

async function fetchRecentlyHandedOffIds(
  entityType: OperationEntityType,
  days = 7
): Promise<string[]> {
  const client = getOperationsClient();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await client
    .from("operation_assignment_history")
    .select("entity_id")
    .eq("entity_type", entityType)
    .not("previous_admin_user_id", "is", null)
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`Failed to load recent handoff ids: ${error.message}`);
  }

  return [...new Set((((data as Array<{ entity_id: string }> | null) ?? []).map((row) => row.entity_id)))];
}

async function fetchRelatedSession(sessionId: string) {
  const sessionMap = await fetchSessionMap([sessionId]);

  return sessionMap.get(sessionId) ?? null;
}

async function assertReminderTargetStillValid(
  relatedEntityType: string | null,
  relatedEntityId: string | null
) {
  if (relatedEntityType !== "tutor_session" || !relatedEntityId) {
    throw new OperationsError("Reminder replay requires a valid tutor session reference.");
  }

  const session = await fetchRelatedSession(relatedEntityId);

  if (!session) {
    throw new OperationsError("The related tutor session could not be found.");
  }

  if (session.status !== "confirmed") {
    throw new OperationsError("Only confirmed tutor sessions can receive reminders.");
  }

  if (new Date(session.scheduled_ends_at).getTime() <= Date.now()) {
    throw new OperationsError("Completed or expired tutor sessions cannot receive reminders.");
  }
}

async function assertOperationEntityExists(
  entityType: OperationEntityType,
  entityId: string
) {
  const client = getOperationsClient();

  if (entityType === "notification_delivery") {
    const { data, error } = await client
      .from("notification_deliveries")
      .select("id")
      .eq("id", entityId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to validate notification delivery: ${error.message}`);
    }

    if (!data) {
      throw new OperationsError("Notification delivery could not be found.");
    }

    return;
  }

  const { data, error } = await client
    .from("scheduled_jobs")
    .select("id")
    .eq("id", entityId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to validate scheduled job: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Scheduled job could not be found.");
  }
}

async function recordOperationAuditEvent(input: {
  entityType: OperationAuditEntityType;
  entityId: string;
  adminUserId: string | null;
  eventType: OperationAuditEventType;
  eventSummary: string;
  metadata?: Record<string, unknown>;
}) {
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_audit_events")
    .insert({
      entity_type: input.entityType,
      entity_id: input.entityId,
      admin_user_id: input.adminUserId,
      event_type: input.eventType,
      event_summary: input.eventSummary,
      metadata: input.metadata ?? {}
    })
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to record operation audit event: ${error.message}`);
  }

  return (data as { id: string } | null)?.id ?? null;
}

async function createWatcherNotifications(input: {
  entityType: OperationEntityType;
  entityId: string;
  actorAdminUserId: string;
  notificationKind: "comment" | "owner_change" | "workflow_change" | "resolve";
  title: string;
  message: string;
  dedupeScope: string;
  skipAdminUserIds?: string[];
}) {
  const watchers = await listOperationWatchers(input.entityType, input.entityId);
  const skipSet = new Set([input.actorAdminUserId, ...(input.skipAdminUserIds ?? [])]);
  const targets = watchers.filter(
    (watcher) =>
      !skipSet.has(watcher.adminUserId) &&
      shouldNotifyWatcher(
        {
          isMuted: watcher.isMuted,
          notifyOnComment: watcher.notifyOnComment,
          notifyOnOwnerChange: watcher.notifyOnOwnerChange,
          notifyOnWorkflowChange: watcher.notifyOnWorkflowChange,
          notifyOnResolve: watcher.notifyOnResolve
        },
        input.notificationKind
      )
  );

  if (targets.length === 0) {
    return;
  }

  const client = getOperationsClient();
  const linkUrl = getIncidentLink(input.entityType, input.entityId);
  const { error } = await client.from("notifications").insert(
    targets.map((watcher) => ({
      user_id: watcher.adminUserId,
      type: "operation_watch_update",
      title: input.title,
      message: input.message,
      link_url: linkUrl,
      related_entity_type: input.entityType,
      related_entity_id: input.entityId,
      dedupe_key: `ops-watch:${input.dedupeScope}:${watcher.adminUserId}`,
      is_read: false
    }))
  );

  if (error) {
    throw new Error(`Failed to create watcher notifications: ${error.message}`);
  }
}

async function fetchIncidentForSubscriptionMatch(
  entityType: OperationEntityType,
  entityId: string
) {
  const client = getOperationsClient();
  const { data, error } =
    entityType === "notification_delivery"
      ? await client.from("notification_deliveries").select(DELIVERY_SELECT).eq("id", entityId).maybeSingle()
      : await client.from("scheduled_jobs").select(JOB_SELECT).eq("id", entityId).maybeSingle();

  if (error) {
    throw new Error(`Failed to reload incident for subscription matching: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [record] =
    entityType === "notification_delivery"
      ? await enrichDeliveries([data as DeliveryRow])
      : await enrichJobs([data as JobRow]);

  return record;
}

async function createSubscriptionNotifications(input: {
  entityType: OperationEntityType;
  entityId: string;
  actorAdminUserId: string;
  title: string;
  message: string;
  dedupeScope: string;
  recentlyHandedOff?: boolean;
}) {
  const [incident, subscriptions, watchers] = await Promise.all([
    fetchIncidentForSubscriptionMatch(input.entityType, input.entityId),
    getOperationsClient()
      .from("operation_queue_subscriptions")
      .select(
        "id,admin_user_id,entity_type,name,filters_json,is_active,is_muted,snoozed_until,muted_or_snoozed_reason,digest_cooldown_minutes,last_digest_at,last_digest_hash,consecutive_skip_count,consecutive_failure_count,last_success_at,last_failure_at,last_skip_reason,created_at,updated_at"
      )
      .eq("entity_type", input.entityType)
      .eq("is_active", true),
    listOperationWatchers(input.entityType, input.entityId)
  ]);

  if (!incident) {
    return;
  }

  if (subscriptions.error) {
    throw new Error(
      `Failed to load queue subscriptions for notifications: ${subscriptions.error.message}`
    );
  }

  const rows =
    (((subscriptions.data as OperationQueueSubscriptionRow[] | null) ?? []).map((row) =>
      mapQueueSubscriptionRow(row)
    )) ?? [];
  const linkUrl = getIncidentLink(input.entityType, input.entityId);
  const watcherIds = new Set(watchers.map((watcher) => watcher.adminUserId));
  const targets = rows.filter((subscription) => {
    if (subscription.adminUserId === input.actorAdminUserId || !subscription.isActive) {
      return false;
    }

    if (input.entityType === "notification_delivery") {
      return matchesDeliverySubscription(
        incident as AdminDeliveryRecord,
        subscription.filters as AdminDeliveryFilters,
        {
          adminUserId: subscription.adminUserId,
          isWatching: watcherIds.has(subscription.adminUserId),
          recentlyHandedOff: input.recentlyHandedOff ?? false
        }
      );
    }

    return matchesJobSubscription(
      incident as AdminScheduledJobRecord,
      subscription.filters as AdminJobFilters,
      {
        adminUserId: subscription.adminUserId,
        isWatching: watcherIds.has(subscription.adminUserId),
        recentlyHandedOff: input.recentlyHandedOff ?? false
      }
    );
  });

  if (targets.length === 0) {
    return;
  }

  const client = getOperationsClient();
  const { error } = await client.from("notifications").upsert(
    targets.map((subscription) => ({
      user_id: subscription.adminUserId,
      type: "operation_subscription_match",
      title: input.title,
      message: input.message,
      link_url: linkUrl,
      related_entity_type: input.entityType,
      related_entity_id: input.entityId,
      dedupe_key: `ops-sub:${subscription.id}:${input.entityId}:${input.dedupeScope}`,
      is_read: false
    })),
    {
      onConflict: "dedupe_key",
      ignoreDuplicates: true
    }
  );

  if (error) {
    throw new Error(`Failed to create queue-subscription notifications: ${error.message}`);
  }

  await recordOperationAuditEvent({
    entityType: input.entityType,
    entityId: input.entityId,
    adminUserId: input.actorAdminUserId,
    eventType: "subscription_match_notified",
    eventSummary: "Queue-subscription notifications were generated for this incident.",
    metadata: {
      subscriptionCount: targets.length,
      dedupeScope: input.dedupeScope
    }
  });
}

export async function updateOperationEscalationRuleAutomationControl(input: {
  ruleId: string;
  adminUserId: string;
  action: "mute" | "unmute" | "snooze" | "resume";
  snoozedUntil?: string | null;
  reason?: string | null;
}) {
  await assertAdminActor(input.adminUserId);
  if (!["mute", "unmute", "snooze", "resume"].includes(input.action)) {
    throw new OperationsError("Choose a valid escalation-rule automation action.");
  }

  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_escalation_rules")
    .select("id,entity_type,is_muted,snoozed_until,muted_or_snoozed_reason")
    .eq("id", input.ruleId)
    .eq("created_by_admin_user_id", input.adminUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load escalation rule automation state: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Escalation rule not found.");
  }

  const nextReason = normalizeAutomationReason(input.reason);
  const nextSnoozedUntil =
    input.action === "snooze" ? normalizeSnoozedUntil(input.snoozedUntil) : null;
  const update =
    input.action === "mute"
      ? {
          is_muted: true,
          snoozed_until: null,
          muted_or_snoozed_reason: nextReason
        }
      : input.action === "unmute"
        ? {
            is_muted: false,
            muted_or_snoozed_reason: null
          }
        : input.action === "snooze"
          ? {
              is_muted: false,
              snoozed_until: nextSnoozedUntil,
              muted_or_snoozed_reason: nextReason
            }
          : {
              is_muted: false,
              snoozed_until: null,
              muted_or_snoozed_reason: null
            };

  const { error: updateError } = await client
    .from("operation_escalation_rules")
    .update(update)
    .eq("id", input.ruleId)
    .eq("created_by_admin_user_id", input.adminUserId);

  if (updateError) {
    throw new Error(`Failed to update escalation-rule automation control: ${updateError.message}`);
  }

  await recordOperationAuditEvent({
    entityType: data.entity_type as OperationEntityType,
    entityId: input.ruleId,
    adminUserId: input.adminUserId,
    eventType:
      input.action === "mute"
        ? "automation_muted"
        : input.action === "unmute"
          ? "automation_unmuted"
          : input.action === "snooze"
            ? "automation_snoozed"
            : "automation_resumed",
    eventSummary:
      input.action === "mute"
        ? "Operator muted escalation-rule automation."
        : input.action === "unmute"
          ? "Operator unmuted escalation-rule automation."
          : input.action === "snooze"
            ? "Operator snoozed escalation-rule automation."
            : "Operator resumed escalation-rule automation.",
    metadata: {
      snoozedUntil: nextSnoozedUntil,
      reason: nextReason
    }
  });
}

export async function updateOperationAutomationAcknowledgement(input: {
  entityType: OperationAutomationEntityType;
  entityId: string;
  adminUserId: string;
  status: OperationAutomationAcknowledgementStatus;
  note?: string | null;
  assignedAdminUserId?: string | null;
  remindAt?: string | null;
}) {
  await assertAdminActor(input.adminUserId);
  const entity = await fetchAutomationEntitySummary(input.entityType, input.entityId);

  const history = await listAutomationAcknowledgements(input.entityType, [input.entityId]);
  const current = history[0] ?? null;
  const currentStatus = current?.status ?? "unacknowledged";
  canTransitionAutomationAcknowledgementStatus(currentStatus, input.status);

  const note = input.note?.trim() ? input.note.trim() : null;
  const hasExplicitAssignee = Object.prototype.hasOwnProperty.call(input, "assignedAdminUserId");
  const hasExplicitReminder = Object.prototype.hasOwnProperty.call(input, "remindAt");
  const assignedAdminUserId =
    hasExplicitAssignee && input.assignedAdminUserId !== undefined
      ? input.assignedAdminUserId?.trim() || null
      : (current?.assignedAdminUserId ?? null);

  if (assignedAdminUserId) {
    await assertAdminTarget(assignedAdminUserId);
  }

  let remindAt = hasExplicitReminder ? input.remindAt?.trim() || null : (current?.remindAt ?? null);

  if (remindAt) {
    const remindAtDate = new Date(remindAt);

    if (Number.isNaN(remindAtDate.getTime()) || remindAtDate.getTime() <= Date.now()) {
      throw new OperationsError("Reminder time must be a valid future timestamp.");
    }

    remindAt = remindAtDate.toISOString();
  }

  const statusChanged = input.status !== currentStatus;
  const reminderChanged = remindAt !== (current?.remindAt ?? null);
  const reminderFields = computeReminderState({
    current,
    nextStatus: input.status,
    remindAt,
    statusChanged,
    reminderChanged
  });
  const assignedAt =
    assignedAdminUserId && assignedAdminUserId !== current?.assignedAdminUserId
      ? new Date().toISOString()
      : (current?.assignedAt ?? null);
  const verificationStatus =
    input.status === "resolved"
      ? "completed"
      : (current?.verificationStatus ?? "not_started");
  const verificationCompletedAt =
    input.status === "resolved"
      ? (current?.verificationCompletedAt ?? new Date().toISOString())
      : (current?.verificationCompletedAt ?? null);
  const verificationCompletedByAdminUserId =
    input.status === "resolved"
      ? (current?.verificationCompletedByAdminUserId ?? input.adminUserId)
      : (current?.verificationCompletedByAdminUserId ?? null);
  const verificationSummary =
    input.status === "resolved"
      ? "Operator marked the automation workflow resolved after verification review."
      : (current?.verificationSummary ?? null);

  const acknowledgementId = await insertAutomationAcknowledgementSnapshot({
    entityType: input.entityType,
    entityId: input.entityId,
    adminUserId: input.adminUserId,
    status: input.status,
    note,
    assignedAdminUserId,
    assignedAt,
    remindAt,
    reminderState: reminderFields.reminderState,
    lastRemindedAt: current?.lastRemindedAt ?? null,
    reminderDismissedAt: reminderFields.reminderDismissedAt,
    reminderSnoozedUntil: reminderFields.reminderSnoozedUntil,
    reminderSnoozeReason: reminderFields.reminderSnoozeReason,
    reminderLastAction: reminderFields.reminderLastAction,
    rerunOutcome: current?.rerunOutcome ?? null,
    lastRerunAt: current?.lastRerunAt ?? null,
    verificationState:
      input.status === "resolved" ? "verified" : (current?.verificationState ?? "not_ready"),
    verificationSummary,
    verificationStatus,
    verificationCompletedAt,
    verificationCompletedByAdminUserId,
    verificationNotes: current?.verificationNotes ?? null
  });

  await recordOperationAuditEvent({
    entityType: input.entityType,
    entityId: input.entityId,
    adminUserId: input.adminUserId,
    eventType: "automation_acknowledgement_updated",
    eventSummary: `Automation acknowledgement moved from ${currentStatus} to ${input.status}.`,
    metadata: {
      previousStatus: currentStatus,
      nextStatus: input.status,
      note,
      previousAssignedAdminUserId: current?.assignedAdminUserId ?? null,
      nextAssignedAdminUserId: assignedAdminUserId,
      remindAt,
      reminderLastAction: reminderFields.reminderLastAction
    }
  });

  if (assignedAdminUserId && assignedAdminUserId !== current?.assignedAdminUserId) {
    await insertOperationsNotification({
      userId: assignedAdminUserId,
      type: "automation_acknowledgement_assignment",
      title: `${entity.name} needs your follow-up`,
      message:
        input.status === "resolved"
          ? `${entity.name} was assigned to you, but the workflow is already resolved. Review only if more follow-up is expected.`
          : `${entity.name} is now assigned to you for ${input.status.replaceAll("_", " ")} follow-up.`,
      linkUrl: getAutomationEntityLink(input.entityType, input.entityId),
      relatedEntityType: input.entityType,
      relatedEntityId: input.entityId,
      dedupeKey: `ops-ack-assignment:${input.entityType}:${input.entityId}:${acknowledgementId ?? "latest"}`
    });
  }

  return acknowledgementId;
}

export async function recordOperationAutomationRerunOutcome(input: {
  entityType: OperationAutomationEntityType;
  entityId: string;
  adminUserId: string;
  outcome: OperationAutomationRunStatus;
  summary: string;
}) {
  await assertAdminActor(input.adminUserId);
  const history = await listAutomationAcknowledgements(input.entityType, [input.entityId]);
  const current = history[0] ?? null;

  if (!current) {
    return null;
  }

  const playbooks = buildRemediationPlaybooks(
    {
      automationState:
        current.status === "resolved" ? "active" : current.status === "fixed_pending_rerun" ? "active" : "active",
      healthStatus: "warning",
      currentMatchCount: 0,
      consecutiveSkipCount: 0,
      consecutiveFailureCount: 0
    },
    []
  );
  const verificationGuidance = buildPostRerunVerificationGuidance({
    acknowledgement: current,
    outcome: input.outcome,
    playbooks,
    currentMatchCount: 0,
    automationState: "active",
    lastSkipReason: null,
    lastFailureAt: null
  });
  const nowIso = new Date().toISOString();
  const acknowledgementId = await insertAutomationAcknowledgementSnapshot({
    entityType: input.entityType,
    entityId: input.entityId,
    adminUserId: input.adminUserId,
    status: current.status,
    note: current.note,
    assignedAdminUserId: current.assignedAdminUserId,
    assignedAt: current.assignedAt,
    remindAt: current.remindAt,
    reminderState: current.remindAt ? "scheduled" : "dismissed",
    lastRemindedAt: current.lastRemindedAt,
    reminderDismissedAt: current.reminderDismissedAt,
    reminderSnoozedUntil: null,
    reminderSnoozeReason: null,
    reminderLastAction: current.remindAt ? "rescheduled" : "dismissed",
    rerunOutcome: input.outcome,
    lastRerunAt: nowIso,
    verificationState: input.outcome === "success" ? "needs_review" : "not_ready",
    verificationSummary: verificationGuidance?.summary ?? input.summary,
    verificationStatus: input.outcome === "success" ? "pending" : "not_started",
    verificationCompletedAt: null,
    verificationCompletedByAdminUserId: null,
    verificationNotes: null
  });

  await recordOperationAuditEvent({
    entityType: input.entityType,
    entityId: input.entityId,
    adminUserId: input.adminUserId,
    eventType: "automation_rerun_recorded",
    eventSummary: `Manual rerun recorded a ${input.outcome} outcome for this automation.`,
    metadata: {
      outcome: input.outcome,
      summary: input.summary,
      verificationSummary: verificationGuidance?.summary ?? null
    }
  });

  return acknowledgementId;
}

export async function updateOperationAutomationReminderLifecycle(input: {
  entityType: OperationAutomationEntityType;
  entityId: string;
  adminUserId: string;
  action: "dismiss" | "snooze" | "reschedule";
  remindAt?: string | null;
  snoozedUntil?: string | null;
  reason?: string | null;
}) {
  await assertAdminActor(input.adminUserId);
  const history = await listAutomationAcknowledgements(input.entityType, [input.entityId]);
  const current = history[0] ?? null;

  if (!current) {
    throw new OperationsError("Create an acknowledgement before managing reminder lifecycle.");
  }

  if (current.status === "resolved") {
    throw new OperationsError("Resolved automation does not need reminder lifecycle changes.");
  }

  const nowIso = new Date().toISOString();
  const reason = input.reason?.trim() || null;
  let remindAt = current.remindAt;
  let reminderState: OperationAutomationReminderState = current.reminderState;
  let reminderDismissedAt = current.reminderDismissedAt;
  let reminderSnoozedUntil = current.reminderSnoozedUntil;
  let reminderSnoozeReason = current.reminderSnoozeReason;
  let reminderLastAction: OperationAutomationReminderLastAction = current.reminderLastAction;

  if (input.action === "dismiss") {
    reminderState = "dismissed";
    reminderDismissedAt = nowIso;
    reminderSnoozedUntil = null;
    reminderSnoozeReason = null;
    reminderLastAction = "dismissed";
  }

  if (input.action === "snooze") {
    const rawSnooze = input.snoozedUntil?.trim() || "";
    const snoozeDate = new Date(rawSnooze);

    if (!rawSnooze || Number.isNaN(snoozeDate.getTime()) || snoozeDate.getTime() <= Date.now()) {
      throw new OperationsError("Snooze time must be a valid future timestamp.");
    }

    reminderState = current.remindAt ? "scheduled" : current.reminderState;
    reminderDismissedAt = null;
    reminderSnoozedUntil = snoozeDate.toISOString();
    reminderSnoozeReason = reason;
    reminderLastAction = "snoozed";
  }

  if (input.action === "reschedule") {
    const rawRemindAt = input.remindAt?.trim() || "";
    const remindDate = new Date(rawRemindAt);

    if (!rawRemindAt || Number.isNaN(remindDate.getTime()) || remindDate.getTime() <= Date.now()) {
      throw new OperationsError("Rescheduled reminder must be a valid future timestamp.");
    }

    remindAt = remindDate.toISOString();
    reminderState = "scheduled";
    reminderDismissedAt = null;
    reminderSnoozedUntil = null;
    reminderSnoozeReason = reason;
    reminderLastAction = "rescheduled";
  }

  const acknowledgementId = await insertAutomationAcknowledgementSnapshot({
    entityType: input.entityType,
    entityId: input.entityId,
    adminUserId: input.adminUserId,
    status: current.status,
    note: current.note,
    assignedAdminUserId: current.assignedAdminUserId,
    assignedAt: current.assignedAt,
    remindAt,
    reminderState,
    lastRemindedAt: current.lastRemindedAt,
    reminderDismissedAt,
    reminderSnoozedUntil,
    reminderSnoozeReason,
    reminderLastAction,
    rerunOutcome: current.rerunOutcome,
    lastRerunAt: current.lastRerunAt,
    verificationState: current.verificationState,
    verificationSummary: current.verificationSummary,
    verificationStatus: current.verificationStatus,
    verificationCompletedAt: current.verificationCompletedAt,
    verificationCompletedByAdminUserId: current.verificationCompletedByAdminUserId,
    verificationNotes: current.verificationNotes
  });

  await recordOperationAuditEvent({
    entityType: input.entityType,
    entityId: input.entityId,
    adminUserId: input.adminUserId,
    eventType: "automation_acknowledgement_updated",
    eventSummary:
      input.action === "dismiss"
        ? "Operator dismissed the acknowledgement reminder."
        : input.action === "snooze"
          ? "Operator snoozed the acknowledgement reminder."
          : "Operator rescheduled the acknowledgement reminder.",
    metadata: {
      action: input.action,
      remindAt,
      reminderSnoozedUntil,
      reminderLastAction,
      reason
    }
  });

  return acknowledgementId;
}

export async function updateOperationAutomationVerification(input: {
  entityType: OperationAutomationEntityType;
  entityId: string;
  adminUserId: string;
  verificationStatus: OperationAutomationVerificationStatus;
  verificationNotes?: string | null;
}) {
  await assertAdminActor(input.adminUserId);
  const history = await listAutomationAcknowledgements(input.entityType, [input.entityId]);
  const current = history[0] ?? null;

  if (!current) {
    throw new OperationsError("Create an acknowledgement before updating verification.");
  }

  canTransitionAutomationVerificationStatus(
    current.verificationStatus ?? "not_started",
    input.verificationStatus
  );

  const verificationNotes = input.verificationNotes?.trim() || null;
  const nowIso = new Date().toISOString();
  const nextStatus =
    input.verificationStatus === "failed" && current.status === "fixed_pending_rerun"
      ? "investigating"
      : current.status;

  const acknowledgementId = await insertAutomationAcknowledgementSnapshot({
    entityType: input.entityType,
    entityId: input.entityId,
    adminUserId: input.adminUserId,
    status: nextStatus,
    note: current.note,
    assignedAdminUserId: current.assignedAdminUserId,
    assignedAt: current.assignedAt,
    remindAt: current.remindAt,
    reminderState: current.reminderState,
    lastRemindedAt: current.lastRemindedAt,
    reminderDismissedAt: current.reminderDismissedAt,
    reminderSnoozedUntil: current.reminderSnoozedUntil,
    reminderSnoozeReason: current.reminderSnoozeReason,
    reminderLastAction: current.reminderLastAction,
    rerunOutcome: current.rerunOutcome,
    lastRerunAt: current.lastRerunAt,
    verificationState:
      input.verificationStatus === "completed"
        ? "verified"
        : input.verificationStatus === "pending"
          ? "needs_review"
          : "not_ready",
    verificationSummary:
      input.verificationStatus === "completed"
        ? "Verification was completed successfully after rerun review."
        : input.verificationStatus === "failed"
          ? "Verification failed. The automation still needs remediation."
          : current.verificationSummary,
    verificationStatus: input.verificationStatus,
    verificationCompletedAt: input.verificationStatus === "completed" ? nowIso : null,
    verificationCompletedByAdminUserId:
      input.verificationStatus === "completed" ? input.adminUserId : null,
    verificationNotes
  });

  await recordOperationAuditEvent({
    entityType: input.entityType,
    entityId: input.entityId,
    adminUserId: input.adminUserId,
    eventType: "automation_verification_updated",
    eventSummary:
      input.verificationStatus === "completed"
        ? "Operator completed post-rerun verification."
        : input.verificationStatus === "failed"
          ? "Operator marked post-rerun verification as failed."
          : "Operator updated post-rerun verification status.",
    metadata: {
      previousVerificationStatus: current.verificationStatus,
      nextVerificationStatus: input.verificationStatus,
      verificationNotes
    }
  });

  return acknowledgementId;
}

export async function processOperationAutomationAcknowledgementReminders(limit = 25) {
  const client = getOperationsClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await client
    .from("operation_automation_acknowledgements")
    .select(
      "id,entity_type,entity_id,admin_user_id,status,note,assigned_admin_user_id,assigned_at,remind_at,reminder_state,last_reminded_at,reminder_dismissed_at,reminder_snoozed_until,reminder_snooze_reason,reminder_last_action,rerun_outcome,last_rerun_at,verification_state,verification_summary,verification_status,verification_completed_at,verification_completed_by_admin_user_id,verification_notes,created_at,updated_at"
    )
    .eq("reminder_state", "scheduled")
    .lte("remind_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  if (error) {
    throw new Error(`Failed to load due automation reminders: ${error.message}`);
  }

  const rows = (data as OperationAutomationAcknowledgementRow[] | null) ?? [];
  const labelMap = await fetchAdminUserLabelMap(
    rows.flatMap((row) => [
      row.admin_user_id,
      row.assigned_admin_user_id,
      row.verification_completed_by_admin_user_id
    ])
  );
  const mapped = rows.map((row) => mapAutomationAcknowledgementRow(row, labelMap));
  const latest = getLatestAcknowledgements(mapped);
  const due = mapped
    .filter((entry) => latest.get(entry.entityId)?.id === entry.id)
    .filter((entry) => entry.status !== "resolved")
    .filter((entry) => !isReminderSnoozed(entry))
    .slice(0, limit);

  let reminded = 0;
  const messages: string[] = [];

  for (const acknowledgement of due) {
    const entity = await fetchAutomationEntitySummary(
      acknowledgement.entityType,
      acknowledgement.entityId
    );
    const targetUserId = acknowledgement.assignedAdminUserId ?? acknowledgement.adminUserId;
    const notificationType =
      acknowledgement.verificationStatus === "pending"
        ? "automation_verification_needed"
        : acknowledgement.isOverdue
          ? "automation_acknowledgement_overdue"
          : "automation_acknowledgement_reminder";
    const notificationTitle =
      notificationType === "automation_verification_needed"
        ? `${entity.name} needs verification review`
        : notificationType === "automation_acknowledgement_overdue"
          ? `${entity.name} follow-up is overdue`
          : `${entity.name} still needs follow-up`;
    const notificationMessage =
      notificationType === "automation_verification_needed"
        ? `${entity.name} reran successfully and now needs explicit verification review before closure.`
        : notificationType === "automation_acknowledgement_overdue"
          ? `${entity.name} is assigned and overdue for follow-up. Review or reschedule the reminder.`
          : `${entity.name} is still ${acknowledgement.status.replaceAll("_", " ")} and waiting for remediation follow-up.`;

    await insertOperationsNotification({
      userId: targetUserId,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      linkUrl: getAutomationEntityLink(acknowledgement.entityType, acknowledgement.entityId),
      relatedEntityType: acknowledgement.entityType,
      relatedEntityId: acknowledgement.entityId,
      dedupeKey: `ops-ack-reminder:${acknowledgement.entityType}:${acknowledgement.entityId}:${acknowledgement.id}`
    });

    await insertAutomationAcknowledgementSnapshot({
      entityType: acknowledgement.entityType,
      entityId: acknowledgement.entityId,
      adminUserId: acknowledgement.adminUserId,
      status: acknowledgement.status,
      note: acknowledgement.note,
      assignedAdminUserId: acknowledgement.assignedAdminUserId,
      assignedAt: acknowledgement.assignedAt,
      remindAt: acknowledgement.remindAt,
      reminderState: "sent",
      lastRemindedAt: nowIso,
      reminderDismissedAt: acknowledgement.reminderDismissedAt,
      reminderSnoozedUntil: acknowledgement.reminderSnoozedUntil,
      reminderSnoozeReason: acknowledgement.reminderSnoozeReason,
      reminderLastAction: "sent",
      rerunOutcome: acknowledgement.rerunOutcome,
      lastRerunAt: acknowledgement.lastRerunAt,
      verificationState: acknowledgement.verificationState,
      verificationSummary: acknowledgement.verificationSummary,
      verificationStatus: acknowledgement.verificationStatus,
      verificationCompletedAt: acknowledgement.verificationCompletedAt,
      verificationCompletedByAdminUserId: acknowledgement.verificationCompletedByAdminUserId,
      verificationNotes: acknowledgement.verificationNotes
    });

    await recordOperationAuditEvent({
      entityType: acknowledgement.entityType,
      entityId: acknowledgement.entityId,
      adminUserId: null,
      eventType: "automation_acknowledgement_updated",
      eventSummary:
        notificationType === "automation_verification_needed"
          ? "Automation verification reminder was sent."
          : notificationType === "automation_acknowledgement_overdue"
            ? "Automation follow-up became overdue and triggered a reminder."
            : "Automation acknowledgement reminder was sent.",
      metadata: {
        reminderTargetUserId: targetUserId,
        reminderState: "sent",
        notificationType
      }
    });

    reminded += 1;
    messages.push(`${acknowledgement.entityType}:${acknowledgement.entityId}`);
  }

  return {
    totalSelected: due.length,
    reminded,
    skipped: rows.length - due.length,
    messages
  };
}

export async function generateOperationSubscriptionDigest(input: {
  subscriptionId: string;
  adminUserId?: string;
  triggeredBy?: "manual" | "automation";
  bypassCooldown?: boolean;
  overrideAutomationState?: boolean;
}): Promise<{
  subscriptionId: string;
  matchCount: number;
  digestSummary: string;
  runStatus: OperationAutomationRunStatus;
  skipReason: string | null;
  failureReason: string | null;
}> {
  if ((input.triggeredBy ?? "manual") === "manual") {
    if (!input.adminUserId) {
      throw new OperationsError("Admin access is required to generate subscription digests manually.");
    }

    await assertAdminActor(input.adminUserId);
  }

  const client = getOperationsClient();
  const startedAt = Date.now();
  const { data, error } = await client
    .from("operation_queue_subscriptions")
    .select(
      "id,admin_user_id,entity_type,name,filters_json,is_active,is_muted,snoozed_until,muted_or_snoozed_reason,digest_cooldown_minutes,last_digest_at,last_digest_hash,consecutive_skip_count,consecutive_failure_count,last_success_at,last_failure_at,last_skip_reason,created_at,updated_at"
    )
    .eq("id", input.subscriptionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load queue subscription: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Queue subscription not found.");
  }

  const subscription = mapQueueSubscriptionRow(data as OperationQueueSubscriptionRow);
  const triggeredBy = input.triggeredBy ?? "manual";
  const actingAdminUserId =
    triggeredBy === "manual" ? input.adminUserId ?? subscription.adminUserId : subscription.adminUserId;
  const durationMs = () => Date.now() - startedAt;

  const finalizeDigestRun = async (outcome: {
    runStatus: OperationAutomationRunStatus;
    matchCount: number;
    digestSummary: string;
    skipReason?: string | null;
    failureReason?: string | null;
  }) => {
    const occurredAt = new Date().toISOString();
    const healthUpdate = buildAutomationHealthUpdate(
      {
        consecutiveSkipCount: subscription.consecutiveSkipCount,
        consecutiveFailureCount: subscription.consecutiveFailureCount,
        lastSuccessAt: subscription.lastSuccessAt,
        lastFailureAt: subscription.lastFailureAt
      },
      {
        runStatus: outcome.runStatus,
        occurredAt,
        skipReason: outcome.skipReason
      }
    );

    const { error: updateError } = await client
      .from("operation_queue_subscriptions")
      .update({
        ...healthUpdate
      })
      .eq("id", subscription.id)
      .eq("admin_user_id", subscription.adminUserId);

    if (updateError) {
      throw new Error(`Failed to update queue-subscription digest metadata: ${updateError.message}`);
    }

    await recordOperationSubscriptionDigestRun({
      subscriptionId: subscription.id,
      triggeredBy,
      triggeredByAdminUserId: triggeredBy === "manual" ? actingAdminUserId : null,
      matchCount: outcome.matchCount,
      runStatus: outcome.runStatus,
      skipReason: outcome.skipReason,
      failureReason: outcome.failureReason,
      durationMs: durationMs(),
      digestSummary: outcome.digestSummary,
      deliveredVia: "in_app"
    });

    await recordOperationAuditEvent({
      entityType: subscription.entityType,
      entityId: subscription.id,
      adminUserId: triggeredBy === "manual" ? actingAdminUserId : null,
      eventType: "subscription_digest_generated",
      eventSummary:
        triggeredBy === "automation"
          ? "Automation generated a queue subscription digest."
          : "Operator generated a queue subscription digest.",
      metadata: {
        matchCount: outcome.matchCount,
        runStatus: outcome.runStatus,
        skipReason: outcome.skipReason ?? null,
        failureReason: outcome.failureReason ?? null
      }
    });
  };

  if (input.adminUserId && input.adminUserId !== subscription.adminUserId) {
    throw new OperationsError("You can only generate digests for your own subscriptions.");
  }

  if (!subscription.isActive) {
    throw new OperationsError("Only active subscriptions can generate digests.");
  }

  const eligibility = getAutomationEligibility({
    isMuted: subscription.isMuted,
    snoozedUntil: subscription.snoozedUntil,
    lastRunAt: subscription.lastDigestAt,
    cooldownMinutes: subscription.digestCooldownMinutes
  });
  const cooldown = getCooldownWindow(
    subscription.lastDigestAt,
    subscription.digestCooldownMinutes
  );

  if (
    (eligibility.controlState === "muted" || eligibility.controlState === "snoozed") &&
    (triggeredBy === "automation" || !input.overrideAutomationState)
  ) {
    const skipReason = eligibility.skipReason ?? "Automation controls skipped this digest.";
    const digestSummary = `${subscription.name}: ${skipReason} ${subscription.matchExplanation}`;
    await finalizeDigestRun({
      runStatus: "skipped",
      matchCount: 0,
      digestSummary,
      skipReason
    });
    throw new OperationsError(skipReason);
  }

  if (!input.bypassCooldown && !cooldown.eligible) {
    const skipReason = "Cooldown window is still active.";
    await finalizeDigestRun({
      runStatus: "skipped",
      matchCount: 0,
      digestSummary: `${subscription.name}: ${skipReason} ${subscription.matchExplanation}`,
      skipReason
    });
    throw new OperationsError(skipReason);
  }

  const matches =
    subscription.entityType === "notification_delivery"
      ? await listAdminDeliveries(
          subscription.filters as AdminDeliveryFilters,
          100,
          subscription.adminUserId
        )
      : await listAdminJobs(subscription.filters as AdminJobFilters, 100, subscription.adminUserId);

  if (matches.length === 0) {
    const skipReason = "No active queue matches exist for this subscription.";
    await finalizeDigestRun({
      runStatus: "skipped",
      matchCount: 0,
      digestSummary: `${subscription.name}: ${skipReason} ${subscription.matchExplanation}`,
      skipReason
    });
    throw new OperationsError(skipReason);
  }

  const digestHash = buildDigestFingerprint(subscription.entityType, matches);

  if (
    triggeredBy === "automation" &&
    subscription.lastDigestHash &&
    subscription.lastDigestHash === digestHash
  ) {
    const skipReason = "No meaningful changes since the previous digest.";
    await finalizeDigestRun({
      runStatus: "skipped",
      matchCount: matches.length,
      digestSummary: `${subscription.name}: ${skipReason} ${subscription.matchExplanation}`,
      skipReason
    });
    throw new OperationsError(skipReason);
  }

  const digestSummary = buildDigestSummary(
    subscription.entityType,
    subscription.name,
    subscription.matchExplanation,
    matches
  );
  const { error: updateError } = await client
    .from("operation_queue_subscriptions")
    .update({
      last_digest_at: new Date().toISOString(),
      last_digest_hash: digestHash
    })
    .eq("id", subscription.id)
    .eq("admin_user_id", subscription.adminUserId);

  if (updateError) {
    throw new Error(`Failed to update queue-subscription digest metadata: ${updateError.message}`);
  }

  const { error: notificationError } = await client.from("notifications").upsert(
    {
      user_id: subscription.adminUserId,
      type: "operation_subscription_match",
      title: `${subscription.name} digest ready`,
      message: digestSummary,
      link_url: getQueueLink(subscription.entityType, subscription.filters),
      related_entity_type: subscription.entityType,
      related_entity_id: subscription.id,
      dedupe_key: `ops-digest:${subscription.id}:${digestHash}`,
      is_read: false
    },
    {
      onConflict: "dedupe_key",
      ignoreDuplicates: true
    }
  );

  if (notificationError) {
    throw new Error(`Failed to create subscription digest notification: ${notificationError.message}`);
  }

  await finalizeDigestRun({
    runStatus: "success",
    matchCount: matches.length,
    digestSummary,
    failureReason: null
  });

  return {
    subscriptionId: subscription.id,
    matchCount: matches.length,
    digestSummary,
    runStatus: "success" as const,
    skipReason: null,
    failureReason: null
  };
}

export async function processOperationEscalationRulesAutomation(limit = 25) {
  const client = getOperationsClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await client
    .from("operation_escalation_rules")
    .select(
      "id,created_by_admin_user_id,entity_type,name,filters_json,escalation_reason,is_active,is_muted,snoozed_until,muted_or_snoozed_reason,run_mode,last_run_at,next_run_at,cooldown_minutes,max_matches_per_run,consecutive_skip_count,consecutive_failure_count,last_success_at,last_failure_at,last_skip_reason,created_at,updated_at"
    )
    .eq("is_active", true)
    .eq("run_mode", "automated")
    .or(`next_run_at.is.null,next_run_at.lte.${nowIso}`)
    .order("next_run_at", { ascending: true, nullsFirst: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load automated escalation rules: ${error.message}`);
  }

  const rules = (data as OperationEscalationRuleRow[] | null) ?? [];
  const summary = {
    totalSelected: rules.length,
    succeeded: 0,
    skipped: 0,
    failed: 0,
    failureMessages: [] as string[],
    skipMessages: [] as string[]
  };

  for (const rule of rules) {
    try {
      const result = await applyOperationEscalationRule({
        ruleId: rule.id,
        triggeredBy: "automation"
      });

      if (result.runStatus === "skipped") {
        summary.skipped += 1;

        if (result.skipReason) {
          summary.skipMessages.push(`${rule.id}: ${result.skipReason}`);
        }
      } else if (result.runStatus === "failed") {
        summary.failed += 1;

        if (result.failureReason) {
          summary.failureMessages.push(`${rule.id}: ${result.failureReason}`);
        }
      } else {
        summary.succeeded += 1;
      }
    } catch (automationError) {
      const message =
        automationError instanceof Error ? automationError.message : "Unknown rule automation error.";

      if (/Muted by operator|Snoozed until|Cooldown window is still active|No matching incidents/i.test(message)) {
        summary.skipped += 1;
        summary.skipMessages.push(`${rule.id}: ${message}`);
      } else {
        summarizeFailure(summary, rule.id, automationError);
      }
    }
  }

  return summary;
}

export async function processOperationSubscriptionDigestsAutomation(limit = 25) {
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_queue_subscriptions")
    .select(
      "id,admin_user_id,entity_type,name,filters_json,is_active,is_muted,snoozed_until,muted_or_snoozed_reason,digest_cooldown_minutes,last_digest_at,last_digest_hash,consecutive_skip_count,consecutive_failure_count,last_success_at,last_failure_at,last_skip_reason,created_at,updated_at"
    )
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load queue subscriptions for digest automation: ${error.message}`);
  }

  const subscriptions = (data as OperationQueueSubscriptionRow[] | null) ?? [];
  const summary = {
    totalSelected: subscriptions.length,
    succeeded: 0,
    skipped: 0,
    failed: 0,
    failureMessages: [] as string[],
    skipMessages: [] as string[]
  };

  for (const subscription of subscriptions) {
    try {
      const result = await generateOperationSubscriptionDigest({
        subscriptionId: subscription.id,
        triggeredBy: "automation"
      });

      if (result.runStatus === "skipped") {
        summary.skipped += 1;

        if (result.skipReason) {
          summary.skipMessages.push(`${subscription.id}: ${result.skipReason}`);
        }
      } else if (result.runStatus === "failed") {
        summary.failed += 1;

        if (result.failureReason) {
          summary.failureMessages.push(`${subscription.id}: ${result.failureReason}`);
        }
      } else {
        summary.succeeded += 1;
      }
    } catch (automationError) {
      const message =
        automationError instanceof Error
          ? automationError.message
          : "Unknown digest automation error.";

      if (/Muted by operator|Snoozed until|Cooldown window is still active|No active queue matches|No meaningful changes/i.test(message)) {
        summary.skipped += 1;
        summary.skipMessages.push(`${subscription.id}: ${message}`);
      } else {
        summarizeFailure(summary, subscription.id, automationError);
      }
    }
  }

  return summary;
}

type OperationAuditContext = {
  bulkAction?: {
    action: string;
    batchId: string;
    totalSelected: number;
  };
};

type OwnershipAuditContext = OperationAuditContext & {
  explicitOverwrite?: boolean;
};

async function fetchRecentOperationAuditEvents(limit = 8) {
  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_audit_events")
    .select(
      "id,entity_type,entity_id,admin_user_id,event_type,event_summary,metadata,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load recent operator actions: ${error.message}`);
  }

  const rows = (data as OperationAuditEventRow[] | null) ?? [];
  const labelMap = await fetchAdminUserLabelMap(rows.map((row) => row.admin_user_id));

  return rows.map((row) => mapOperationAuditEvent(row, labelMap));
}

function normalizeOwnerExpectation(value?: string | null) {
  return value?.trim() ? value.trim() : null;
}

async function readIncidentOwnershipState(entityType: OperationEntityType, entityId: string) {
  const client = getOperationsClient();
  const { data, error } =
    entityType === "notification_delivery"
      ? await client
          .from("notification_deliveries")
          .select(DELIVERY_SELECT)
          .eq("id", entityId)
          .maybeSingle()
      : await client
          .from("scheduled_jobs")
          .select(JOB_SELECT)
          .eq("id", entityId)
          .maybeSingle();

  if (error) {
    throw new Error(`Failed to load incident ownership state: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Incident could not be found.");
  }

  return data as DeliveryRow | JobRow;
}

async function fetchTopFailureCategories(limit = 6): Promise<AdminFailureCategory[]> {
  const client = getOperationsClient();
  const [deliveryResult, jobResult] = await Promise.all([
    client.from("notification_deliveries").select("template_key").eq("status", "failed").limit(200),
    client.from("scheduled_jobs").select("job_type").eq("status", "failed").limit(200)
  ]);

  if (deliveryResult.error) {
    throw new Error(`Failed to load failed delivery categories: ${deliveryResult.error.message}`);
  }

  if (jobResult.error) {
    throw new Error(`Failed to load failed job categories: ${jobResult.error.message}`);
  }

  const counts = new Map<string, AdminFailureCategory>();

  for (const row of ((deliveryResult.data as Array<{ template_key: string }> | null) ?? [])) {
    const key = `notification_delivery:${row.template_key}`;
    const current = counts.get(key);

    counts.set(key, {
      entityType: "notification_delivery",
      label: row.template_key,
      count: (current?.count ?? 0) + 1
    });
  }

  for (const row of ((jobResult.data as Array<{ job_type: string }> | null) ?? [])) {
    const key = `scheduled_job:${row.job_type}`;
    const current = counts.get(key);

    counts.set(key, {
      entityType: "scheduled_job",
      label: row.job_type,
      count: (current?.count ?? 0) + 1
    });
  }

  return [...counts.values()].sort((left, right) => right.count - left.count).slice(0, limit);
}

export async function fetchAdminOperationsSnapshot(
  adminUserId?: string
): Promise<AdminOperationsSnapshot> {
  if (adminUserId) {
    await assertAdminActor(adminUserId);
  }

  try {
    const cutoff = new Date(Date.now() - STALE_QUEUE_MINUTES * 60 * 1000).toISOString();
    const resolvedTodayCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [
      pendingDeliveries,
      failedDeliveries,
      sentDeliveries,
      ignoredDeliveries,
      pendingJobs,
      failedJobs,
      processedJobs,
      canceledJobs,
      failedDeliveriesNeedingAttention,
      failedJobsNeedingAttention,
      stalePendingDeliveriesByNextAttempt,
      stalePendingDeliveriesByCreatedAt,
      stalePendingJobs,
      assignedDeliveriesToMe,
      assignedJobsToMe,
      unassignedAttentionDeliveries,
      unassignedAttentionJobs,
      unassignedStaleDeliveriesByNextAttempt,
      unassignedStaleDeliveriesByCreatedAt,
      unassignedStaleJobs,
      investigatingDeliveries,
      waitingDeliveries,
      resolvedDeliveries,
      investigatingJobs,
      waitingJobs,
      resolvedJobs,
      resolvedTodayDeliveries,
      resolvedTodayJobs,
      recentlyHandedOff,
      recentComments,
      watchedIncidents,
      mutedWatchedIncidents,
      watchedUnresolvedDeliveries,
      watchedUnresolvedJobs,
      activeSubscriptions,
      activeEscalationRules,
      escalatedDeliveries,
      escalatedJobs,
      unassignedEscalatedDeliveries,
      unassignedEscalatedJobs,
      watchedByTeamIncidents
    ] = await Promise.all([
      countTableRows("notification_deliveries", (query) => query.eq("status", "pending")),
      countTableRows("notification_deliveries", (query) => query.eq("status", "failed")),
      countTableRows("notification_deliveries", (query) => query.eq("status", "sent")),
      countTableRows("notification_deliveries", (query) => query.eq("status", "ignored")),
      countTableRows("scheduled_jobs", (query) => query.eq("status", "pending")),
      countTableRows("scheduled_jobs", (query) => query.eq("status", "failed")),
      countTableRows("scheduled_jobs", (query) => query.eq("status", "processed")),
      countTableRows("scheduled_jobs", (query) => query.eq("status", "canceled")),
      countTableRows("notification_deliveries", (query) =>
        query.eq("status", "failed").gte("retry_count", 2)
      ),
      countTableRows("scheduled_jobs", (query) =>
        query.eq("status", "failed").gte("retry_count", 2)
      ),
      countTableRows("notification_deliveries", (query) =>
        query.eq("status", "pending").lte("next_attempt_at", cutoff)
      ),
      countTableRows("notification_deliveries", (query) =>
        query.eq("status", "pending").is("next_attempt_at", null).lte("created_at", cutoff)
      ),
      countTableRows("scheduled_jobs", (query) =>
        query.eq("status", "pending").lte("scheduled_for", cutoff)
      ),
      adminUserId
        ? countTableRows("notification_deliveries", (query) =>
            query.eq("assigned_admin_user_id", adminUserId)
          )
        : Promise.resolve(0),
      adminUserId
        ? countTableRows("scheduled_jobs", (query) =>
            query.eq("assigned_admin_user_id", adminUserId)
          )
        : Promise.resolve(0),
      countTableRows("notification_deliveries", (query) =>
        query.is("assigned_admin_user_id", null).eq("status", "failed").gte("retry_count", 2)
      ),
      countTableRows("scheduled_jobs", (query) =>
        query.is("assigned_admin_user_id", null).eq("status", "failed").gte("retry_count", 2)
      ),
      countTableRows("notification_deliveries", (query) =>
        query
          .is("assigned_admin_user_id", null)
          .eq("status", "pending")
          .lte("next_attempt_at", cutoff)
      ),
      countTableRows("notification_deliveries", (query) =>
        query
          .is("assigned_admin_user_id", null)
          .eq("status", "pending")
          .is("next_attempt_at", null)
          .lte("created_at", cutoff)
      ),
      countTableRows("scheduled_jobs", (query) =>
        query.is("assigned_admin_user_id", null).eq("status", "pending").lte("scheduled_for", cutoff)
      ),
      countTableRows("notification_deliveries", (query) =>
        query.eq("workflow_state", "investigating")
      ),
      countTableRows("notification_deliveries", (query) => query.eq("workflow_state", "waiting")),
      countTableRows("notification_deliveries", (query) => query.eq("workflow_state", "resolved")),
      countTableRows("scheduled_jobs", (query) => query.eq("workflow_state", "investigating")),
      countTableRows("scheduled_jobs", (query) => query.eq("workflow_state", "waiting")),
      countTableRows("scheduled_jobs", (query) => query.eq("workflow_state", "resolved")),
      countTableRows("notification_deliveries", (query) =>
        query
          .eq("workflow_state", "resolved")
          .gte("workflow_state_updated_at", resolvedTodayCutoff)
      ),
      countTableRows("scheduled_jobs", (query) =>
        query.eq("workflow_state", "resolved").gte("workflow_state_updated_at", resolvedTodayCutoff)
      ),
      countTableRows("operation_assignment_history", (query) =>
        query.gte("created_at", cutoff).not("previous_admin_user_id", "is", null)
      ),
      countTableRows("operation_comments", (query) => query.gte("created_at", cutoff)),
      adminUserId
        ? countTableRows("operation_watchers", (query) =>
            query.eq("admin_user_id", adminUserId)
          )
        : Promise.resolve(0),
      adminUserId
        ? countTableRows("operation_watchers", (query) =>
            query.eq("admin_user_id", adminUserId).eq("is_muted", true)
          )
        : Promise.resolve(0),
      adminUserId
        ? countWatchedUnresolvedIncidents("notification_delivery", adminUserId)
        : Promise.resolve(0),
      adminUserId
        ? countWatchedUnresolvedIncidents("scheduled_job", adminUserId)
        : Promise.resolve(0),
      adminUserId
        ? countTableRows("operation_queue_subscriptions", (query) =>
            query.eq("admin_user_id", adminUserId).eq("is_active", true)
          )
        : Promise.resolve(0),
      adminUserId
        ? countTableRows("operation_escalation_rules", (query) =>
            query.eq("created_by_admin_user_id", adminUserId).eq("is_active", true)
          )
        : Promise.resolve(0),
      countTableRows("notification_deliveries", (query) => query.eq("is_escalated", true)),
      countTableRows("scheduled_jobs", (query) => query.eq("is_escalated", true)),
      countTableRows("notification_deliveries", (query) =>
        query.is("assigned_admin_user_id", null).eq("is_escalated", true)
      ),
      countTableRows("scheduled_jobs", (query) =>
        query.is("assigned_admin_user_id", null).eq("is_escalated", true)
      ),
      countTeamFollowedIncidents()
    ]);

    const stalePendingDeliveries =
      stalePendingDeliveriesByNextAttempt + stalePendingDeliveriesByCreatedAt;
    const unassignedStaleDeliveries =
      unassignedStaleDeliveriesByNextAttempt + unassignedStaleDeliveriesByCreatedAt;

    return {
      summary: {
        deliveries: {
          pending: pendingDeliveries,
          failed: failedDeliveries,
          sent: sentDeliveries,
          ignored: ignoredDeliveries,
          needingAttention: failedDeliveriesNeedingAttention + stalePendingDeliveries,
          failedNeedingAttention: failedDeliveriesNeedingAttention,
          stalePending: stalePendingDeliveries,
          assignedToMe: assignedDeliveriesToMe,
          unassignedNeedingAttention:
            unassignedAttentionDeliveries + unassignedStaleDeliveries,
          investigating: investigatingDeliveries,
          waiting: waitingDeliveries,
          resolved: resolvedDeliveries
        },
        jobs: {
          pending: pendingJobs,
          failed: failedJobs,
          processed: processedJobs,
          canceled: canceledJobs,
          needingAttention: failedJobsNeedingAttention + stalePendingJobs,
          failedNeedingAttention: failedJobsNeedingAttention,
          stalePending: stalePendingJobs,
          assignedToMe: assignedJobsToMe,
          unassignedNeedingAttention: unassignedAttentionJobs + unassignedStaleJobs,
          investigating: investigatingJobs,
          waiting: waitingJobs,
          resolved: resolvedJobs
        },
        myAssignedIncidents: assignedDeliveriesToMe + assignedJobsToMe,
        investigating: investigatingDeliveries + investigatingJobs,
        waiting: waitingDeliveries + waitingJobs,
        resolvedToday: resolvedTodayDeliveries + resolvedTodayJobs,
        unassignedNeedingAttention:
          unassignedAttentionDeliveries +
          unassignedStaleDeliveries +
          unassignedAttentionJobs +
          unassignedStaleJobs,
        recentlyHandedOff,
        recentComments,
        watchedIncidents,
        mutedWatchedIncidents,
        watchedUnresolvedIncidents:
          watchedUnresolvedDeliveries + watchedUnresolvedJobs,
        activeSubscriptions,
        activeEscalationRules,
        activeAutomatedRules: 0,
        recentRuleRuns: 0,
        recentDigestRuns: 0,
        rulesInCooldown: 0,
        subscriptionsWithActiveMatches: 0,
        mutedRules: 0,
        snoozedSubscriptions: 0,
        unhealthyRules: 0,
        unhealthySubscriptions: 0,
        healthyAutomation: 0,
        warningAutomation: 0,
        unhealthyAutomation: 0,
        recentSkippedRuns: 0,
        recentFailedRuns: 0,
        unacknowledgedUnhealthyAutomation: 0,
        acknowledgedUnresolvedAutomation: 0,
        fixedPendingRerunAutomation: 0,
        resolvedRecentlyAutomation: 0,
        assignedUnhealthyAutomation: 0,
        unassignedUnhealthyAutomation: 0,
        overdueAcknowledgementReminders: 0,
        fixedPendingRerunAwaitingVerification: 0,
        overdueAssignedAutomation: 0,
        verificationPendingAutomation: 0,
        verificationFailedAutomation: 0,
        dismissedReminderAutomation: 0,
        snoozedReminderAutomation: 0,
        escalatedIncidents: escalatedDeliveries + escalatedJobs,
        watchedByTeamIncidents,
        unassignedEscalatedIncidents:
          unassignedEscalatedDeliveries + unassignedEscalatedJobs
      },
      warning: null
    };
  } catch (error) {
    return {
      summary: getEmptySummary(),
      warning: error instanceof Error ? error.message : "Unknown operations summary error."
    };
  }
}

export async function fetchAdminOperationsOverview(
  adminUserId?: string
): Promise<AdminOperationsOverview> {
  if (adminUserId) {
    await assertAdminActor(adminUserId);
  }

  const snapshot = await fetchAdminOperationsSnapshot(adminUserId);
  const defaultDeliveryFilters: AdminDeliveryFilters = { ...DEFAULT_DELIVERY_FILTERS };
  const defaultJobFilters: AdminJobFilters = { ...DEFAULT_JOB_FILTERS };
  const assignedToMeDeliveryFilters: AdminDeliveryFilters = {
    ...defaultDeliveryFilters,
    ownership: "assigned_to_me"
  };
  const assignedToMeJobFilters: AdminJobFilters = {
    ...defaultJobFilters,
    ownership: "assigned_to_me"
  };
  const recentlyHandedOffDeliveryFilters: AdminDeliveryFilters = {
    ...defaultDeliveryFilters,
    recentlyHandedOff: true
  };
  const recentlyHandedOffJobFilters: AdminJobFilters = {
    ...defaultJobFilters,
    recentlyHandedOff: true
  };
  const watchedDeliveryFilters: AdminDeliveryFilters = {
    ...defaultDeliveryFilters,
    watchedOnly: true
  };
  const watchedJobFilters: AdminJobFilters = {
    ...defaultJobFilters,
    watchedOnly: true
  };
  const escalatedDeliveryFilters: AdminDeliveryFilters = {
    ...defaultDeliveryFilters,
    escalatedOnly: true
  };
  const escalatedJobFilters: AdminJobFilters = {
    ...defaultJobFilters,
    escalatedOnly: true
  };

  const [
    recentDeliveries,
    recentJobs,
    recentActions,
    topFailureCategories,
    myAssignedDeliveries,
    myAssignedJobs,
    recentlyHandedOffDeliveries,
    recentlyHandedOffJobs,
    watchedDeliveries,
    watchedJobs,
    escalatedDeliveries,
    escalatedJobs,
    subscribedDeliveryViews,
    subscribedJobViews,
    escalationDeliveryRules,
    escalationJobRules,
    recentEscalationRuleRuns,
    recentSubscriptionDigestRuns,
    defaultDeliveryView,
    defaultJobView
  ] = await Promise.all([
    listAdminDeliveries(defaultDeliveryFilters, 5),
    listAdminJobs(defaultJobFilters, 5),
    fetchRecentOperationAuditEvents(8),
    fetchTopFailureCategories(6),
    adminUserId ? listAdminDeliveries(assignedToMeDeliveryFilters, 5, adminUserId) : Promise.resolve([]),
    adminUserId ? listAdminJobs(assignedToMeJobFilters, 5, adminUserId) : Promise.resolve([]),
    listAdminDeliveries(recentlyHandedOffDeliveryFilters, 5, adminUserId),
    listAdminJobs(recentlyHandedOffJobFilters, 5, adminUserId),
    adminUserId ? listAdminDeliveries(watchedDeliveryFilters, 5, adminUserId) : Promise.resolve([]),
    adminUserId ? listAdminJobs(watchedJobFilters, 5, adminUserId) : Promise.resolve([]),
    listAdminDeliveries(escalatedDeliveryFilters, 5, adminUserId),
    listAdminJobs(escalatedJobFilters, 5, adminUserId),
    adminUserId
      ? listOperationQueueSubscriptions(adminUserId, "notification_delivery")
      : Promise.resolve([]),
    adminUserId ? listOperationQueueSubscriptions(adminUserId, "scheduled_job") : Promise.resolve([]),
    adminUserId
      ? listOperationEscalationRules(adminUserId, "notification_delivery")
      : Promise.resolve([]),
    adminUserId ? listOperationEscalationRules(adminUserId, "scheduled_job") : Promise.resolve([]),
    adminUserId ? listOperationEscalationRuleRuns(adminUserId, undefined, 10) : Promise.resolve([]),
    adminUserId
      ? listOperationSubscriptionDigestRuns(adminUserId, undefined, 10)
      : Promise.resolve([]),
    adminUserId
      ? fetchDefaultOperationSavedView(adminUserId, "notification_delivery")
      : Promise.resolve(null),
    adminUserId ? fetchDefaultOperationSavedView(adminUserId, "scheduled_job") : Promise.resolve(null)
  ]);

  const activeAutomatedRules = [...escalationDeliveryRules, ...escalationJobRules].filter(
    (rule) => rule.isActive && rule.runMode === "automated"
  ).length;
  const allAutomationItems = [
    ...escalationDeliveryRules,
    ...escalationJobRules,
    ...subscribedDeliveryViews,
    ...subscribedJobViews
  ];
  const mutedRules = [...escalationDeliveryRules, ...escalationJobRules].filter(
    (rule) => rule.isMuted
  ).length;
  const rulesInCooldown = [...escalationDeliveryRules, ...escalationJobRules].filter((rule) => {
    if (rule.runMode !== "automated" || !rule.nextRunAt) {
      return false;
    }

    return new Date(rule.nextRunAt).getTime() > Date.now();
  }).length;
  const snoozedSubscriptions = [...subscribedDeliveryViews, ...subscribedJobViews].filter(
    (subscription) =>
      subscription.snoozedUntil &&
      new Date(subscription.snoozedUntil).getTime() > Date.now()
  ).length;
  const subscriptionsWithActiveMatches = [...subscribedDeliveryViews, ...subscribedJobViews].filter(
    (subscription) => subscription.isActive && subscription.currentMatchCount > 0
  ).length;
  const unhealthyRules = [...escalationDeliveryRules, ...escalationJobRules].filter((rule) =>
    isAutomationUnhealthy(rule.consecutiveSkipCount, rule.consecutiveFailureCount)
  ).length;
  const unhealthySubscriptions = [...subscribedDeliveryViews, ...subscribedJobViews].filter(
    (subscription) =>
      isAutomationUnhealthy(
        subscription.consecutiveSkipCount,
        subscription.consecutiveFailureCount
      )
  ).length;
  const allRecentRuns = [
    ...recentEscalationRuleRuns,
    ...recentSubscriptionDigestRuns
  ];
  const recentSkippedRuns = allRecentRuns.filter((run) => run.runStatus === "skipped").length;
  const recentFailedRuns = allRecentRuns.filter((run) => run.runStatus === "failed").length;
  const healthyAutomation = allAutomationItems.filter(
    (item) => item.healthStatus === "healthy"
  ).length;
  const warningAutomation = allAutomationItems.filter(
    (item) => item.healthStatus === "warning"
  ).length;
  const unhealthyAutomation = allAutomationItems.filter(
    (item) => item.healthStatus === "unhealthy"
  ).length;
  const topSkipReasons = summarizeAutomationReasons(allRecentRuns, "skip", 4);
  const topFailureReasons = summarizeAutomationReasons(allRecentRuns, "failure", 4);
  const unhealthyAutomationRules = [...escalationDeliveryRules, ...escalationJobRules]
    .filter((rule) => rule.healthStatus === "unhealthy" || rule.healthStatus === "warning")
    .sort((left, right) => {
      return (
        right.consecutiveFailureCount - left.consecutiveFailureCount ||
        right.consecutiveSkipCount - left.consecutiveSkipCount ||
        right.updatedAt.localeCompare(left.updatedAt)
      );
    })
    .slice(0, 6);
  const unhealthyAutomationSubscriptions = [...subscribedDeliveryViews, ...subscribedJobViews]
    .filter(
      (subscription) =>
        subscription.healthStatus === "unhealthy" || subscription.healthStatus === "warning"
    )
    .sort((left, right) => {
      return (
        right.consecutiveFailureCount - left.consecutiveFailureCount ||
        right.consecutiveSkipCount - left.consecutiveSkipCount ||
        right.updatedAt.localeCompare(left.updatedAt)
      );
    })
    .slice(0, 6);
  const allRuleIds = [...escalationDeliveryRules, ...escalationJobRules].map((rule) => rule.id);
  const allSubscriptionIds = [...subscribedDeliveryViews, ...subscribedJobViews].map(
    (subscription) => subscription.id
  );
  const [ruleAcknowledgements, subscriptionAcknowledgements] = await Promise.all([
    listAutomationAcknowledgements("operation_escalation_rule", allRuleIds),
    listAutomationAcknowledgements("operation_queue_subscription", allSubscriptionIds)
  ]);
  const latestRuleAcknowledgements = getLatestAcknowledgements(ruleAcknowledgements);
  const latestSubscriptionAcknowledgements = getLatestAcknowledgements(subscriptionAcknowledgements);
  const now = Date.now();
  const unhealthyItemsWithAcknowledgement = [
    ...unhealthyAutomationRules.map((rule) => latestRuleAcknowledgements.get(rule.id) ?? null),
    ...unhealthyAutomationSubscriptions.map(
      (subscription) => latestSubscriptionAcknowledgements.get(subscription.id) ?? null
    )
  ];
  const unacknowledgedUnhealthyAutomation = unhealthyItemsWithAcknowledgement.filter(
    (acknowledgement) => !acknowledgement || acknowledgement.status === "unacknowledged"
  ).length;
  const acknowledgedUnresolvedAutomation = unhealthyItemsWithAcknowledgement.filter(
    (acknowledgement) =>
      acknowledgement &&
      ["acknowledged", "investigating"].includes(acknowledgement.status)
  ).length;
  const fixedPendingRerunAutomation = unhealthyItemsWithAcknowledgement.filter(
    (acknowledgement) => acknowledgement?.status === "fixed_pending_rerun"
  ).length;
  const resolvedRecentlyAutomation = [...ruleAcknowledgements, ...subscriptionAcknowledgements].filter(
    (acknowledgement) =>
      acknowledgement.status === "resolved" &&
      new Date(acknowledgement.createdAt).getTime() > now - 24 * 60 * 60 * 1000
  ).length;
  const assignedUnhealthyAutomation = unhealthyItemsWithAcknowledgement.filter(
    (acknowledgement) => acknowledgement?.assignedAdminUserId
  ).length;
  const unassignedUnhealthyAutomation = unhealthyItemsWithAcknowledgement.filter(
    (acknowledgement) => !acknowledgement?.assignedAdminUserId
  ).length;
  const overdueAcknowledgementReminders = unhealthyItemsWithAcknowledgement.filter(
    (acknowledgement) =>
      acknowledgement?.isOverdue
  ).length;
  const fixedPendingRerunAwaitingVerification = unhealthyItemsWithAcknowledgement.filter(
    (acknowledgement) =>
      acknowledgement?.status === "fixed_pending_rerun" &&
      acknowledgement.verificationStatus !== "completed"
  ).length;
  const overdueAssignedAutomation = unhealthyItemsWithAcknowledgement.filter(
    (acknowledgement) => acknowledgement?.assignedAdminUserId && acknowledgement.isOverdue
  ).length;
  const verificationPendingAutomation = unhealthyItemsWithAcknowledgement.filter(
    (acknowledgement) => acknowledgement?.verificationStatus === "pending"
  ).length;
  const verificationFailedAutomation = unhealthyItemsWithAcknowledgement.filter(
    (acknowledgement) => acknowledgement?.verificationStatus === "failed"
  ).length;
  const dismissedReminderAutomation = unhealthyItemsWithAcknowledgement.filter(
    (acknowledgement) => acknowledgement?.reminderState === "dismissed"
  ).length;
  const snoozedReminderAutomation = unhealthyItemsWithAcknowledgement.filter(
    (acknowledgement) => acknowledgement && isReminderSnoozed(acknowledgement)
  ).length;
  const needingAcknowledgementRules = unhealthyAutomationRules
    .filter((rule) => {
      const acknowledgement = latestRuleAcknowledgements.get(rule.id);
      return !acknowledgement || acknowledgement.status === "unacknowledged";
    })
    .slice(0, 6);
  const needingAcknowledgementSubscriptions = unhealthyAutomationSubscriptions
    .filter((subscription) => {
      const acknowledgement = latestSubscriptionAcknowledgements.get(subscription.id);
      return !acknowledgement || acknowledgement.status === "unacknowledged";
    })
    .slice(0, 6);
  const overdueFollowUpRules = unhealthyAutomationRules
    .filter((rule) => {
      const acknowledgement = latestRuleAcknowledgements.get(rule.id);

      if (!acknowledgement) {
        return false;
      }

      return (
        acknowledgement.isOverdue ||
        (acknowledgement.status === "fixed_pending_rerun" &&
          acknowledgement.verificationStatus !== "completed")
      );
    })
    .slice(0, 6);
  const overdueFollowUpSubscriptions = unhealthyAutomationSubscriptions
    .filter((subscription) => {
      const acknowledgement = latestSubscriptionAcknowledgements.get(subscription.id);

      if (!acknowledgement) {
        return false;
      }

      return (
        acknowledgement.isOverdue ||
        (acknowledgement.status === "fixed_pending_rerun" &&
          acknowledgement.verificationStatus !== "completed")
      );
    })
    .slice(0, 6);

  return {
    summary: {
      ...snapshot.summary,
      activeAutomatedRules,
      recentRuleRuns: recentEscalationRuleRuns.length,
      recentDigestRuns: recentSubscriptionDigestRuns.length,
      rulesInCooldown,
      subscriptionsWithActiveMatches,
      mutedRules,
      snoozedSubscriptions,
      unhealthyRules,
      unhealthySubscriptions,
      healthyAutomation,
      warningAutomation,
      unhealthyAutomation,
      recentSkippedRuns,
      recentFailedRuns,
      unacknowledgedUnhealthyAutomation,
      acknowledgedUnresolvedAutomation,
      fixedPendingRerunAutomation,
      resolvedRecentlyAutomation,
      assignedUnhealthyAutomation,
      unassignedUnhealthyAutomation,
      overdueAcknowledgementReminders,
      fixedPendingRerunAwaitingVerification,
      overdueAssignedAutomation,
      verificationPendingAutomation,
      verificationFailedAutomation,
      dismissedReminderAutomation,
      snoozedReminderAutomation
    },
    recentDeliveries,
    recentJobs,
    recentActions,
    topFailureCategories,
    myAssignedDeliveries,
    myAssignedJobs,
    recentlyHandedOffDeliveries,
    recentlyHandedOffJobs,
    watchedDeliveries,
    watchedJobs,
    escalatedDeliveries,
    escalatedJobs,
    subscribedDeliveryViews: subscribedDeliveryViews.filter((view) => view.isActive).slice(0, 5),
    subscribedJobViews: subscribedJobViews.filter((view) => view.isActive).slice(0, 5),
    escalationDeliveryRules: escalationDeliveryRules.filter((rule) => rule.isActive).slice(0, 5),
    escalationJobRules: escalationJobRules.filter((rule) => rule.isActive).slice(0, 5),
    recentEscalationRuleRuns,
    recentSubscriptionDigestRuns,
    topSkipReasons,
    topFailureReasons,
    unhealthyAutomationRules,
    unhealthyAutomationSubscriptions,
    needingAcknowledgementRules,
    needingAcknowledgementSubscriptions,
    overdueFollowUpRules,
    overdueFollowUpSubscriptions,
    defaultDeliveryView,
    defaultJobView,
    warning: snapshot.warning
  };
}

export async function listAdminDeliveries(
  filters: AdminDeliveryFilters,
  limit = 25,
  adminUserId?: string
): Promise<AdminDeliveryRecord[]> {
  if (adminUserId) {
    await assertAdminActor(adminUserId);
  }

  const client = getOperationsClient();
  const recentlyHandedOffIds = filters.recentlyHandedOff
    ? await fetchRecentlyHandedOffIds("notification_delivery")
    : [];
  const watchedIds =
    filters.watchedOnly && adminUserId
      ? await fetchWatchedEntityIds("notification_delivery", adminUserId)
      : [];
  let query = client.from("notification_deliveries").select(DELIVERY_SELECT);

  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.userId) {
    query = query.eq("user_id", filters.userId);
  }

  if (filters.channel !== "all") {
    query = query.eq("channel", filters.channel);
  }

  if (filters.templateKey !== "all") {
    query = query.eq("template_key", filters.templateKey);
  }

  if (filters.workflowState !== "all") {
    query = query.eq("workflow_state", filters.workflowState);
  }

  if (filters.escalatedOnly) {
    query = query.eq("is_escalated", true);
  }

  if (filters.ownership === "assigned_to_me") {
    if (!adminUserId) {
      throw new OperationsError("Assigned-to-me filters require an admin user context.");
    }

    query = query.eq("assigned_admin_user_id", adminUserId);
  } else if (filters.ownership === "unassigned") {
    query = query.is("assigned_admin_user_id", null);
  }

  if (filters.recentlyHandedOff) {
    if (recentlyHandedOffIds.length === 0) {
      return [];
    }

    query = query.in("id", recentlyHandedOffIds);
  }

  if (filters.watchedOnly) {
    if (!adminUserId) {
      throw new OperationsError("Watched filters require an admin user context.");
    }

    if (watchedIds.length === 0) {
      return [];
    }

    query = query.in("id", watchedIds);
  }

  query = applyDeliveryOrdering(query, filters.sort).limit(Math.max(limit * 4, 100));

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load notification deliveries: ${error.message}`);
  }

  let records = await enrichDeliveries((data as DeliveryRow[] | null) ?? [], adminUserId);

  if (filters.relatedEntityType) {
    records = records.filter((record) => record.relatedEntityType === filters.relatedEntityType);
  }

  if (filters.needsAttention) {
    records = records.filter((record) => record.needsAttention);
  }

  return records.slice(0, limit);
}

export async function listAdminJobs(
  filters: AdminJobFilters,
  limit = 25,
  adminUserId?: string
): Promise<AdminScheduledJobRecord[]> {
  if (adminUserId) {
    await assertAdminActor(adminUserId);
  }

  const client = getOperationsClient();
  const recentlyHandedOffIds = filters.recentlyHandedOff
    ? await fetchRecentlyHandedOffIds("scheduled_job")
    : [];
  const watchedIds =
    filters.watchedOnly && adminUserId
      ? await fetchWatchedEntityIds("scheduled_job", adminUserId)
      : [];
  let query = client.from("scheduled_jobs").select(JOB_SELECT);

  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.userId) {
    query = query.eq("user_id", filters.userId);
  }

  if (filters.jobType !== "all") {
    query = query.eq("job_type", filters.jobType);
  }

  if (filters.relatedEntityType) {
    query = query.eq("related_entity_type", filters.relatedEntityType);
  }

  if (filters.workflowState !== "all") {
    query = query.eq("workflow_state", filters.workflowState);
  }

  if (filters.escalatedOnly) {
    query = query.eq("is_escalated", true);
  }

  if (filters.ownership === "assigned_to_me") {
    if (!adminUserId) {
      throw new OperationsError("Assigned-to-me filters require an admin user context.");
    }

    query = query.eq("assigned_admin_user_id", adminUserId);
  } else if (filters.ownership === "unassigned") {
    query = query.is("assigned_admin_user_id", null);
  }

  if (filters.recentlyHandedOff) {
    if (recentlyHandedOffIds.length === 0) {
      return [];
    }

    query = query.in("id", recentlyHandedOffIds);
  }

  if (filters.watchedOnly) {
    if (!adminUserId) {
      throw new OperationsError("Watched filters require an admin user context.");
    }

    if (watchedIds.length === 0) {
      return [];
    }

    query = query.in("id", watchedIds);
  }

  query = applyJobOrdering(query, filters.sort).limit(Math.max(limit * 4, 100));

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load scheduled jobs: ${error.message}`);
  }

  let records = await enrichJobs((data as JobRow[] | null) ?? [], adminUserId);

  if (filters.needsAttention) {
    records = records.filter((record) => record.needsAttention);
  }

  return records.slice(0, limit);
}

export async function fetchAdminDeliveryDetail(
  deliveryId: string,
  adminUserId?: string
): Promise<AdminDeliveryDetail | null> {
  if (adminUserId) {
    await assertAdminActor(adminUserId);
  }

  const client = getOperationsClient();
  const { data, error } = await client
    .from("notification_deliveries")
    .select(DELIVERY_SELECT)
    .eq("id", deliveryId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load delivery detail: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [delivery, notes, comments, watchers, auditEvents, assignmentHistory] = await Promise.all([
    enrichDeliveries([data as DeliveryRow]),
    listOperationNotes("notification_delivery", deliveryId),
    listOperationComments("notification_delivery", deliveryId),
    listOperationWatchers("notification_delivery", deliveryId),
    listOperationAuditEvents("notification_delivery", deliveryId),
    listAssignmentHistory("notification_delivery", deliveryId)
  ]);
  const notification = (data as DeliveryRow).notification?.[0] ?? null;
  const matchingSubscriptions = adminUserId
    ? await findMatchingSubscriptionsForIncident(adminUserId, "notification_delivery", delivery[0], {
        isWatching: watchers.some((watcher) => watcher.adminUserId === adminUserId)
      }).catch(() => [])
    : [];

  return {
    ...delivery[0],
    notificationTitle: notification?.title ?? null,
    notificationMessage: notification?.message ?? null,
    linkUrl: notification?.link_url ?? null,
    externalMessageId: (data as DeliveryRow).external_message_id ?? null,
    notes,
    comments,
    watchers,
    matchingSubscriptions,
    auditEvents,
    assignmentHistory
  };
}

export async function fetchAdminJobDetail(
  jobId: string,
  adminUserId?: string
): Promise<AdminScheduledJobDetail | null> {
  if (adminUserId) {
    await assertAdminActor(adminUserId);
  }

  const client = getOperationsClient();
  const { data, error } = await client
    .from("scheduled_jobs")
    .select(JOB_SELECT)
    .eq("id", jobId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load scheduled job detail: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [job, notes, comments, watchers, auditEvents, assignmentHistory] = await Promise.all([
    enrichJobs([data as JobRow]),
    listOperationNotes("scheduled_job", jobId),
    listOperationComments("scheduled_job", jobId),
    listOperationWatchers("scheduled_job", jobId),
    listOperationAuditEvents("scheduled_job", jobId),
    listAssignmentHistory("scheduled_job", jobId)
  ]);
  const row = data as JobRow;
  const matchingSubscriptions = adminUserId
    ? await findMatchingSubscriptionsForIncident(adminUserId, "scheduled_job", job[0], {
        isWatching: watchers.some((watcher) => watcher.adminUserId === adminUserId)
      }).catch(() => [])
    : [];

  return {
    ...job[0],
    dedupeKey: row.dedupe_key ?? null,
    payload: JSON.stringify(row.payload ?? {}, null, 2),
    notes,
    comments,
    watchers,
    matchingSubscriptions,
    auditEvents,
    assignmentHistory
  };
}

export async function addAdminOperationNote(input: {
  entityType: OperationEntityType;
  entityId: string;
  adminUserId: string;
  noteBody: string;
}) {
  await assertAdminActor(input.adminUserId);
  const noteBody = input.noteBody.trim();

  if (!noteBody) {
    throw new OperationsError("A note is required.");
  }

  await assertOperationEntityExists(input.entityType, input.entityId);

  const client = getOperationsClient();
  const { error } = await client.from("operation_notes").insert({
    entity_type: input.entityType,
    entity_id: input.entityId,
    admin_user_id: input.adminUserId,
    note_body: noteBody
  });

  if (error) {
    throw new Error(`Failed to save operation note: ${error.message}`);
  }

  await recordOperationAuditEvent({
    entityType: input.entityType,
    entityId: input.entityId,
    adminUserId: input.adminUserId,
    eventType: "note_added",
    eventSummary: "Operator added an internal note.",
    metadata: {
      noteLength: noteBody.length
    }
  });
}

export async function createOperationSavedView(input: {
  adminUserId: string;
  entityType: OperationEntityType;
  name: string;
  filters: AdminDeliveryFilters | AdminJobFilters;
  isDefault: boolean;
}) {
  await assertAdminActor(input.adminUserId);
  const client = getOperationsClient();
  const name = input.name.trim();

  if (!name) {
    throw new OperationsError("Saved view name is required.");
  }

  if (input.isDefault) {
    await client
      .from("operation_saved_views")
      .update({ is_default: false })
      .eq("admin_user_id", input.adminUserId)
      .eq("entity_type", input.entityType);
  }

  const { data, error } = await client
    .from("operation_saved_views")
    .insert({
      admin_user_id: input.adminUserId,
      entity_type: input.entityType,
      name,
      filters_json: input.filters,
      is_default: input.isDefault
    })
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to create saved view: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Saved view could not be created.");
  }

  return (data as { id: string }).id;
}

export async function updateOperationSavedView(input: {
  viewId: string;
  adminUserId: string;
  name: string;
  isDefault: boolean;
  filters?: AdminDeliveryFilters | AdminJobFilters;
}) {
  await assertAdminActor(input.adminUserId);
  const client = getOperationsClient();
  const name = input.name.trim();

  if (!name) {
    throw new OperationsError("Saved view name is required.");
  }

  const { data, error } = await client
    .from("operation_saved_views")
    .select("id,entity_type")
    .eq("id", input.viewId)
    .eq("admin_user_id", input.adminUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load saved view: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Saved view could not be found.");
  }

  if (input.isDefault) {
    await client
      .from("operation_saved_views")
      .update({ is_default: false })
      .eq("admin_user_id", input.adminUserId)
      .eq("entity_type", (data as { entity_type: OperationEntityType }).entity_type);
  }

  const payload: Record<string, unknown> = {
    name,
    is_default: input.isDefault
  };

  if (input.filters) {
    payload.filters_json = input.filters;
  }

  const { error: updateError } = await client
    .from("operation_saved_views")
    .update(payload)
    .eq("id", input.viewId)
    .eq("admin_user_id", input.adminUserId);

  if (updateError) {
    throw new Error(`Failed to update saved view: ${updateError.message}`);
  }
}

export async function deleteOperationSavedView(viewId: string, adminUserId: string) {
  await assertAdminActor(adminUserId);
  const client = getOperationsClient();
  const { error } = await client
    .from("operation_saved_views")
    .delete()
    .eq("id", viewId)
    .eq("admin_user_id", adminUserId);

  if (error) {
    throw new Error(`Failed to delete saved view: ${error.message}`);
  }
}

async function createMentionNotifications(input: {
  entityType: OperationEntityType;
  entityId: string;
  commentId: string;
  commentBody: string;
  actorAdminUserId: string;
}) {
  const operators = await fetchAdminOperators();
  const handleMap = new Map(operators.map((operator) => [operator.handle, operator]));
  const mentionedHandles = extractMentionHandles(input.commentBody);
  const targets: AdminOperatorOption[] = [];

  for (const handle of mentionedHandles) {
    const operator = handleMap.get(handle);

    if (operator && operator.userId !== input.actorAdminUserId) {
      targets.push(operator);
    }
  }

  if (targets.length === 0) {
    return [];
  }

  const labelMap = await fetchAdminUserLabelMap([input.actorAdminUserId]);
  const actorLabel = labelMap.get(input.actorAdminUserId) ?? input.actorAdminUserId;
  const client = getOperationsClient();
  const entityLabel = getOperationsEntityLabel(input.entityType);
  const linkUrl = getIncidentLink(input.entityType, input.entityId);

  const rows = targets.map((target) => ({
    user_id: target.userId,
    type: "operator_mentioned",
    title: "You were mentioned in queue operations",
    message: `${actorLabel} mentioned you on ${entityLabel} ${input.entityId.slice(0, 8)}.`,
    link_url: linkUrl,
    dedupe_key: `ops-mention:${input.commentId}:${target.userId}`,
    is_read: false
  }));

  const { error } = await client.from("notifications").insert(rows);

  if (error) {
    throw new Error(`Failed to create mention notifications: ${error.message}`);
  }

  return targets.map((target) => target.userId);
}

export async function addOperationComment(input: {
  entityType: OperationEntityType;
  entityId: string;
  adminUserId: string;
  commentBody: string;
}) {
  await assertAdminActor(input.adminUserId);
  const commentBody = input.commentBody.trim();

  if (!commentBody) {
    throw new OperationsError("A comment is required.");
  }

  await assertOperationEntityExists(input.entityType, input.entityId);

  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_comments")
    .insert({
      entity_type: input.entityType,
      entity_id: input.entityId,
      admin_user_id: input.adminUserId,
      comment_body: commentBody
    })
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to save operation comment: ${error.message}`);
  }

  const commentId = (data as { id: string } | null)?.id;

  if (!commentId) {
    throw new OperationsError("Comment could not be created.");
  }

  const mentionedUserIds = await createMentionNotifications({
    entityType: input.entityType,
    entityId: input.entityId,
    commentId,
    commentBody,
    actorAdminUserId: input.adminUserId
  });

  const auditEventId = await recordOperationAuditEvent({
    entityType: input.entityType,
    entityId: input.entityId,
    adminUserId: input.adminUserId,
    eventType: "comment_added",
    eventSummary: "Operator added a collaboration comment.",
    metadata: {
      mentionCount: extractMentionHandles(commentBody).length
    }
  });

  const labelMap = await fetchAdminUserLabelMap([input.adminUserId]);
  const actorLabel = labelMap.get(input.adminUserId) ?? input.adminUserId;
  const entityLabel = getOperationsEntityLabel(input.entityType);

  await createWatcherNotifications({
    entityType: input.entityType,
    entityId: input.entityId,
    actorAdminUserId: input.adminUserId,
    notificationKind: "comment",
    title: "New comment on a watched incident",
    message: `${actorLabel} added a comment on watched ${entityLabel} ${input.entityId.slice(0, 8)}.`,
    dedupeScope: `comment:${auditEventId ?? commentId}`,
    skipAdminUserIds: mentionedUserIds
  });

  await createSubscriptionNotifications({
    entityType: input.entityType,
    entityId: input.entityId,
    actorAdminUserId: input.adminUserId,
    title: "Subscribed incident updated",
    message: `${actorLabel} commented on a subscribed ${entityLabel} ${input.entityId.slice(0, 8)}.`,
    dedupeScope: `comment:${auditEventId ?? commentId}`
  });
}

export async function watchIncident(
  entityType: OperationEntityType,
  entityId: string,
  adminUserId: string
) {
  await assertAdminActor(adminUserId);
  await assertOperationEntityExists(entityType, entityId);

  const client = getOperationsClient();
  const { data: existing, error: existingError } = await client
    .from("operation_watchers")
    .select("id")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("admin_user_id", adminUserId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to load watch state: ${existingError.message}`);
  }

  if (existing) {
    return false;
  }

  const { error } = await client.from("operation_watchers").insert({
    entity_type: entityType,
    entity_id: entityId,
    admin_user_id: adminUserId,
    is_muted: DEFAULT_WATCH_PREFERENCES.isMuted,
    notify_on_comment: DEFAULT_WATCH_PREFERENCES.notifyOnComment,
    notify_on_owner_change: DEFAULT_WATCH_PREFERENCES.notifyOnOwnerChange,
    notify_on_workflow_change: DEFAULT_WATCH_PREFERENCES.notifyOnWorkflowChange,
    notify_on_resolve: DEFAULT_WATCH_PREFERENCES.notifyOnResolve
  });

  if (error) {
    throw new Error(`Failed to watch incident: ${error.message}`);
  }

  await recordOperationAuditEvent({
    entityType,
    entityId,
    adminUserId,
    eventType: "watch_started",
    eventSummary: "Operator started watching this incident."
  });

  return true;
}

export async function updateWatchPreferences(input: {
  entityType: OperationEntityType;
  entityId: string;
  adminUserId: string;
  preferences: Partial<{
    isMuted: boolean;
    notifyOnComment: boolean;
    notifyOnOwnerChange: boolean;
    notifyOnWorkflowChange: boolean;
    notifyOnResolve: boolean;
  }>;
  auditContext?: Record<string, unknown>;
}) {
  await assertAdminActor(input.adminUserId);
  await assertOperationEntityExists(input.entityType, input.entityId);

  const client = getOperationsClient();
  const { data, error } = await client
    .from("operation_watchers")
    .select(
      "id,is_muted,notify_on_comment,notify_on_owner_change,notify_on_workflow_change,notify_on_resolve"
    )
    .eq("entity_type", input.entityType)
    .eq("entity_id", input.entityId)
    .eq("admin_user_id", input.adminUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load watch preferences: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Watch this incident first before updating follow preferences.");
  }

  const current = normalizeWatchPreferences({
    isMuted: (data as Record<string, unknown>).is_muted,
    notifyOnComment: (data as Record<string, unknown>).notify_on_comment,
    notifyOnOwnerChange: (data as Record<string, unknown>).notify_on_owner_change,
    notifyOnWorkflowChange: (data as Record<string, unknown>).notify_on_workflow_change,
    notifyOnResolve: (data as Record<string, unknown>).notify_on_resolve
  });
  const next = {
    ...current,
    ...input.preferences
  };

  const { error: updateError } = await client
    .from("operation_watchers")
    .update({
      is_muted: next.isMuted,
      notify_on_comment: next.notifyOnComment,
      notify_on_owner_change: next.notifyOnOwnerChange,
      notify_on_workflow_change: next.notifyOnWorkflowChange,
      notify_on_resolve: next.notifyOnResolve
    })
    .eq("id", (data as { id: string }).id);

  if (updateError) {
    throw new Error(`Failed to update watch preferences: ${updateError.message}`);
  }

  await recordOperationAuditEvent({
    entityType: input.entityType,
    entityId: input.entityId,
    adminUserId: input.adminUserId,
    eventType: "watch_preferences_updated",
    eventSummary: "Operator updated watch preferences for this incident.",
    metadata: {
      isMuted: next.isMuted,
      notifyOnComment: next.notifyOnComment,
      notifyOnOwnerChange: next.notifyOnOwnerChange,
      notifyOnWorkflowChange: next.notifyOnWorkflowChange,
      notifyOnResolve: next.notifyOnResolve,
      ...input.auditContext
    }
  });
}

export async function unwatchIncident(
  entityType: OperationEntityType,
  entityId: string,
  adminUserId: string
) {
  await assertAdminActor(adminUserId);
  await assertOperationEntityExists(entityType, entityId);

  const client = getOperationsClient();
  const { data: existing, error: existingError } = await client
    .from("operation_watchers")
    .select("id")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("admin_user_id", adminUserId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to load watch state: ${existingError.message}`);
  }

  if (!existing) {
    return false;
  }

  const { error } = await client
    .from("operation_watchers")
    .delete()
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("admin_user_id", adminUserId);

  if (error) {
    throw new Error(`Failed to remove watch state: ${error.message}`);
  }

  await recordOperationAuditEvent({
    entityType,
    entityId,
    adminUserId,
    eventType: "watch_removed",
    eventSummary: "Operator stopped watching this incident."
  });

  return true;
}

export async function setIncidentEscalation(input: {
  entityType: OperationEntityType;
  entityId: string;
  adminUserId: string;
  isEscalated: boolean;
  escalationReason?: string;
}) {
  await assertAdminActor(input.adminUserId);
  const client = getOperationsClient();
  const row = await readIncidentOwnershipState(input.entityType, input.entityId);

  if (Boolean(row.is_escalated) === input.isEscalated) {
    return input.entityId;
  }

  const updatePayload = input.isEscalated
    ? {
        is_escalated: true,
        escalated_at: new Date().toISOString(),
        escalated_by_admin_user_id: input.adminUserId,
        escalation_reason: input.escalationReason?.trim() ? input.escalationReason.trim() : null
      }
    : {
        is_escalated: false,
        escalated_at: null,
        escalated_by_admin_user_id: null,
        escalation_reason: null
      };

  const { error } =
    input.entityType === "notification_delivery"
      ? await client.from("notification_deliveries").update(updatePayload).eq("id", input.entityId)
      : await client.from("scheduled_jobs").update(updatePayload).eq("id", input.entityId);

  if (error) {
    throw new Error(`Failed to update escalation state: ${error.message}`);
  }

  const eventType = input.isEscalated ? "escalated" : "deescalated";
  const auditEventId = await recordOperationAuditEvent({
    entityType: input.entityType,
    entityId: input.entityId,
    adminUserId: input.adminUserId,
    eventType,
    eventSummary: input.isEscalated
      ? "Operator escalated this incident."
      : "Operator cleared escalation for this incident.",
    metadata: {
      escalationReason: input.escalationReason?.trim() || null
    }
  });

  const labelMap = await fetchAdminUserLabelMap([input.adminUserId]);
  const actorLabel = labelMap.get(input.adminUserId) ?? input.adminUserId;
  const entityLabel = getOperationsEntityLabel(input.entityType);

  await createSubscriptionNotifications({
    entityType: input.entityType,
    entityId: input.entityId,
    actorAdminUserId: input.adminUserId,
    title: input.isEscalated
      ? "Subscribed incident escalated"
      : "Subscribed incident de-escalated",
    message: input.isEscalated
      ? `${actorLabel} escalated subscribed ${entityLabel} ${input.entityId.slice(0, 8)}.`
      : `${actorLabel} cleared escalation on subscribed ${entityLabel} ${input.entityId.slice(0, 8)}.`,
    dedupeScope: `escalation:${auditEventId ?? eventType}`
  });

  return input.entityId;
}

export async function bulkUpdateWatchPreferences(input: {
  entityType: OperationEntityType;
  entityIds: string[];
  adminUserId: string;
  preferences: Partial<{
    isMuted: boolean;
    notifyOnComment: boolean;
    notifyOnOwnerChange: boolean;
    notifyOnWorkflowChange: boolean;
    notifyOnResolve: boolean;
  }>;
}) {
  const selectedIds = normalizeBulkSelection(input.entityIds);

  if (selectedIds.length === 0) {
    throw new OperationsError("Select at least one incident first.");
  }

  const summary = createBulkSummary(selectedIds.length);
  const auditContext = getBulkAuditContext("bulk_update_watch_preferences", selectedIds.length);

  for (const entityId of selectedIds) {
    try {
      await updateWatchPreferences({
        entityType: input.entityType,
        entityId,
        adminUserId: input.adminUserId,
        preferences: input.preferences,
        auditContext
      });
      summary.succeeded += 1;
    } catch (error) {
      summarizeFailure(summary, entityId, error);
    }
  }

  return summary;
}

export async function retryAdminDelivery(
  deliveryId: string,
  force: boolean,
  adminUserId: string,
  auditContext?: OperationAuditContext
) {
  await assertAdminActor(adminUserId);
  const client = getOperationsClient();
  const { data, error } = await client
    .from("notification_deliveries")
    .select(DELIVERY_SELECT)
    .eq("id", deliveryId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load delivery for retry: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Delivery could not be found.");
  }

  const row = data as DeliveryRow;

  if (isProcessingLocked(row.processing_started_at)) {
    throw new OperationsError("This delivery is currently being processed.");
  }

  const detail = await fetchAdminDeliveryDetail(deliveryId);

  if (!detail) {
    throw new OperationsError("Delivery could not be found.");
  }

  canRetryDelivery(detail, force);

  if (detail.templateKey === "session_reminder") {
    await assertReminderTargetStillValid(detail.relatedEntityType, detail.relatedEntityId);
  }

  const retryCount = force && detail.retryCount >= detail.maxRetries ? 0 : detail.retryCount;
  const { error: updateError } = await client
    .from("notification_deliveries")
    .update({
      status: "pending",
      retry_count: retryCount,
      error_message: null,
      next_attempt_at: new Date().toISOString(),
      processing_started_at: null,
      processing_token: null
    })
    .eq("id", deliveryId);

  if (updateError) {
    throw new Error(`Failed to queue the delivery retry: ${updateError.message}`);
  }

  await recordOperationAuditEvent({
    entityType: "notification_delivery",
    entityId: deliveryId,
    adminUserId,
    eventType: force ? "force_retry_requested" : "retry_requested",
    eventSummary: force
      ? "Operator force-queued a notification delivery for resend."
      : "Operator queued a notification delivery for resend.",
    metadata: {
      previousStatus: detail.status,
      retryCount: detail.retryCount,
      maxRetries: detail.maxRetries,
      templateKey: detail.templateKey,
      ...auditContext
    }
  });

  return deliveryId;
}

export async function ignoreAdminDelivery(
  deliveryId: string,
  adminUserId: string,
  auditContext?: OperationAuditContext
) {
  await assertAdminActor(adminUserId);
  const client = getOperationsClient();
  const { data, error } = await client
    .from("notification_deliveries")
    .select(DELIVERY_SELECT)
    .eq("id", deliveryId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load delivery for ignore: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Delivery could not be found.");
  }

  const row = data as DeliveryRow;

  if (isProcessingLocked(row.processing_started_at)) {
    throw new OperationsError("This delivery is currently being processed.");
  }

  const detail = await fetchAdminDeliveryDetail(deliveryId);

  if (!detail) {
    throw new OperationsError("Delivery could not be found.");
  }

  canIgnoreDelivery(detail);

  const { error: updateError } = await client
    .from("notification_deliveries")
    .update({
      status: "ignored",
      processing_started_at: null,
      processing_token: null
    })
    .eq("id", deliveryId);

  if (updateError) {
    throw new Error(`Failed to ignore the delivery: ${updateError.message}`);
  }

  await recordOperationAuditEvent({
    entityType: "notification_delivery",
    entityId: deliveryId,
    adminUserId,
    eventType: "ignored",
    eventSummary: "Operator marked a notification delivery as ignored.",
    metadata: {
      previousStatus: detail.status,
      templateKey: detail.templateKey,
      ...auditContext
    }
  });

  return deliveryId;
}

export async function replayAdminJob(
  jobId: string,
  force: boolean,
  adminUserId: string,
  auditContext?: OperationAuditContext
) {
  await assertAdminActor(adminUserId);
  const client = getOperationsClient();
  const { data, error } = await client
    .from("scheduled_jobs")
    .select(JOB_SELECT)
    .eq("id", jobId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load scheduled job for replay: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Scheduled job could not be found.");
  }

  const row = data as JobRow;

  if (isProcessingLocked(row.processing_started_at)) {
    throw new OperationsError("This scheduled job is currently being processed.");
  }

  const detail = await fetchAdminJobDetail(jobId);

  if (!detail) {
    throw new OperationsError("Scheduled job could not be found.");
  }

  canReplayJob(detail, force);

  if (detail.jobType.startsWith("session_reminder_")) {
    await assertReminderTargetStillValid(detail.relatedEntityType, detail.relatedEntityId);
  }

  const retryCount = force && detail.retryCount >= detail.maxRetries ? 0 : detail.retryCount;
  const { error: updateError } = await client
    .from("scheduled_jobs")
    .update({
      status: "pending",
      retry_count: retryCount,
      scheduled_for: new Date().toISOString(),
      processed_at: null,
      error_message: null,
      processing_started_at: null,
      processing_token: null
    })
    .eq("id", jobId);

  if (updateError) {
    throw new Error(`Failed to replay the scheduled job: ${updateError.message}`);
  }

  await recordOperationAuditEvent({
    entityType: "scheduled_job",
    entityId: jobId,
    adminUserId,
    eventType: force ? "force_retry_requested" : "replay_requested",
    eventSummary: force
      ? "Operator force-replayed a scheduled job."
      : "Operator replayed a scheduled job.",
    metadata: {
      previousStatus: detail.status,
      retryCount: detail.retryCount,
      maxRetries: detail.maxRetries,
      jobType: detail.jobType,
      ...auditContext
    }
  });

  return jobId;
}

export async function cancelAdminJob(
  jobId: string,
  adminUserId: string,
  auditContext?: OperationAuditContext
) {
  await assertAdminActor(adminUserId);
  const client = getOperationsClient();
  const { data, error } = await client
    .from("scheduled_jobs")
    .select(JOB_SELECT)
    .eq("id", jobId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load scheduled job for cancelation: ${error.message}`);
  }

  if (!data) {
    throw new OperationsError("Scheduled job could not be found.");
  }

  const row = data as JobRow;

  if (isProcessingLocked(row.processing_started_at)) {
    throw new OperationsError("This scheduled job is currently being processed.");
  }

  const detail = await fetchAdminJobDetail(jobId);

  if (!detail) {
    throw new OperationsError("Scheduled job could not be found.");
  }

  canCancelJob(detail);

  const { error: updateError } = await client
    .from("scheduled_jobs")
    .update({
      status: "canceled",
      processed_at: new Date().toISOString(),
      processing_started_at: null,
      processing_token: null
    })
    .eq("id", jobId);

  if (updateError) {
    throw new Error(`Failed to cancel the scheduled job: ${updateError.message}`);
  }

  await recordOperationAuditEvent({
    entityType: "scheduled_job",
    entityId: jobId,
    adminUserId,
    eventType: "canceled",
    eventSummary: "Operator canceled a scheduled job.",
    metadata: {
      previousStatus: detail.status,
      jobType: detail.jobType,
      ...auditContext
    }
  });

  return jobId;
}

async function updateIncidentOwnership(input: {
  entityType: OperationEntityType;
  entityId: string;
  assignedAdminUserId: string | null;
  actingAdminUserId: string;
  eventType: OperationAuditEventType;
  eventSummary: string;
  handoffNote?: string | null;
  blockIfAssignedToOther?: boolean;
  expectedAssignedAdminUserId?: string | null;
  auditContext?: OwnershipAuditContext;
}) {
  const client = getOperationsClient();
  const row = await readIncidentOwnershipState(input.entityType, input.entityId);
  const currentAssignee = row.assigned_admin_user_id ?? null;
  const expectedAssignee = normalizeOwnerExpectation(input.expectedAssignedAdminUserId);

  if (
    input.blockIfAssignedToOther &&
    currentAssignee &&
    currentAssignee !== input.actingAdminUserId
  ) {
    throw new OperationsError("This incident is already assigned to another admin.");
  }

  if (expectedAssignee !== undefined && expectedAssignee !== currentAssignee) {
    throw new OperationsError("Ownership changed before this action completed. Refresh and try again.");
  }

  if (input.assignedAdminUserId) {
    await assertAdminTarget(input.assignedAdminUserId);
  }

  const updatePayload = {
    assigned_admin_user_id: input.assignedAdminUserId,
    assigned_at: input.assignedAdminUserId ? new Date().toISOString() : null,
    handoff_note: input.handoffNote?.trim() ? input.handoffNote.trim() : null
  };
  const { error: updateError } =
    input.entityType === "notification_delivery"
      ? await client
          .from("notification_deliveries")
          .update(updatePayload)
          .eq("id", input.entityId)
      : await client.from("scheduled_jobs").update(updatePayload).eq("id", input.entityId);

  if (updateError) {
    throw new Error(`Failed to update incident ownership: ${updateError.message}`);
  }

  await recordAssignmentHistory({
    entityType: input.entityType,
    entityId: input.entityId,
    previousAdminUserId: currentAssignee,
    newAdminUserId: input.assignedAdminUserId,
    changedByAdminUserId: input.actingAdminUserId,
    handoffNote: input.handoffNote ?? null
  });

  const auditEventId = await recordOperationAuditEvent({
    entityType: input.entityType,
    entityId: input.entityId,
    adminUserId: input.actingAdminUserId,
    eventType: input.eventType,
    eventSummary: input.eventSummary,
    metadata: {
      previousAssignee: currentAssignee,
      nextAssignee: input.assignedAdminUserId,
      handoffNote: input.handoffNote?.trim() || null,
      ...input.auditContext
    }
  });

  const userIds = [input.actingAdminUserId, currentAssignee, input.assignedAdminUserId];
  const labelMap = await fetchAdminUserLabelMap(userIds);
  const actorLabel = labelMap.get(input.actingAdminUserId) ?? input.actingAdminUserId;
  const currentLabel = currentAssignee ? (labelMap.get(currentAssignee) ?? currentAssignee) : "Unassigned";
  const nextLabel = input.assignedAdminUserId
    ? (labelMap.get(input.assignedAdminUserId) ?? input.assignedAdminUserId)
    : "Unassigned";
  const entityLabel = getOperationsEntityLabel(input.entityType);

  await createWatcherNotifications({
    entityType: input.entityType,
    entityId: input.entityId,
    actorAdminUserId: input.actingAdminUserId,
    notificationKind: "owner_change",
    title: "Watched incident assignment changed",
    message: `${actorLabel} changed watched ${entityLabel} ${input.entityId.slice(0, 8)} from ${currentLabel} to ${nextLabel}.`,
    dedupeScope: `ownership:${auditEventId ?? input.eventType}`
  });

  await createSubscriptionNotifications({
    entityType: input.entityType,
    entityId: input.entityId,
    actorAdminUserId: input.actingAdminUserId,
    title: "Subscribed incident ownership changed",
    message: `${actorLabel} changed subscribed ${entityLabel} ${input.entityId.slice(0, 8)} from ${currentLabel} to ${nextLabel}.`,
    dedupeScope: `ownership:${auditEventId ?? input.eventType}`,
    recentlyHandedOff: Boolean(currentAssignee)
  });
}

export async function claimIncidentOwnership(
  entityType: OperationEntityType,
  entityId: string,
  adminUserId: string,
  expectedAssignedAdminUserId?: string | null,
  auditContext?: OwnershipAuditContext
) {
  await assertAdminActor(adminUserId);
  return updateIncidentOwnership({
    entityType,
    entityId,
    assignedAdminUserId: adminUserId,
    actingAdminUserId: adminUserId,
    eventType: "claimed",
    eventSummary: "Operator claimed incident ownership.",
    blockIfAssignedToOther: true,
    expectedAssignedAdminUserId,
    auditContext
  });
}

export async function releaseIncidentOwnership(
  entityType: OperationEntityType,
  entityId: string,
  adminUserId: string,
  expectedAssignedAdminUserId?: string | null,
  auditContext?: OwnershipAuditContext
) {
  await assertAdminActor(adminUserId);
  return updateIncidentOwnership({
    entityType,
    entityId,
    assignedAdminUserId: null,
    actingAdminUserId: adminUserId,
    eventType: "released",
    eventSummary: "Operator released incident ownership.",
    expectedAssignedAdminUserId,
    auditContext
  });
}

export async function assignIncidentOwnership(input: {
  entityType: OperationEntityType;
  entityId: string;
  actingAdminUserId: string;
  assignedAdminUserId: string;
  handoffNote?: string;
  expectedAssignedAdminUserId?: string | null;
  auditContext?: OwnershipAuditContext;
}) {
  await assertAdminActor(input.actingAdminUserId);
  return updateIncidentOwnership({
    entityType: input.entityType,
    entityId: input.entityId,
    assignedAdminUserId: input.assignedAdminUserId,
    actingAdminUserId: input.actingAdminUserId,
    eventType: "reassigned",
    eventSummary: "Operator reassigned incident ownership.",
    handoffNote: input.handoffNote ?? null,
    expectedAssignedAdminUserId: input.expectedAssignedAdminUserId,
    auditContext: input.auditContext
  });
}

export async function updateIncidentWorkflowState(input: {
  entityType: OperationEntityType;
  entityId: string;
  nextWorkflowState: OperationWorkflowState;
  actingAdminUserId: string;
  auditContext?: OperationAuditContext;
}) {
  await assertAdminActor(input.actingAdminUserId);
  const client = getOperationsClient();
  const row = await readIncidentOwnershipState(input.entityType, input.entityId);
  const currentWorkflowState = row.workflow_state;

  canTransitionWorkflowState(currentWorkflowState, input.nextWorkflowState);

  if (currentWorkflowState === input.nextWorkflowState) {
    return input.entityId;
  }

  const updatePayload = {
    workflow_state: input.nextWorkflowState,
    workflow_state_updated_at: new Date().toISOString()
  };
  const { error } =
    input.entityType === "notification_delivery"
      ? await client
          .from("notification_deliveries")
          .update(updatePayload)
          .eq("id", input.entityId)
      : await client.from("scheduled_jobs").update(updatePayload).eq("id", input.entityId);

  if (error) {
    throw new Error(`Failed to update workflow state: ${error.message}`);
  }

  const auditEventId = await recordOperationAuditEvent({
    entityType: input.entityType,
    entityId: input.entityId,
    adminUserId: input.actingAdminUserId,
    eventType: "workflow_state_changed",
    eventSummary: "Operator updated the incident workflow state.",
    metadata: {
      previousWorkflowState: currentWorkflowState,
      nextWorkflowState: input.nextWorkflowState,
      ...input.auditContext
    }
  });

  const labelMap = await fetchAdminUserLabelMap([input.actingAdminUserId]);
  const actorLabel = labelMap.get(input.actingAdminUserId) ?? input.actingAdminUserId;
  const entityLabel = getOperationsEntityLabel(input.entityType);
  const title =
    input.nextWorkflowState === "resolved"
      ? "Watched incident resolved"
      : currentWorkflowState === "resolved"
        ? "Watched incident reopened"
        : "Watched incident workflow changed";

  await createWatcherNotifications({
    entityType: input.entityType,
    entityId: input.entityId,
    actorAdminUserId: input.actingAdminUserId,
    notificationKind:
      input.nextWorkflowState === "resolved" || currentWorkflowState === "resolved"
        ? "resolve"
        : "workflow_change",
    title,
    message: `${actorLabel} moved watched ${entityLabel} ${input.entityId.slice(0, 8)} from ${currentWorkflowState} to ${input.nextWorkflowState}.`,
    dedupeScope: `workflow:${auditEventId ?? input.nextWorkflowState}`
  });

  await createSubscriptionNotifications({
    entityType: input.entityType,
    entityId: input.entityId,
    actorAdminUserId: input.actingAdminUserId,
    title:
      input.nextWorkflowState === "resolved"
        ? "Subscribed incident resolved"
        : currentWorkflowState === "resolved"
          ? "Subscribed incident reopened"
          : "Subscribed incident workflow changed",
    message: `${actorLabel} moved subscribed ${entityLabel} ${input.entityId.slice(0, 8)} from ${currentWorkflowState} to ${input.nextWorkflowState}.`,
    dedupeScope: `workflow:${auditEventId ?? input.nextWorkflowState}`
  });

  return input.entityId;
}

export async function bulkUpdateIncidentWorkflowState(input: {
  entityType: OperationEntityType;
  entityIds: string[];
  nextWorkflowState: OperationWorkflowState;
  adminUserId: string;
}) {
  const selectedIds = normalizeBulkSelection(input.entityIds);

  if (selectedIds.length === 0) {
    throw new OperationsError("Select at least one incident first.");
  }

  const summary = createBulkSummary(selectedIds.length);
  const auditContext = getBulkAuditContext(
    `bulk_workflow_${input.nextWorkflowState}`,
    selectedIds.length
  );

  for (const entityId of selectedIds) {
    try {
      await updateIncidentWorkflowState({
        entityType: input.entityType,
        entityId,
        nextWorkflowState: input.nextWorkflowState,
        actingAdminUserId: input.adminUserId,
        auditContext
      });
      summary.succeeded += 1;
    } catch (error) {
      summarizeFailure(summary, entityId, error);
    }
  }

  return summary;
}

function createBulkSummary(totalSelected: number): BulkActionSummary {
  return {
    totalSelected,
    succeeded: 0,
    failed: 0,
    failureMessages: []
  };
}

function summarizeFailure(summary: BulkActionSummary, itemId: string, error: unknown) {
  summary.failed += 1;
  const message = error instanceof Error ? error.message : "Unknown bulk action error.";

  if (summary.failureMessages.length < 5) {
    summary.failureMessages.push(`${itemId}: ${message}`);
  }
}

function getBulkAuditContext(action: string, totalSelected: number): OperationAuditContext {
  const batchId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    bulkAction: {
      action,
      batchId,
      totalSelected
    }
  };
}

function normalizeBulkSelection(ids: string[]) {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
}

export async function bulkRetryAdminDeliveries(
  deliveryIds: string[],
  force: boolean,
  adminUserId: string
) {
  const selectedIds = normalizeBulkSelection(deliveryIds);

  if (selectedIds.length === 0) {
    throw new OperationsError("Select at least one delivery first.");
  }

  const summary = createBulkSummary(selectedIds.length);
  const auditContext = getBulkAuditContext(
    force ? "bulk_force_retry_deliveries" : "bulk_retry_deliveries",
    selectedIds.length
  );

  for (const deliveryId of selectedIds) {
    try {
      await retryAdminDelivery(deliveryId, force, adminUserId, auditContext);
      summary.succeeded += 1;
    } catch (error) {
      summarizeFailure(summary, deliveryId, error);
    }
  }

  return summary;
}

export async function bulkIgnoreAdminDeliveries(deliveryIds: string[], adminUserId: string) {
  const selectedIds = normalizeBulkSelection(deliveryIds);

  if (selectedIds.length === 0) {
    throw new OperationsError("Select at least one delivery first.");
  }

  const summary = createBulkSummary(selectedIds.length);
  const auditContext = getBulkAuditContext("bulk_ignore_deliveries", selectedIds.length);

  for (const deliveryId of selectedIds) {
    try {
      await ignoreAdminDelivery(deliveryId, adminUserId, auditContext);
      summary.succeeded += 1;
    } catch (error) {
      summarizeFailure(summary, deliveryId, error);
    }
  }

  return summary;
}

export async function bulkReplayAdminJobs(
  jobIds: string[],
  force: boolean,
  adminUserId: string
) {
  const selectedIds = normalizeBulkSelection(jobIds);

  if (selectedIds.length === 0) {
    throw new OperationsError("Select at least one job first.");
  }

  const summary = createBulkSummary(selectedIds.length);
  const auditContext = getBulkAuditContext(
    force ? "bulk_force_replay_jobs" : "bulk_replay_jobs",
    selectedIds.length
  );

  for (const jobId of selectedIds) {
    try {
      await replayAdminJob(jobId, force, adminUserId, auditContext);
      summary.succeeded += 1;
    } catch (error) {
      summarizeFailure(summary, jobId, error);
    }
  }

  return summary;
}

export async function bulkCancelAdminJobs(jobIds: string[], adminUserId: string) {
  const selectedIds = normalizeBulkSelection(jobIds);

  if (selectedIds.length === 0) {
    throw new OperationsError("Select at least one job first.");
  }

  const summary = createBulkSummary(selectedIds.length);
  const auditContext = getBulkAuditContext("bulk_cancel_jobs", selectedIds.length);

  for (const jobId of selectedIds) {
    try {
      await cancelAdminJob(jobId, adminUserId, auditContext);
      summary.succeeded += 1;
    } catch (error) {
      summarizeFailure(summary, jobId, error);
    }
  }

  return summary;
}

export async function bulkClaimIncidents(input: {
  entityType: OperationEntityType;
  entityIds: string[];
  adminUserId: string;
}) {
  const selectedIds = normalizeBulkSelection(input.entityIds);

  if (selectedIds.length === 0) {
    throw new OperationsError("Select at least one incident first.");
  }

  const summary = createBulkSummary(selectedIds.length);
  const auditContext = getBulkAuditContext("bulk_claim_incidents", selectedIds.length);

  for (const entityId of selectedIds) {
    try {
      await claimIncidentOwnership(
        input.entityType,
        entityId,
        input.adminUserId,
        null,
        auditContext
      );
      await recordOperationAuditEvent({
        entityType: input.entityType,
        entityId,
        adminUserId: input.adminUserId,
        eventType: "bulk_claimed",
        eventSummary: "Operator claimed incident ownership through a bulk action.",
        metadata: auditContext
      });
      summary.succeeded += 1;
    } catch (error) {
      summarizeFailure(summary, entityId, error);
    }
  }

  return summary;
}

export async function bulkReleaseIncidents(input: {
  entityType: OperationEntityType;
  entityIds: string[];
  adminUserId: string;
}) {
  const selectedIds = normalizeBulkSelection(input.entityIds);

  if (selectedIds.length === 0) {
    throw new OperationsError("Select at least one incident first.");
  }

  const summary = createBulkSummary(selectedIds.length);
  const auditContext = getBulkAuditContext("bulk_release_incidents", selectedIds.length);

  for (const entityId of selectedIds) {
    try {
      const current = await readIncidentOwnershipState(input.entityType, entityId);
      await releaseIncidentOwnership(
        input.entityType,
        entityId,
        input.adminUserId,
        current.assigned_admin_user_id,
        auditContext
      );
      await recordOperationAuditEvent({
        entityType: input.entityType,
        entityId,
        adminUserId: input.adminUserId,
        eventType: "bulk_released",
        eventSummary: "Operator released incident ownership through a bulk action.",
        metadata: auditContext
      });
      summary.succeeded += 1;
    } catch (error) {
      summarizeFailure(summary, entityId, error);
    }
  }

  return summary;
}

export async function bulkAssignIncidents(input: {
  entityType: OperationEntityType;
  entityIds: string[];
  adminUserId: string;
  assignedAdminUserId: string;
  handoffNote?: string;
}) {
  const selectedIds = normalizeBulkSelection(input.entityIds);

  if (selectedIds.length === 0) {
    throw new OperationsError("Select at least one incident first.");
  }

  if (!input.assignedAdminUserId.trim()) {
    throw new OperationsError("Select an admin to assign these incidents.");
  }

  await assertAdminTarget(input.assignedAdminUserId);

  const summary = createBulkSummary(selectedIds.length);
  const auditContext = {
    ...getBulkAuditContext("bulk_assign_incidents", selectedIds.length),
    explicitOverwrite: true
  };

  for (const entityId of selectedIds) {
    try {
      await assignIncidentOwnership({
        entityType: input.entityType,
        entityId,
        actingAdminUserId: input.adminUserId,
        assignedAdminUserId: input.assignedAdminUserId,
        handoffNote: input.handoffNote,
        auditContext
      });
      await recordOperationAuditEvent({
        entityType: input.entityType,
        entityId,
        adminUserId: input.adminUserId,
        eventType: "bulk_reassigned",
        eventSummary: "Operator reassigned incident ownership through a bulk action.",
        metadata: {
          ...auditContext,
          assignedAdminUserId: input.assignedAdminUserId
        }
      });
      summary.succeeded += 1;
    } catch (error) {
      summarizeFailure(summary, entityId, error);
    }
  }

  return summary;
}

export async function bulkWatchIncidents(input: {
  entityType: OperationEntityType;
  entityIds: string[];
  adminUserId: string;
}) {
  const selectedIds = normalizeBulkSelection(input.entityIds);

  if (selectedIds.length === 0) {
    throw new OperationsError("Select at least one incident first.");
  }

  const summary = createBulkSummary(selectedIds.length);
  const auditContext = getBulkAuditContext("bulk_watch_incidents", selectedIds.length);

  for (const entityId of selectedIds) {
    try {
      const changed = await watchIncident(input.entityType, entityId, input.adminUserId);

      if (changed) {
        await recordOperationAuditEvent({
          entityType: input.entityType,
          entityId,
          adminUserId: input.adminUserId,
          eventType: "watch_started",
          eventSummary: "Operator started watching this incident through a bulk action.",
          metadata: auditContext
        });
      }

      summary.succeeded += 1;
    } catch (error) {
      summarizeFailure(summary, entityId, error);
    }
  }

  return summary;
}

export async function bulkUnwatchIncidents(input: {
  entityType: OperationEntityType;
  entityIds: string[];
  adminUserId: string;
}) {
  const selectedIds = normalizeBulkSelection(input.entityIds);

  if (selectedIds.length === 0) {
    throw new OperationsError("Select at least one incident first.");
  }

  const summary = createBulkSummary(selectedIds.length);
  const auditContext = getBulkAuditContext("bulk_unwatch_incidents", selectedIds.length);

  for (const entityId of selectedIds) {
    try {
      const changed = await unwatchIncident(input.entityType, entityId, input.adminUserId);

      if (changed) {
        await recordOperationAuditEvent({
          entityType: input.entityType,
          entityId,
          adminUserId: input.adminUserId,
          eventType: "watch_removed",
          eventSummary: "Operator stopped watching this incident through a bulk action.",
          metadata: auditContext
        });
      }

      summary.succeeded += 1;
    } catch (error) {
      summarizeFailure(summary, entityId, error);
    }
  }

  return summary;
}

type DeliveryViewAction =
  | "retry"
  | "force_retry"
  | "ignore"
  | "watch"
  | "unwatch"
  | "assign"
  | "release"
  | "workflow_open"
  | "workflow_investigating"
  | "workflow_waiting"
  | "workflow_resolved";

type JobViewAction =
  | "replay"
  | "force_replay"
  | "cancel"
  | "watch"
  | "unwatch"
  | "assign"
  | "release"
  | "workflow_open"
  | "workflow_investigating"
  | "workflow_waiting"
  | "workflow_resolved";

export async function executeDeliveryViewAction(input: {
  filters: AdminDeliveryFilters;
  adminUserId: string;
  action: DeliveryViewAction;
  isConfirmed: boolean;
  assignedAdminUserId?: string;
  handoffNote?: string;
}) {
  const deliveries = await listAdminDeliveries(input.filters, 101, input.adminUserId);
  validateBulkViewExecution(deliveries.length, input.isConfirmed);
  const deliveryIds = deliveries.map((delivery) => delivery.id);

  switch (input.action) {
    case "retry":
      return bulkRetryAdminDeliveries(deliveryIds, false, input.adminUserId);
    case "force_retry":
      return bulkRetryAdminDeliveries(deliveryIds, true, input.adminUserId);
    case "ignore":
      return bulkIgnoreAdminDeliveries(deliveryIds, input.adminUserId);
    case "watch":
      return bulkWatchIncidents({
        entityType: "notification_delivery",
        entityIds: deliveryIds,
        adminUserId: input.adminUserId
      });
    case "unwatch":
      return bulkUnwatchIncidents({
        entityType: "notification_delivery",
        entityIds: deliveryIds,
        adminUserId: input.adminUserId
      });
    case "assign":
      return bulkAssignIncidents({
        entityType: "notification_delivery",
        entityIds: deliveryIds,
        adminUserId: input.adminUserId,
        assignedAdminUserId: input.assignedAdminUserId ?? "",
        handoffNote: input.handoffNote
      });
    case "release":
      return bulkReleaseIncidents({
        entityType: "notification_delivery",
        entityIds: deliveryIds,
        adminUserId: input.adminUserId
      });
    case "workflow_open":
      return bulkUpdateIncidentWorkflowState({
        entityType: "notification_delivery",
        entityIds: deliveryIds,
        nextWorkflowState: "open",
        adminUserId: input.adminUserId
      });
    case "workflow_investigating":
      return bulkUpdateIncidentWorkflowState({
        entityType: "notification_delivery",
        entityIds: deliveryIds,
        nextWorkflowState: "investigating",
        adminUserId: input.adminUserId
      });
    case "workflow_waiting":
      return bulkUpdateIncidentWorkflowState({
        entityType: "notification_delivery",
        entityIds: deliveryIds,
        nextWorkflowState: "waiting",
        adminUserId: input.adminUserId
      });
    case "workflow_resolved":
      return bulkUpdateIncidentWorkflowState({
        entityType: "notification_delivery",
        entityIds: deliveryIds,
        nextWorkflowState: "resolved",
        adminUserId: input.adminUserId
      });
  }
}

export async function executeJobViewAction(input: {
  filters: AdminJobFilters;
  adminUserId: string;
  action: JobViewAction;
  isConfirmed: boolean;
  assignedAdminUserId?: string;
  handoffNote?: string;
}) {
  const jobs = await listAdminJobs(input.filters, 101, input.adminUserId);
  validateBulkViewExecution(jobs.length, input.isConfirmed);
  const jobIds = jobs.map((job) => job.id);

  switch (input.action) {
    case "replay":
      return bulkReplayAdminJobs(jobIds, false, input.adminUserId);
    case "force_replay":
      return bulkReplayAdminJobs(jobIds, true, input.adminUserId);
    case "cancel":
      return bulkCancelAdminJobs(jobIds, input.adminUserId);
    case "watch":
      return bulkWatchIncidents({
        entityType: "scheduled_job",
        entityIds: jobIds,
        adminUserId: input.adminUserId
      });
    case "unwatch":
      return bulkUnwatchIncidents({
        entityType: "scheduled_job",
        entityIds: jobIds,
        adminUserId: input.adminUserId
      });
    case "assign":
      return bulkAssignIncidents({
        entityType: "scheduled_job",
        entityIds: jobIds,
        adminUserId: input.adminUserId,
        assignedAdminUserId: input.assignedAdminUserId ?? "",
        handoffNote: input.handoffNote
      });
    case "release":
      return bulkReleaseIncidents({
        entityType: "scheduled_job",
        entityIds: jobIds,
        adminUserId: input.adminUserId
      });
    case "workflow_open":
      return bulkUpdateIncidentWorkflowState({
        entityType: "scheduled_job",
        entityIds: jobIds,
        nextWorkflowState: "open",
        adminUserId: input.adminUserId
      });
    case "workflow_investigating":
      return bulkUpdateIncidentWorkflowState({
        entityType: "scheduled_job",
        entityIds: jobIds,
        nextWorkflowState: "investigating",
        adminUserId: input.adminUserId
      });
    case "workflow_waiting":
      return bulkUpdateIncidentWorkflowState({
        entityType: "scheduled_job",
        entityIds: jobIds,
        nextWorkflowState: "waiting",
        adminUserId: input.adminUserId
      });
    case "workflow_resolved":
      return bulkUpdateIncidentWorkflowState({
        entityType: "scheduled_job",
        entityIds: jobIds,
        nextWorkflowState: "resolved",
        adminUserId: input.adminUserId
      });
  }
}

export async function executeDeliveryViewWatchPreferenceUpdate(input: {
  filters: AdminDeliveryFilters;
  adminUserId: string;
  isConfirmed: boolean;
  preferences: Partial<{
    isMuted: boolean;
    notifyOnComment: boolean;
    notifyOnOwnerChange: boolean;
    notifyOnWorkflowChange: boolean;
    notifyOnResolve: boolean;
  }>;
}) {
  const deliveries = await listAdminDeliveries(input.filters, 101, input.adminUserId);
  validateBulkViewExecution(deliveries.length, input.isConfirmed);

  return bulkUpdateWatchPreferences({
    entityType: "notification_delivery",
    entityIds: deliveries.map((delivery) => delivery.id),
    adminUserId: input.adminUserId,
    preferences: input.preferences
  });
}

export async function executeJobViewWatchPreferenceUpdate(input: {
  filters: AdminJobFilters;
  adminUserId: string;
  isConfirmed: boolean;
  preferences: Partial<{
    isMuted: boolean;
    notifyOnComment: boolean;
    notifyOnOwnerChange: boolean;
    notifyOnWorkflowChange: boolean;
    notifyOnResolve: boolean;
  }>;
}) {
  const jobs = await listAdminJobs(input.filters, 101, input.adminUserId);
  validateBulkViewExecution(jobs.length, input.isConfirmed);

  return bulkUpdateWatchPreferences({
    entityType: "scheduled_job",
    entityIds: jobs.map((job) => job.id),
    adminUserId: input.adminUserId,
    preferences: input.preferences
  });
}
