"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addOperationComment,
  addAdminOperationNote,
  assignIncidentOwnership,
  bulkAssignIncidents,
  bulkCancelAdminJobs,
  bulkClaimIncidents,
  bulkIgnoreAdminDeliveries,
  bulkManageQueueSubscriptions,
  bulkReplayAdminJobs,
  bulkReleaseIncidents,
  bulkRetryAdminDeliveries,
  bulkUnwatchIncidents,
  bulkUpdateWatchPreferences,
  bulkUpdateIncidentWorkflowState,
  bulkWatchIncidents,
  cancelAdminJob,
  claimIncidentOwnership,
  createOperationQueueSubscription,
  createOperationEscalationRule,
  createOperationSavedView,
  deleteOperationQueueSubscription,
  deleteOperationEscalationRule,
  deleteOperationSavedView,
  executeDeliveryViewAction,
  executeDeliveryViewWatchPreferenceUpdate,
  executeJobViewAction,
  executeJobViewWatchPreferenceUpdate,
  releaseIncidentOwnership,
  ignoreAdminDelivery,
  replayAdminJob,
  retryAdminDelivery,
  setIncidentEscalation,
  applyOperationEscalationRule,
  generateOperationSubscriptionDigest,
  recordOperationAutomationRerunOutcome,
  updateOperationAutomationReminderLifecycle,
  updateOperationAutomationVerification,
  updateOperationEscalationRuleAutomationControl,
  updateOperationQueueSubscription,
  updateOperationQueueSubscriptionAutomationControl,
  updateOperationAutomationAcknowledgement,
  updateOperationEscalationRule,
  updateWatchPreferences,
  updateOperationSavedView,
  updateIncidentWorkflowState,
  unwatchIncident,
  watchIncident
} from "@/features/operations/data/operations-service";
import {
  normalizeDeliverySavedViewFilters,
  normalizeJobSavedViewFilters
} from "@/features/operations/lib/collaboration";
import { buildSnoozePresetTimestamp, type SnoozePreset } from "@/features/operations/lib/health";
import { OperationsError } from "@/features/operations/lib/validation";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { requireAdminUser } from "@/lib/auth/roles";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { sanitizeInternalPath } from "@/lib/navigation/safe-path";
import type {
  AdminDeliveryFilters,
  AdminJobFilters,
  OperationAutomationAcknowledgementStatus,
  OperationAutomationEntityType,
  OperationAutomationVerificationStatus
} from "@/types/operations";

function resolveReturnPath(raw: FormDataEntryValue | null, fallback: string) {
  return sanitizeInternalPath(typeof raw === "string" ? raw : null, fallback, {
    allowedPrefixes: [APP_ROUTES.adminOperations]
  });
}

function getAdminActionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof OperationsError) {
    return error.message;
  }

  return getPublicErrorMessage(error, fallback);
}

function revalidateOperationsPaths() {
  [
    APP_ROUTES.admin,
    APP_ROUTES.adminOperations,
    APP_ROUTES.adminOperationsDeliveries,
    APP_ROUTES.adminOperationsJobs,
    APP_ROUTES.adminOperationsRules,
    APP_ROUTES.adminOperationsSubscriptions
  ].forEach((path) => {
    revalidatePath(path);
  });
}

function redirectWithMessage(
  returnTo: string,
  state: {
    success?: string;
    error?: string;
    warning?: string;
  }
) {
  const params = new URLSearchParams();

  if (state.success) {
    params.set("success", state.success);
  }

  if (state.error) {
    params.set("error", state.error);
  }

  if (state.warning) {
    params.set("warning", state.warning);
  }

  const query = params.toString();
  redirect(query ? `${returnTo}?${query}` : returnTo);
}

async function handleOperation(
  formData: FormData,
  fallbackPath: string,
  execute: (adminUserId: string) => Promise<void>,
  successMessage: string
) {
  const adminUser = await requireAdminUser();
  const returnTo = resolveReturnPath(formData.get("returnTo"), fallbackPath);

  try {
    await execute(adminUser.id);
  } catch (error) {
    const message = getAdminActionErrorMessage(
      error,
      "We could not complete that admin action right now."
    );
    redirectWithMessage(returnTo, { error: message });
  }

  revalidateOperationsPaths();
  revalidatePath(returnTo);
  redirectWithMessage(returnTo, { success: successMessage });
}

