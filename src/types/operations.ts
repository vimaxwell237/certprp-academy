import type {
  NotificationDeliveryStatus,
  NotificationTemplateKey,
  ScheduledJobStatus
} from "@/types/delivery";

export type OperationsDeliveryFilter = NotificationDeliveryStatus | "all";

export type OperationsJobFilter = ScheduledJobStatus | "all";

export type OperationEntityType = "notification_delivery" | "scheduled_job";

export type OperationAutomationEntityType =
  | "operation_escalation_rule"
  | "operation_queue_subscription";

export type OperationAuditEntityType = OperationEntityType | OperationAutomationEntityType;

export type OperationWorkflowState = "open" | "investigating" | "waiting" | "resolved";

export type OperationRuleRunMode = "manual" | "automated";

export type OperationRuleRunTrigger = "manual" | "automation";

export type OperationDigestDeliveredVia = "in_app";

export type OperationAutomationRunStatus = "success" | "skipped" | "failed";

export type OperationAutomationControlState = "active" | "muted" | "snoozed";

export type OperationAutomationHealthStatus =
  | "healthy"
  | "warning"
  | "unhealthy"
  | "muted"
  | "snoozed";

export type OperationAutomationAcknowledgementStatus =
  | "unacknowledged"
  | "acknowledged"
  | "investigating"
  | "fixed_pending_rerun"
  | "resolved";

export type OperationAutomationReminderState =
  | "none"
  | "scheduled"
  | "sent"
  | "dismissed";

export type OperationAutomationReminderLastAction =
  | "none"
  | "scheduled"
  | "rescheduled"
  | "dismissed"
  | "snoozed"
  | "sent";

export type OperationAutomationVerificationState =
  | "not_ready"
  | "needs_review"
  | "verified";

export type OperationAutomationVerificationStatus =
  | "not_started"
  | "pending"
  | "completed"
  | "failed";

export type OperationAuditEventType =
  | "retry_requested"
  | "force_retry_requested"
  | "ignored"
  | "canceled"
  | "replay_requested"
  | "claimed"
  | "released"
  | "reassigned"
  | "bulk_claimed"
  | "bulk_released"
  | "bulk_reassigned"
  | "status_changed"
  | "workflow_state_changed"
  | "comment_added"
  | "watch_started"
  | "watch_removed"
  | "watch_preferences_updated"
  | "escalated"
  | "deescalated"
  | "subscription_created"
  | "subscription_updated"
  | "subscription_deleted"
  | "subscription_toggled"
  | "subscription_match_notified"
  | "escalation_rule_created"
  | "escalation_rule_updated"
  | "escalation_rule_deleted"
  | "escalation_rule_toggled"
  | "escalation_rule_applied"
  | "escalation_rule_run_recorded"
  | "subscription_digest_generated"
  | "automation_muted"
  | "automation_unmuted"
  | "automation_snoozed"
  | "automation_resumed"
  | "automation_acknowledgement_updated"
  | "automation_rerun_recorded"
  | "automation_verification_updated"
  | "bulk_subscription_activated"
  | "bulk_subscription_deactivated"
  | "bulk_subscription_deleted"
  | "bulk_subscription_duplicated"
  | "note_added";

export type OperationsSortOption =
  | "newest"
  | "oldest"
  | "highest_retry_count"
  | "recently_failed";

export interface AdminTriageIssue {
  code: string;
  label: string;
  severity: "warning" | "danger";
}

