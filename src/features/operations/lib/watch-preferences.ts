import type { OperationWatcherRecord } from "@/types/operations";

export type OperationWatchNotificationKind =
  | "comment"
  | "owner_change"
  | "workflow_change"
  | "resolve";

export type OperationWatchPreferenceState = Pick<
  OperationWatcherRecord,
  | "isMuted"
  | "notifyOnComment"
  | "notifyOnOwnerChange"
  | "notifyOnWorkflowChange"
  | "notifyOnResolve"
>;

export const DEFAULT_WATCH_PREFERENCES: OperationWatchPreferenceState = {
  isMuted: false,
  notifyOnComment: true,
  notifyOnOwnerChange: true,
  notifyOnWorkflowChange: true,
  notifyOnResolve: true
};

export function normalizeWatchPreferences(
  raw:
    | Partial<Record<keyof OperationWatchPreferenceState, unknown>>
    | null
    | undefined
): OperationWatchPreferenceState {
  return {
    isMuted: raw?.isMuted === true,
    notifyOnComment:
      typeof raw?.notifyOnComment === "boolean"
        ? raw.notifyOnComment
        : DEFAULT_WATCH_PREFERENCES.notifyOnComment,
    notifyOnOwnerChange:
      typeof raw?.notifyOnOwnerChange === "boolean"
        ? raw.notifyOnOwnerChange
        : DEFAULT_WATCH_PREFERENCES.notifyOnOwnerChange,
    notifyOnWorkflowChange:
      typeof raw?.notifyOnWorkflowChange === "boolean"
        ? raw.notifyOnWorkflowChange
        : DEFAULT_WATCH_PREFERENCES.notifyOnWorkflowChange,
    notifyOnResolve:
      typeof raw?.notifyOnResolve === "boolean"
        ? raw.notifyOnResolve
        : DEFAULT_WATCH_PREFERENCES.notifyOnResolve
  };
}

export function shouldNotifyWatcher(
  watcher: OperationWatchPreferenceState,
  notificationKind: OperationWatchNotificationKind
) {
  if (watcher.isMuted) {
    return false;
  }

  switch (notificationKind) {
    case "comment":
      return watcher.notifyOnComment;
    case "owner_change":
      return watcher.notifyOnOwnerChange;
    case "workflow_change":
      return watcher.notifyOnWorkflowChange;
    case "resolve":
      return watcher.notifyOnResolve;
  }
}