export async function retryDeliveryAction(formData: FormData) {
  const deliveryId = String(formData.get("deliveryId") ?? "");
  const force = String(formData.get("force")) === "true";

  return handleOperation(
    formData,
    APP_ROUTES.adminOperationsDeliveries,
    async (adminUserId) => {
      await retryAdminDelivery(deliveryId, force, adminUserId);
    },
    force ? "Delivery force-queued for resend." : "Delivery queued for resend."
  );
}

export async function ignoreDeliveryAction(formData: FormData) {
  const deliveryId = String(formData.get("deliveryId") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperationsDeliveries,
    async (adminUserId) => {
      await ignoreAdminDelivery(deliveryId, adminUserId);
    },
    "Delivery marked as ignored."
  );
}

export async function replayJobAction(formData: FormData) {
  const jobId = String(formData.get("jobId") ?? "");
  const force = String(formData.get("force")) === "true";

  return handleOperation(
    formData,
    APP_ROUTES.adminOperationsJobs,
    async (adminUserId) => {
      await replayAdminJob(jobId, force, adminUserId);
    },
    force ? "Job force-queued for replay." : "Job queued for replay."
  );
}

export async function cancelJobAction(formData: FormData) {
  const jobId = String(formData.get("jobId") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperationsJobs,
    async (adminUserId) => {
      await cancelAdminJob(jobId, adminUserId);
    },
    "Job canceled."
  );
}

export async function addOperationNoteAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const entityId = String(formData.get("entityId") ?? "");
  const noteBody = String(formData.get("noteBody") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await addAdminOperationNote({
        entityType: entityType as "notification_delivery" | "scheduled_job",
        entityId,
        adminUserId,
        noteBody
      });
    },
    "Note saved."
  );
}

function readSelectedIds(formData: FormData) {
  return formData
    .getAll("selectedIds")
    .map((value) => String(value))
    .filter(Boolean);
}

function resolveAutomationSnoozedUntil(formData: FormData) {
  const preset = String(formData.get("snoozePreset") ?? "") as SnoozePreset | "";
  const rawValue = String(formData.get("snoozedUntil") ?? "").trim();

  if (preset) {
    return buildSnoozePresetTimestamp(preset);
  }

  return rawValue || null;
}

function formatBulkSummary(prefix: string, summary: {
  succeeded: number;
  failed: number;
  totalSelected: number;
  failureMessages: string[];
}) {
  const message = `${prefix} ${summary.succeeded}/${summary.totalSelected} succeeded`;

  return summary.failed > 0
    ? `${message}; ${summary.failed} failed. ${summary.failureMessages.join(" | ")}`
    : `${message}.`;
}

export async function bulkRetryDeliveriesAction(formData: FormData) {
  const force = String(formData.get("force")) === "true";
  const selectedIds = readSelectedIds(formData);

  return handleOperation(
    formData,
    APP_ROUTES.adminOperationsDeliveries,
    async (adminUserId) => {
      const summary = await bulkRetryAdminDeliveries(selectedIds, force, adminUserId);
      if (summary.failed > 0) {
        throw new OperationsError(
          formatBulkSummary(
            force ? "Force retry completed:" : "Bulk retry completed:",
            summary
          )
        );
      }
    },
    force ? "Selected deliveries force-queued." : "Selected deliveries queued."
  );
}

export async function bulkIgnoreDeliveriesAction(formData: FormData) {
  const selectedIds = readSelectedIds(formData);

  return handleOperation(
    formData,
    APP_ROUTES.adminOperationsDeliveries,
    async (adminUserId) => {
      const summary = await bulkIgnoreAdminDeliveries(selectedIds, adminUserId);
      if (summary.failed > 0) {
        throw new OperationsError(formatBulkSummary("Bulk ignore completed:", summary));
      }
    },
    "Selected deliveries ignored."
  );
}

export async function bulkReplayJobsAction(formData: FormData) {
  const force = String(formData.get("force")) === "true";
  const selectedIds = readSelectedIds(formData);

  return handleOperation(
    formData,
    APP_ROUTES.adminOperationsJobs,
    async (adminUserId) => {
      const summary = await bulkReplayAdminJobs(selectedIds, force, adminUserId);
      if (summary.failed > 0) {
        throw new OperationsError(
          formatBulkSummary(
            force ? "Force replay completed:" : "Bulk replay completed:",
            summary
          )
        );
      }
    },
    force ? "Selected jobs force-queued." : "Selected jobs queued."
  );
}