export interface OperationNoteRecord {
  id: string;
  entityType: OperationEntityType;
  entityId: string;
  adminUserId: string;
  adminUserLabel: string;
  noteBody: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperationAuditEventRecord {
  id: string;
  entityType: OperationAuditEntityType;
  entityId: string;
  adminUserId: string | null;
  adminUserLabel: string | null;
  eventType: OperationAuditEventType;
  eventSummary: string;
  metadataPreview: string | null;
  createdAt: string;
}

export interface AdminOperatorOption {
  userId: string;
  label: string;
  handle: string;
}

export interface OperationCommentRecord {
  id: string;
  entityType: OperationEntityType;
  entityId: string;
  adminUserId: string;
  adminUserLabel: string;
  adminUserHandle: string;
  commentBody: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperationSavedViewRecord {
  id: string;
  adminUserId: string;
  entityType: OperationEntityType;
  name: string;
  filters: AdminDeliveryFilters | AdminJobFilters;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OperationQueueSubscriptionRecord {
  id: string;
  adminUserId: string;
  entityType: OperationEntityType;
  name: string;
  filters: AdminDeliveryFilters | AdminJobFilters;
  isActive: boolean;
  automationState: OperationAutomationControlState;
  healthStatus: OperationAutomationHealthStatus;
  isMuted: boolean;
  snoozedUntil: string | null;
  mutedOrSnoozedReason: string | null;
  currentMatchCount: number;
  escalatedMatchCount: number;
  staleMatchCount: number;
  matchExplanation: string;
  digestCooldownMinutes: number;
  lastDigestAt: string | null;
  lastDigestHash: string | null;
  consecutiveSkipCount: number;
  consecutiveFailureCount: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastSkipReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OperationEscalationRuleRecord {
  id: string;
  createdByAdminUserId: string;
  entityType: OperationEntityType;
  name: string;
  filters: AdminDeliveryFilters | AdminJobFilters;
  escalationReason: string;
  isActive: boolean;
  automationState: OperationAutomationControlState;
  healthStatus: OperationAutomationHealthStatus;
  isMuted: boolean;
  snoozedUntil: string | null;
  mutedOrSnoozedReason: string | null;
  runMode: OperationRuleRunMode;
  cooldownMinutes: number;
  maxMatchesPerRun: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  consecutiveSkipCount: number;
  consecutiveFailureCount: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastSkipReason: string | null;
  currentMatchCount: number;
  matchExplanation: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperationEscalationRuleRunRecord {
  id: string;
  operationEscalationRuleId: string;
  triggeredBy: OperationRuleRunTrigger;
  triggeredByAdminUserId: string | null;
  triggeredByAdminUserLabel: string | null;
  matchedCount: number;
  escalatedCount: number;
  skippedCount: number;
  runStatus: OperationAutomationRunStatus;
  skipReason: string | null;
  failureReason: string | null;
  durationMs: number | null;
  runSummary: string;
  createdAt: string;
}

export interface OperationSubscriptionDigestRunRecord {
  id: string;
  operationQueueSubscriptionId: string;
  triggeredBy: OperationRuleRunTrigger;
  triggeredByAdminUserId: string | null;
  triggeredByAdminUserLabel: string | null;
  matchCount: number;
  runStatus: OperationAutomationRunStatus;
  skipReason: string | null;
  failureReason: string | null;
  durationMs: number | null;
  digestSummary: string;
  deliveredVia: OperationDigestDeliveredVia;
  createdAt: string;
}

export interface OperationWatcherRecord {
  id: string;
  entityType: OperationEntityType;
  entityId: string;
  adminUserId: string;
  adminUserLabel: string;
  adminUserHandle: string;
  isMuted: boolean;
  notifyOnComment: boolean;
  notifyOnOwnerChange: boolean;
  notifyOnWorkflowChange: boolean;
  notifyOnResolve: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OperationAssignmentHistoryRecord {
  id: string;
  entityType: OperationEntityType;
  entityId: string;
  previousAdminUserId: string | null;
  previousAdminUserLabel: string | null;
  newAdminUserId: string | null;
  newAdminUserLabel: string | null;
  changedByAdminUserId: string;
  changedByAdminUserLabel: string;
  handoffNote: string | null;
  createdAt: string;
}

export interface AdminFailureCategory {
  entityType: OperationEntityType;
  label: string;
  count: number;
}

export interface AdminOperationsMetric {
  label: string;
  value: number;
  tone?: "default" | "warning" | "danger" | "success";
}

export interface OperationAutomationReasonSummary {
  reason: string;
  count: number;
  kind: "skip" | "failure";
}

export interface OperationAutomationGuidance {
  tone: "info" | "warning" | "danger";
  message: string;
}

export interface OperationAutomationAcknowledgementRecord {
  id: string;
  entityType: OperationAutomationEntityType;
  entityId: string;
  adminUserId: string;
  adminUserLabel: string;
  status: OperationAutomationAcknowledgementStatus;
  note: string | null;
  assignedAdminUserId: string | null;
  assignedAdminUserLabel: string | null;
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
  verificationCompletedByAdminUserLabel: string | null;
  verificationNotes: string | null;
  isOverdue: boolean;
  nextFollowUpAction: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OperationRemediationPlaybook {
  category:
    | "cooldown_active"
    | "zero_match_pattern"
    | "same_failure_pattern"
    | "muted_or_snoozed"
    | "max_match_capped"
    | "stale_filter_pattern"
    | "repeated_automation_failure";
  title: string;
  summary: string;
  steps: string[];
  severity: "info" | "warning" | "danger";
}

export interface OperationRerunReadiness {
  status: "ready" | "caution" | "blocked";
  summary: string;
}

export interface OperationPostRerunVerificationGuidance {
  tone: "info" | "warning" | "success";
  title: string;
  summary: string;
  steps: string[];
}

export interface OperationAutomationTrendSummary {
  key: "24h" | "7d" | "30runs";
  label: string;
  totalRuns: number;
  successes: number;
  skipped: number;
  failures: number;
  latestMatchCount: number | null;
  averageMatchCount: number | null;
  topSkipReasons: OperationAutomationReasonSummary[];
  topFailureReasons: OperationAutomationReasonSummary[];
}

export interface AdminOperationsSummary {
  deliveries: {
    pending: number;
    failed: number;
    sent: number;
    ignored: number;
    needingAttention: number;
    failedNeedingAttention: number;
    stalePending: number;
    assignedToMe: number;
    unassignedNeedingAttention: number;
    investigating: number;
    waiting: number;
    resolved: number;
  };
  jobs: {
    pending: number;
    failed: number;
    processed: number;
    canceled: number;
    needingAttention: number;
    failedNeedingAttention: number;
    stalePending: number;
    assignedToMe: number;
    unassignedNeedingAttention: number;
    investigating: number;
    waiting: number;
    resolved: number;
  };
  myAssignedIncidents: number;
  investigating: number;
  waiting: number;
  resolvedToday: number;
  unassignedNeedingAttention: number;
  recentlyHandedOff: number;
  recentComments: number;
  watchedIncidents: number;
  mutedWatchedIncidents: number;
  watchedUnresolvedIncidents: number;
  activeSubscriptions: number;
  escalatedIncidents: number;
  watchedByTeamIncidents: number;
  unassignedEscalatedIncidents: number;
  activeEscalationRules: number;
  activeAutomatedRules: number;
  recentRuleRuns: number;
  recentDigestRuns: number;
  rulesInCooldown: number;
  subscriptionsWithActiveMatches: number;
  mutedRules: number;
  snoozedSubscriptions: number;
  unhealthyRules: number;
  unhealthySubscriptions: number;
  healthyAutomation: number;
  warningAutomation: number;
  unhealthyAutomation: number;
  recentSkippedRuns: number;
  recentFailedRuns: number;
  unacknowledgedUnhealthyAutomation: number;
  acknowledgedUnresolvedAutomation: number;
  fixedPendingRerunAutomation: number;
  resolvedRecentlyAutomation: number;
  assignedUnhealthyAutomation: number;
  unassignedUnhealthyAutomation: number;
  overdueAcknowledgementReminders: number;
  fixedPendingRerunAwaitingVerification: number;
  overdueAssignedAutomation: number;
  verificationPendingAutomation: number;
  verificationFailedAutomation: number;
  dismissedReminderAutomation: number;
  snoozedReminderAutomation: number;
}

export interface AdminOperationsSnapshot {
  summary: AdminOperationsSummary;
  warning: string | null;
}

export interface AdminDeliveryFilters {
  status: OperationsDeliveryFilter;
  userId: string;
  channel: "all" | string;
  templateKey: "all" | NotificationTemplateKey;
  relatedEntityType: string;
  needsAttention: boolean;
  ownership: "all" | "assigned_to_me" | "unassigned";
  workflowState: "all" | OperationWorkflowState;
  recentlyHandedOff: boolean;
  watchedOnly: boolean;
  escalatedOnly: boolean;
  sort: OperationsSortOption;
}

export interface AdminJobFilters {
  status: OperationsJobFilter;
  userId: string;
  jobType: "all" | string;
  relatedEntityType: string;
  needsAttention: boolean;
  ownership: "all" | "assigned_to_me" | "unassigned";
  workflowState: "all" | OperationWorkflowState;
  recentlyHandedOff: boolean;
  watchedOnly: boolean;
  escalatedOnly: boolean;
  sort: OperationsSortOption;
}

export interface AdminDeliveryRecord {
  id: string;
  notificationId: string | null;
  userId: string;
  channel: string;
  templateKey: NotificationTemplateKey;
  status: NotificationDeliveryStatus;
  retryCount: number;
  maxRetries: number;
  errorMessage: string | null;
  sentAt: string | null;
  lastAttemptedAt: string | null;
  createdAt: string;
  nextAttemptAt: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  assignedAdminUserId: string | null;
  assignedAdminUserLabel: string | null;
  assignedAt: string | null;
  handoffNote: string | null;
  workflowState: OperationWorkflowState;
  workflowStateUpdatedAt: string | null;
  isEscalated: boolean;
  escalatedAt: string | null;
  escalatedByAdminUserId: string | null;
  escalatedByAdminUserLabel: string | null;
  escalationReason: string | null;
  watcherCount: number;
  watchedByTeam: boolean;
  teamAttention: boolean;
  needsAttention: boolean;
  triageIssues: AdminTriageIssue[];
}

export interface AdminScheduledJobRecord {
  id: string;
  userId: string;
  jobType: string;
  relatedEntityType: string;
  relatedEntityId: string;
  status: ScheduledJobStatus;
  retryCount: number;
  maxRetries: number;
  scheduledFor: string;
  processedAt: string | null;
  errorMessage: string | null;
  lastAttemptedAt: string | null;
  createdAt: string;
  payloadPreview: string;
  assignedAdminUserId: string | null;
  assignedAdminUserLabel: string | null;
  assignedAt: string | null;
  handoffNote: string | null;
  workflowState: OperationWorkflowState;
  workflowStateUpdatedAt: string | null;
  isEscalated: boolean;
  escalatedAt: string | null;
  escalatedByAdminUserId: string | null;
  escalatedByAdminUserLabel: string | null;
  escalationReason: string | null;
  watcherCount: number;
  watchedByTeam: boolean;
  teamAttention: boolean;
  needsAttention: boolean;
  triageIssues: AdminTriageIssue[];
}

export interface AdminDeliveryDetail extends AdminDeliveryRecord {
  notificationTitle: string | null;
  notificationMessage: string | null;
  linkUrl: string | null;
  externalMessageId: string | null;
  notes: OperationNoteRecord[];
  comments: OperationCommentRecord[];
  watchers: OperationWatcherRecord[];
  matchingSubscriptions: OperationQueueSubscriptionRecord[];
  auditEvents: OperationAuditEventRecord[];
  assignmentHistory: OperationAssignmentHistoryRecord[];
}

export interface AdminScheduledJobDetail extends AdminScheduledJobRecord {
  dedupeKey: string | null;
  payload: string;
  notes: OperationNoteRecord[];
  comments: OperationCommentRecord[];
  watchers: OperationWatcherRecord[];
  matchingSubscriptions: OperationQueueSubscriptionRecord[];
  auditEvents: OperationAuditEventRecord[];
  assignmentHistory: OperationAssignmentHistoryRecord[];
}

export interface AdminOperationsOverview {
  summary: AdminOperationsSummary;
  recentDeliveries: AdminDeliveryRecord[];
  recentJobs: AdminScheduledJobRecord[];
  recentActions: OperationAuditEventRecord[];
  topFailureCategories: AdminFailureCategory[];
  myAssignedDeliveries: AdminDeliveryRecord[];
  myAssignedJobs: AdminScheduledJobRecord[];
  recentlyHandedOffDeliveries: AdminDeliveryRecord[];
  recentlyHandedOffJobs: AdminScheduledJobRecord[];
  watchedDeliveries: AdminDeliveryRecord[];
  watchedJobs: AdminScheduledJobRecord[];
  escalatedDeliveries: AdminDeliveryRecord[];
  escalatedJobs: AdminScheduledJobRecord[];
  subscribedDeliveryViews: OperationQueueSubscriptionRecord[];
  subscribedJobViews: OperationQueueSubscriptionRecord[];
  escalationDeliveryRules: OperationEscalationRuleRecord[];
  escalationJobRules: OperationEscalationRuleRecord[];
  recentEscalationRuleRuns: OperationEscalationRuleRunRecord[];
  recentSubscriptionDigestRuns: OperationSubscriptionDigestRunRecord[];
  topSkipReasons: OperationAutomationReasonSummary[];
  topFailureReasons: OperationAutomationReasonSummary[];
  unhealthyAutomationRules: OperationEscalationRuleRecord[];
  unhealthyAutomationSubscriptions: OperationQueueSubscriptionRecord[];
  needingAcknowledgementRules: OperationEscalationRuleRecord[];
  needingAcknowledgementSubscriptions: OperationQueueSubscriptionRecord[];
  overdueFollowUpRules: OperationEscalationRuleRecord[];
  overdueFollowUpSubscriptions: OperationQueueSubscriptionRecord[];
  defaultDeliveryView: OperationSavedViewRecord | null;
  defaultJobView: OperationSavedViewRecord | null;
  warning: string | null;
}

export interface OperationEscalationRuleDetail {
  rule: OperationEscalationRuleRecord;
  recentRuns: OperationEscalationRuleRunRecord[];
  trendWindows: OperationAutomationTrendSummary[];
  rerunGuidance: OperationAutomationGuidance[];
  acknowledgement: OperationAutomationAcknowledgementRecord | null;
  acknowledgementHistory: OperationAutomationAcknowledgementRecord[];
  remediationPlaybooks: OperationRemediationPlaybook[];
  rerunReadiness: OperationRerunReadiness;
  verificationGuidance: OperationPostRerunVerificationGuidance | null;
}

export interface OperationQueueSubscriptionDetail {
  subscription: OperationQueueSubscriptionRecord;
  recentRuns: OperationSubscriptionDigestRunRecord[];
  trendWindows: OperationAutomationTrendSummary[];
  rerunGuidance: OperationAutomationGuidance[];
  acknowledgement: OperationAutomationAcknowledgementRecord | null;
  acknowledgementHistory: OperationAutomationAcknowledgementRecord[];
  remediationPlaybooks: OperationRemediationPlaybook[];
  rerunReadiness: OperationRerunReadiness;
  verificationGuidance: OperationPostRerunVerificationGuidance | null;
}

export interface BulkActionSummary {
  totalSelected: number;
  succeeded: number;
  failed: number;
  failureMessages: string[];
}
