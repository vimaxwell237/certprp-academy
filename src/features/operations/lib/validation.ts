import type {
  AdminDeliveryDetail,
  AdminScheduledJobDetail,
  OperationAutomationAcknowledgementStatus,
  OperationAutomationVerificationStatus,
  OperationWorkflowState
} from "@/types/operations";

export class OperationsError extends Error {}

export const BULK_VIEW_CONFIRMATION_THRESHOLD = 25;
export const BULK_VIEW_EXECUTION_LIMIT = 100;

const workflowTransitions: Record<OperationWorkflowState, OperationWorkflowState[]> = {
  open: ["open", "investigating", "waiting", "resolved"],
  investigating: ["open", "investigating", "waiting", "resolved"],
  waiting: ["open", "investigating", "waiting", "resolved"],
  resolved: ["resolved", "open", "investigating"]
};

export function canRetryDelivery(
  delivery: AdminDeliveryDetail,
  force: boolean
) {
  if (!["failed", "ignored"].includes(delivery.status)) {
    throw new OperationsError("Only failed or ignored deliveries can be retried.");
  }

  if (delivery.retryCount >= delivery.maxRetries && !force) {
    throw new OperationsError("Retry limit has been exhausted. Use force retry to override.");
  }
}

export function canIgnoreDelivery(delivery: AdminDeliveryDetail) {
  if (!["pending", "failed"].includes(delivery.status)) {
    throw new OperationsError("Only pending or failed deliveries can be ignored.");
  }
}

export function canReplayJob(job: AdminScheduledJobDetail, force: boolean) {
  if (job.status !== "failed") {
    throw new OperationsError("Only failed jobs can be replayed.");
  }

  if (job.retryCount >= job.maxRetries && !force) {
    throw new OperationsError("Retry limit has been exhausted. Use force replay to override.");
  }
}

export function canCancelJob(job: AdminScheduledJobDetail) {
  if (job.status !== "pending") {
    throw new OperationsError("Only pending jobs can be canceled.");
  }
}

export function canTransitionWorkflowState(
  currentState: OperationWorkflowState,
  nextState: OperationWorkflowState
) {
  if (!workflowTransitions[currentState].includes(nextState)) {
    throw new OperationsError(
      `Workflow state cannot move from ${currentState} to ${nextState}.`
    );
  }
}

export function validateBulkViewExecution(totalMatched: number, isConfirmed: boolean) {
  if (totalMatched === 0) {
    throw new OperationsError("The current view does not contain any incidents to update.");
  }

  if (totalMatched > BULK_VIEW_EXECUTION_LIMIT) {
    throw new OperationsError(
      `The current view contains ${totalMatched} incidents. Narrow the filters before running a view-wide action.`
    );
  }

  if (totalMatched > BULK_VIEW_CONFIRMATION_THRESHOLD && !isConfirmed) {
    throw new OperationsError(
      `The current view contains ${totalMatched} incidents. Confirm the view-wide execution checkbox first.`
    );
  }
}

const acknowledgementTransitions: Record<
  OperationAutomationAcknowledgementStatus,
  OperationAutomationAcknowledgementStatus[]
> = {
  unacknowledged: ["unacknowledged", "acknowledged", "investigating"],
  acknowledged: ["acknowledged", "investigating", "fixed_pending_rerun", "resolved"],
  investigating: ["acknowledged", "investigating", "fixed_pending_rerun", "resolved"],
  fixed_pending_rerun: ["acknowledged", "investigating", "fixed_pending_rerun", "resolved"],
  resolved: ["acknowledged", "investigating", "resolved"]
};

export function canTransitionAutomationAcknowledgementStatus(
  currentStatus: OperationAutomationAcknowledgementStatus,
  nextStatus: OperationAutomationAcknowledgementStatus
) {
  if (!acknowledgementTransitions[currentStatus].includes(nextStatus)) {
    throw new OperationsError(
      `Acknowledgement state cannot move from ${currentStatus} to ${nextStatus}.`
    );
  }
}

const verificationTransitions: Record<
  OperationAutomationVerificationStatus,
  OperationAutomationVerificationStatus[]
> = {
  not_started: ["not_started", "pending"],
  pending: ["pending", "completed", "failed"],
  completed: ["completed", "pending"],
  failed: ["failed", "pending", "completed"]
};

export function canTransitionAutomationVerificationStatus(
  currentStatus: OperationAutomationVerificationStatus,
  nextStatus: OperationAutomationVerificationStatus
) {
  if (!verificationTransitions[currentStatus].includes(nextStatus)) {
    throw new OperationsError(
      `Verification state cannot move from ${currentStatus} to ${nextStatus}.`
    );
  }
}