export async function bulkCancelJobsAction(formData: FormData) {
  const selectedIds = readSelectedIds(formData);

  return handleOperation(
    formData,
    APP_ROUTES.adminOperationsJobs,
    async (adminUserId) => {
      const summary = await bulkCancelAdminJobs(selectedIds, adminUserId);
      if (summary.failed > 0) {
        throw new OperationsError(formatBulkSummary("Bulk cancel completed:", summary));
      }
    },
    "Selected jobs canceled."
  );
}

export async function claimOwnershipAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const entityId = String(formData.get("entityId") ?? "");
  const expectedAssignedAdminUserId = String(formData.get("expectedAssignedAdminUserId") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await claimIncidentOwnership(
        entityType as "notification_delivery" | "scheduled_job",
        entityId,
        adminUserId,
        expectedAssignedAdminUserId || null
      );
    },
    "Ownership claimed."
  );
}

export async function releaseOwnershipAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const entityId = String(formData.get("entityId") ?? "");
  const expectedAssignedAdminUserId = String(formData.get("expectedAssignedAdminUserId") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await releaseIncidentOwnership(
        entityType as "notification_delivery" | "scheduled_job",
        entityId,
        adminUserId,
        expectedAssignedAdminUserId || null
      );
    },
    "Ownership released."
  );
}

export async function assignOwnershipAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const entityId = String(formData.get("entityId") ?? "");
  const assignedAdminUserId = String(formData.get("assignedAdminUserId") ?? "");
  const handoffNote = String(formData.get("handoffNote") ?? "");
  const expectedAssignedAdminUserId = String(formData.get("expectedAssignedAdminUserId") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await assignIncidentOwnership({
        entityType: entityType as "notification_delivery" | "scheduled_job",
        entityId,
        actingAdminUserId: adminUserId,
        assignedAdminUserId,
        handoffNote,
        expectedAssignedAdminUserId: expectedAssignedAdminUserId || null
      });
    },
    "Ownership updated."
  );
}

export async function updateWorkflowStateAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const entityId = String(formData.get("entityId") ?? "");
  const workflowState = String(formData.get("workflowState") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await updateIncidentWorkflowState({
        entityType: entityType as "notification_delivery" | "scheduled_job",
        entityId,
        nextWorkflowState: workflowState as
          | "open"
          | "investigating"
          | "waiting"
          | "resolved",
        actingAdminUserId: adminUserId
      });
    },
    "Workflow state updated."
  );
}

export async function bulkWorkflowStateAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const workflowState = String(formData.get("workflowState") ?? "");
  const selectedIds = readSelectedIds(formData);

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      const summary = await bulkUpdateIncidentWorkflowState({
        entityType: entityType as "notification_delivery" | "scheduled_job",
        entityIds: selectedIds,
        nextWorkflowState: workflowState as "open" | "investigating" | "waiting" | "resolved",
        adminUserId
      });

      if (summary.failed > 0) {
        throw new OperationsError(formatBulkSummary("Bulk workflow update completed:", summary));
      }
    },
    "Selected incidents updated."
  );
}

export async function bulkClaimOwnershipAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const selectedIds = readSelectedIds(formData);

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      const summary = await bulkClaimIncidents({
        entityType: entityType as "notification_delivery" | "scheduled_job",
        entityIds: selectedIds,
        adminUserId
      });
      if (summary.failed > 0) {
        throw new OperationsError(formatBulkSummary("Bulk claim completed:", summary));
      }
    },
    "Selected incidents claimed."
  );
}

export async function bulkReleaseOwnershipAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const selectedIds = readSelectedIds(formData);

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      const summary = await bulkReleaseIncidents({
        entityType: entityType as "notification_delivery" | "scheduled_job",
        entityIds: selectedIds,
        adminUserId
      });
      if (summary.failed > 0) {
        throw new OperationsError(formatBulkSummary("Bulk release completed:", summary));
      }
    },
    "Selected incidents released."
  );
}

export async function bulkAssignOwnershipAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const selectedIds = readSelectedIds(formData);
  const assignedAdminUserId = String(formData.get("assignedAdminUserId") ?? "");
  const handoffNote = String(formData.get("handoffNote") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      const summary = await bulkAssignIncidents({
        entityType: entityType as "notification_delivery" | "scheduled_job",
        entityIds: selectedIds,
        adminUserId,
        assignedAdminUserId,
        handoffNote
      });
      if (summary.failed > 0) {
        throw new OperationsError(formatBulkSummary("Bulk assignment completed:", summary));
      }
    },
    "Selected incidents assigned."
  );
}

export async function bulkWatchIncidentsAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const selectedIds = readSelectedIds(formData);

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      const summary = await bulkWatchIncidents({
        entityType: entityType as "notification_delivery" | "scheduled_job",
        entityIds: selectedIds,
        adminUserId
      });
      if (summary.failed > 0) {
        throw new OperationsError(formatBulkSummary("Bulk watch completed:", summary));
      }
    },
    "Selected incidents added to your watch list."
  );
}

export async function bulkUnwatchIncidentsAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const selectedIds = readSelectedIds(formData);

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      const summary = await bulkUnwatchIncidents({
        entityType: entityType as "notification_delivery" | "scheduled_job",
        entityIds: selectedIds,
        adminUserId
      });
      if (summary.failed > 0) {
        throw new OperationsError(formatBulkSummary("Bulk unwatch completed:", summary));
      }
    },
    "Selected incidents removed from your watch list."
  );
}

function readWatchPreferencesFromForm(formData: FormData) {
  const preferenceKey = String(formData.get("preferenceKey") ?? "");
  const isEnabled = String(formData.get("preferenceValue") ?? "") === "true";

  switch (preferenceKey) {
    case "isMuted":
      return { isMuted: isEnabled };
    case "notifyOnComment":
      return { notifyOnComment: isEnabled };
    case "notifyOnOwnerChange":
      return { notifyOnOwnerChange: isEnabled };
    case "notifyOnWorkflowChange":
      return { notifyOnWorkflowChange: isEnabled };
    case "notifyOnResolve":
      return { notifyOnResolve: isEnabled };
    default:
      throw new OperationsError("Select a valid watch preference first.");
  }
}

export async function bulkUpdateWatchPreferencesAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const selectedIds = readSelectedIds(formData);

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      const summary = await bulkUpdateWatchPreferences({
        entityType: entityType as "notification_delivery" | "scheduled_job",
        entityIds: selectedIds,
        adminUserId,
        preferences: readWatchPreferencesFromForm(formData)
      });

      if (summary.failed > 0) {
        throw new OperationsError(
          formatBulkSummary("Bulk watch-preference update completed:", summary)
        );
      }
    },
    "Selected watch preferences updated."
  );
}

function readFiltersFromJson(
  entityType: "notification_delivery" | "scheduled_job",
  raw: string
) {
  let parsed: unknown = {};

  if (raw.trim()) {
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      throw new OperationsError("Saved view filters are not valid JSON.");
    }
  }

  return entityType === "notification_delivery"
    ? normalizeDeliverySavedViewFilters(parsed as Record<string, unknown>)
    : normalizeJobSavedViewFilters(parsed as Record<string, unknown>);
}

export async function createSavedViewAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "") as
    | "notification_delivery"
    | "scheduled_job";
  const name = String(formData.get("name") ?? "");
  const filtersJson = String(formData.get("filtersJson") ?? "");
  const isDefault = String(formData.get("isDefault")) === "true";

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await createOperationSavedView({
        adminUserId,
        entityType,
        name,
        filters: readFiltersFromJson(entityType, filtersJson),
        isDefault
      });
    },
    "Saved view created."
  );
}

export async function createQueueSubscriptionAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "") as
    | "notification_delivery"
    | "scheduled_job";
  const name = String(formData.get("name") ?? "");
  const filtersJson = String(formData.get("filtersJson") ?? "");
  const isActive = formData.has("isActive") && String(formData.get("isActive")) === "true";
  const digestCooldownMinutes = Number(formData.get("digestCooldownMinutes") ?? "180");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await createOperationQueueSubscription({
        adminUserId,
        entityType,
        name,
        filters: readFiltersFromJson(entityType, filtersJson),
        isActive,
        digestCooldownMinutes: Number.isFinite(digestCooldownMinutes)
          ? Math.max(0, Math.floor(digestCooldownMinutes))
          : 180
      });
    },
    "Queue subscription created."
  );
}

export async function updateQueueSubscriptionAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "") as
    | "notification_delivery"
    | "scheduled_job";
  const subscriptionId = String(formData.get("subscriptionId") ?? "");
  const name = String(formData.get("name") ?? "");
  const filtersJson = String(formData.get("filtersJson") ?? "");
  const replaceFilters = String(formData.get("replaceFilters")) === "true";
  const isActive = String(formData.get("isActive")) === "true";
  const digestCooldownMinutes = Number(formData.get("digestCooldownMinutes") ?? "180");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await updateOperationQueueSubscription({
        subscriptionId,
        adminUserId,
        name,
        isActive,
        digestCooldownMinutes: Number.isFinite(digestCooldownMinutes)
          ? Math.max(0, Math.floor(digestCooldownMinutes))
          : undefined,
        filters: replaceFilters ? readFiltersFromJson(entityType, filtersJson) : undefined
      });
    },
    "Queue subscription updated."
  );
}

export async function deleteQueueSubscriptionAction(formData: FormData) {
  const subscriptionId = String(formData.get("subscriptionId") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await deleteOperationQueueSubscription(subscriptionId, adminUserId);
    },
    "Queue subscription deleted."
  );
}

export async function updateQueueSubscriptionAutomationControlAction(formData: FormData) {
  const subscriptionId = String(formData.get("subscriptionId") ?? "");
  const action = String(formData.get("automationAction") ?? "") as
    | "mute"
    | "unmute"
    | "snooze"
    | "resume";
  const snoozedUntil = resolveAutomationSnoozedUntil(formData);
  const reason = String(formData.get("automationReason") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await updateOperationQueueSubscriptionAutomationControl({
        subscriptionId,
        adminUserId,
        action,
        snoozedUntil,
        reason: reason || null
      });
    },
    action === "mute"
      ? "Subscription automation muted."
      : action === "unmute"
        ? "Subscription automation unmuted."
        : action === "snooze"
          ? "Subscription automation snoozed."
          : "Subscription automation resumed."
  );
}

function readSelectedSubscriptionIds(formData: FormData) {
  return formData
    .getAll("selectedSubscriptionIds")
    .map((value) => String(value))
    .filter(Boolean);
}

export async function bulkQueueSubscriptionsAction(formData: FormData) {
  const action = String(formData.get("subscriptionAction") ?? "") as
    | "activate"
    | "deactivate"
    | "delete"
    | "duplicate";
  const selectedIds = readSelectedSubscriptionIds(formData);

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      const summary = await bulkManageQueueSubscriptions({
        adminUserId,
        subscriptionIds: selectedIds,
        action
      });

      if (summary.failed > 0) {
        throw new OperationsError(formatBulkSummary("Bulk subscription action completed:", summary));
      }
    },
    "Selected subscriptions updated."
  );
}

export async function createEscalationRuleAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "") as
    | "notification_delivery"
    | "scheduled_job";
  const name = String(formData.get("name") ?? "");
  const filtersJson = String(formData.get("filtersJson") ?? "");
  const escalationReason = String(formData.get("escalationReason") ?? "");
  const isActive = formData.has("isActive") && String(formData.get("isActive")) === "true";
  const runMode = String(formData.get("runMode") ?? "manual") as "manual" | "automated";
  const cooldownMinutes = Number(formData.get("cooldownMinutes") ?? "30");
  const maxMatchesPerRun = Number(formData.get("maxMatchesPerRun") ?? "25");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await createOperationEscalationRule({
        adminUserId,
        entityType,
        name,
        filters: readFiltersFromJson(entityType, filtersJson),
        escalationReason,
        isActive,
        runMode,
        cooldownMinutes: Number.isFinite(cooldownMinutes)
          ? Math.max(0, Math.floor(cooldownMinutes))
          : 30,
        maxMatchesPerRun: Number.isFinite(maxMatchesPerRun)
          ? Math.max(1, Math.floor(maxMatchesPerRun))
          : 25
      });
    },
    "Escalation rule created."
  );
}

export async function updateEscalationRuleAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "") as
    | "notification_delivery"
    | "scheduled_job";
  const ruleId = String(formData.get("ruleId") ?? "");
  const name = String(formData.get("name") ?? "");
  const filtersJson = String(formData.get("filtersJson") ?? "");
  const replaceFilters = String(formData.get("replaceFilters")) === "true";
  const escalationReason = String(formData.get("escalationReason") ?? "");
  const isActive = String(formData.get("isActive")) === "true";
  const runMode = String(formData.get("runMode") ?? "manual") as "manual" | "automated";
  const cooldownMinutes = Number(formData.get("cooldownMinutes") ?? "30");
  const maxMatchesPerRun = Number(formData.get("maxMatchesPerRun") ?? "25");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await updateOperationEscalationRule({
        ruleId,
        adminUserId,
        name,
        escalationReason,
        isActive,
        runMode,
        cooldownMinutes: Number.isFinite(cooldownMinutes)
          ? Math.max(0, Math.floor(cooldownMinutes))
          : undefined,
        maxMatchesPerRun: Number.isFinite(maxMatchesPerRun)
          ? Math.max(1, Math.floor(maxMatchesPerRun))
          : undefined,
        filters: replaceFilters ? readFiltersFromJson(entityType, filtersJson) : undefined
      });
    },
    "Escalation rule updated."
  );
}

export async function updateEscalationRuleAutomationControlAction(formData: FormData) {
  const ruleId = String(formData.get("ruleId") ?? "");
  const action = String(formData.get("automationAction") ?? "") as
    | "mute"
    | "unmute"
    | "snooze"
    | "resume";
  const snoozedUntil = resolveAutomationSnoozedUntil(formData);
  const reason = String(formData.get("automationReason") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await updateOperationEscalationRuleAutomationControl({
        ruleId,
        adminUserId,
        action,
        snoozedUntil,
        reason: reason || null
      });
    },
    action === "mute"
      ? "Escalation-rule automation muted."
      : action === "unmute"
        ? "Escalation-rule automation unmuted."
        : action === "snooze"
          ? "Escalation-rule automation snoozed."
          : "Escalation-rule automation resumed."
  );
}

export async function updateAutomationAcknowledgementAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "") as OperationAutomationEntityType;
  const entityId = String(formData.get("entityId") ?? "");
  const status = String(formData.get("status") ?? "") as OperationAutomationAcknowledgementStatus;
  const note = String(formData.get("note") ?? "");
  const assignedAdminUserId = String(formData.get("assignedAdminUserId") ?? "");
  const remindAt = String(formData.get("remindAt") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await updateOperationAutomationAcknowledgement({
        entityType,
        entityId,
        adminUserId,
        status,
        note: note || null,
        assignedAdminUserId: assignedAdminUserId || null,
        remindAt: remindAt || null
      });
    },
    "Automation acknowledgement updated."
  );
}

export async function updateAutomationReminderLifecycleAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "") as OperationAutomationEntityType;
  const entityId = String(formData.get("entityId") ?? "");
  const lifecycleAction = String(formData.get("lifecycleAction") ?? "") as
    | "dismiss"
    | "snooze"
    | "reschedule";
  const remindAt = String(formData.get("remindAt") ?? "");
  const snoozedUntil = resolveAutomationSnoozedUntil(formData);
  const reason = String(formData.get("reason") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await updateOperationAutomationReminderLifecycle({
        entityType,
        entityId,
        adminUserId,
        action: lifecycleAction,
        remindAt: remindAt || null,
        snoozedUntil,
        reason: reason || null
      });
    },
    lifecycleAction === "dismiss"
      ? "Reminder dismissed."
      : lifecycleAction === "snooze"
        ? "Reminder snoozed."
        : "Reminder rescheduled."
  );
}

export async function updateAutomationVerificationAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "") as OperationAutomationEntityType;
  const entityId = String(formData.get("entityId") ?? "");
  const verificationStatus = String(formData.get("verificationStatus") ?? "") as
    OperationAutomationVerificationStatus;
  const verificationNotes = String(formData.get("verificationNotes") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await updateOperationAutomationVerification({
        entityType,
        entityId,
        adminUserId,
        verificationStatus,
        verificationNotes: verificationNotes || null
      });
    },
    verificationStatus === "completed"
      ? "Verification marked complete."
      : verificationStatus === "failed"
        ? "Verification marked failed."
        : "Verification status updated."
  );
}

export async function deleteEscalationRuleAction(formData: FormData) {
  const ruleId = String(formData.get("ruleId") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await deleteOperationEscalationRule(ruleId, adminUserId);
    },
    "Escalation rule deleted."
  );
}

export async function applyEscalationRuleAction(formData: FormData) {
  const ruleId = String(formData.get("ruleId") ?? "");
  const overrideAutomationState = String(formData.get("overrideAutomationState")) === "true";

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      let summary;

      try {
        summary = await applyOperationEscalationRule({
          ruleId,
          adminUserId,
          overrideAutomationState
        });
      } catch (error) {
        await recordOperationAutomationRerunOutcome({
          entityType: "operation_escalation_rule",
          entityId: ruleId,
          adminUserId,
          outcome: "failed",
          summary: getAdminActionErrorMessage(error, "Escalation rule rerun failed.")
        });
        throw error;
      }

      await recordOperationAutomationRerunOutcome({
        entityType: "operation_escalation_rule",
        entityId: ruleId,
        adminUserId,
        outcome: summary.runStatus,
        summary:
          summary.runStatus === "success"
            ? "Escalation rule rerun completed successfully."
            : summary.skipReason ?? "Escalation rule rerun was skipped."
      });

      if (summary.runStatus === "skipped") {
        throw new OperationsError(summary.skipReason ?? "Escalation rule run was skipped.");
      }

      if (summary.failed > 0 || summary.runStatus === "failed") {
        throw new OperationsError(
          formatBulkSummary("Escalation rule application completed:", summary)
        );
      }
    },
    overrideAutomationState ? "Escalation rule applied with override." : "Escalation rule applied."
  );
}

export async function generateSubscriptionDigestAction(formData: FormData) {
  const subscriptionId = String(formData.get("subscriptionId") ?? "");
  const overrideAutomationState = String(formData.get("overrideAutomationState")) === "true";

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      let result;

      try {
        result = await generateOperationSubscriptionDigest({
          subscriptionId,
          adminUserId,
          triggeredBy: "manual",
          bypassCooldown: true,
          overrideAutomationState
        });
      } catch (error) {
        await recordOperationAutomationRerunOutcome({
          entityType: "operation_queue_subscription",
          entityId: subscriptionId,
          adminUserId,
          outcome: "failed",
          summary: getAdminActionErrorMessage(error, "Subscription digest rerun failed.")
        });
        throw error;
      }

      await recordOperationAutomationRerunOutcome({
        entityType: "operation_queue_subscription",
        entityId: subscriptionId,
        adminUserId,
        outcome: result.runStatus,
        summary:
          result.runStatus === "success"
            ? "Subscription digest rerun completed successfully."
            : result.skipReason ?? "Subscription digest rerun was skipped."
      });

      if (result.runStatus === "skipped") {
        throw new OperationsError(
          result.skipReason ?? "Subscription digest generation was skipped."
        );
      }
    },
    overrideAutomationState
      ? "Subscription digest generated with override."
      : "Subscription digest generated."
  );
}

export async function updateSavedViewAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "") as
    | "notification_delivery"
    | "scheduled_job";
  const viewId = String(formData.get("viewId") ?? "");
  const name = String(formData.get("name") ?? "");
  const filtersJson = String(formData.get("filtersJson") ?? "");
  const replaceFilters = String(formData.get("replaceFilters")) === "true";
  const isDefault = String(formData.get("isDefault")) === "true";

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await updateOperationSavedView({
        viewId,
        adminUserId,
        name,
        isDefault,
        filters: replaceFilters ? readFiltersFromJson(entityType, filtersJson) : undefined
      });
    },
    "Saved view updated."
  );
}

export async function deleteSavedViewAction(formData: FormData) {
  const viewId = String(formData.get("viewId") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await deleteOperationSavedView(viewId, adminUserId);
    },
    "Saved view deleted."
  );
}

export async function addOperationCommentAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const entityId = String(formData.get("entityId") ?? "");
  const commentBody = String(formData.get("commentBody") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await addOperationComment({
        entityType: entityType as "notification_delivery" | "scheduled_job",
        entityId,
        adminUserId,
        commentBody
      });
    },
    "Comment posted."
  );
}

export async function watchIncidentAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const entityId = String(formData.get("entityId") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await watchIncident(entityType as "notification_delivery" | "scheduled_job", entityId, adminUserId);
    },
    "Incident added to your watch list."
  );
}

export async function unwatchIncidentAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const entityId = String(formData.get("entityId") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await unwatchIncident(
        entityType as "notification_delivery" | "scheduled_job",
        entityId,
        adminUserId
      );
    },
    "Incident removed from your watch list."
  );
}

export async function updateWatchPreferencesAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const entityId = String(formData.get("entityId") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await updateWatchPreferences({
        entityType: entityType as "notification_delivery" | "scheduled_job",
        entityId,
        adminUserId,
        preferences: {
          isMuted: String(formData.get("isMuted")) === "true",
          notifyOnComment: String(formData.get("notifyOnComment")) === "true",
          notifyOnOwnerChange: String(formData.get("notifyOnOwnerChange")) === "true",
          notifyOnWorkflowChange: String(formData.get("notifyOnWorkflowChange")) === "true",
          notifyOnResolve: String(formData.get("notifyOnResolve")) === "true"
        }
      });
    },
    "Watch preferences updated."
  );
}

export async function updateIncidentEscalationAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "");
  const entityId = String(formData.get("entityId") ?? "");
  const isEscalated = String(formData.get("isEscalated")) === "true";
  const escalationReason = String(formData.get("escalationReason") ?? "");

  return handleOperation(
    formData,
    APP_ROUTES.adminOperations,
    async (adminUserId) => {
      await setIncidentEscalation({
        entityType: entityType as "notification_delivery" | "scheduled_job",
        entityId,
        adminUserId,
        isEscalated,
        escalationReason
      });
    },
    isEscalated ? "Incident escalated." : "Escalation cleared."
  );
}

export async function executeCurrentViewWatchPreferenceAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "") as
    | "notification_delivery"
    | "scheduled_job";
  const filtersJson = String(formData.get("filtersJson") ?? "");
  const isConfirmed = String(formData.get("confirmExecution")) === "true";
  const returnTo = resolveReturnPath(formData.get("returnTo"), APP_ROUTES.adminOperations);
  const adminUser = await requireAdminUser();

  try {
    const filters = readFiltersFromJson(entityType, filtersJson);
    const preferences = readWatchPreferencesFromForm(formData);
    const summary =
      entityType === "notification_delivery"
        ? await executeDeliveryViewWatchPreferenceUpdate({
            filters: filters as AdminDeliveryFilters,
            adminUserId: adminUser.id,
            isConfirmed,
            preferences
          })
        : await executeJobViewWatchPreferenceUpdate({
            filters: filters as AdminJobFilters,
            adminUserId: adminUser.id,
            isConfirmed,
            preferences
          });

    revalidateOperationsPaths();
    revalidatePath(returnTo);

    if (summary.failed > 0) {
      redirectWithMessage(returnTo, {
        warning: formatBulkSummary("Current-view watch-preference update completed:", summary)
      });
    }

    redirectWithMessage(returnTo, {
      success: `Current-view watch preferences updated for ${summary.succeeded}/${summary.totalSelected} incidents.`
    });
  } catch (error) {
    const message = getAdminActionErrorMessage(
      error,
      "We could not update watch preferences for the current view."
    );
    redirectWithMessage(returnTo, { error: message });
  }
}

function buildExecuteViewSuccessMessage(actionKey: string, succeeded: number, totalSelected: number) {
  const label = actionKey.replaceAll("_", " ");

  return `Current view action '${label}' succeeded for ${succeeded}/${totalSelected} incidents.`;
}

export async function executeCurrentViewAction(formData: FormData) {
  const entityType = String(formData.get("entityType") ?? "") as
    | "notification_delivery"
    | "scheduled_job";
  const actionKey = String(formData.get("actionKey") ?? "");
  const filtersJson = String(formData.get("filtersJson") ?? "");
  const isConfirmed = String(formData.get("confirmExecution")) === "true";
  const assignedAdminUserId = String(formData.get("assignedAdminUserId") ?? "");
  const handoffNote = String(formData.get("handoffNote") ?? "");
  const returnTo = resolveReturnPath(formData.get("returnTo"), APP_ROUTES.adminOperations);
  const adminUser = await requireAdminUser();

  try {
    const filters = readFiltersFromJson(entityType, filtersJson);
    const summary =
      entityType === "notification_delivery"
        ? await executeDeliveryViewAction({
            filters: filters as AdminDeliveryFilters,
            adminUserId: adminUser.id,
            action: actionKey as
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
              | "workflow_resolved",
            isConfirmed,
            assignedAdminUserId,
            handoffNote
          })
        : await executeJobViewAction({
            filters: filters as AdminJobFilters,
            adminUserId: adminUser.id,
            action: actionKey as
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
              | "workflow_resolved",
            isConfirmed,
            assignedAdminUserId,
            handoffNote
          });

    revalidateOperationsPaths();
    revalidatePath(returnTo);

    if (summary.failed > 0) {
      redirectWithMessage(returnTo, {
        warning: formatBulkSummary("View execution completed:", summary)
      });
    }

    redirectWithMessage(returnTo, {
      success: buildExecuteViewSuccessMessage(actionKey, summary.succeeded, summary.totalSelected)
    });
  } catch (error) {
    const message = getAdminActionErrorMessage(
      error,
      "We could not run that current-view action."
    );
    redirectWithMessage(returnTo, { error: message });
  }
}
