import Link from "next/link";

import {
  applyEscalationRuleAction,
  bulkQueueSubscriptionsAction,
  createEscalationRuleAction,
  createQueueSubscriptionAction,
  createSavedViewAction,
  deleteQueueSubscriptionAction,
  deleteEscalationRuleAction,
  executeCurrentViewWatchPreferenceAction,
  deleteSavedViewAction,
  executeCurrentViewAction,
  generateSubscriptionDigestAction,
  updateEscalationRuleAutomationControlAction,
  updateEscalationRuleAction,
  updateQueueSubscriptionAutomationControlAction,
  updateQueueSubscriptionAction,
  updateSavedViewAction
} from "@/features/operations/actions/operations-actions";
import {
  buildAutomationTrendSummary,
  buildManualRerunGuidance,
  getAutomationHealthMeta,
  summarizeAutomationReasons
} from "@/features/operations/lib/health";
import { APP_ROUTES } from "@/lib/auth/redirects";
import type {
  AdminOperatorOption,
  OperationEntityType,
  OperationAutomationGuidance,
  OperationEscalationRuleRecord,
  OperationEscalationRuleRunRecord,
  OperationQueueSubscriptionRecord,
  OperationAutomationReasonSummary,
  OperationSubscriptionDigestRunRecord,
  OperationSavedViewRecord
} from "@/types/operations";

function formatAutomationStateLabel(state: OperationQueueSubscriptionRecord["automationState"]) {
  return state === "muted" ? "Muted" : state === "snoozed" ? "Snoozed" : "Automation Active";
}

function automationStateClassName(state: OperationQueueSubscriptionRecord["automationState"]) {
  if (state === "muted") {
    return "rounded-full bg-slate-900 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white";
  }

  if (state === "snoozed") {
    return "rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900";
  }

  return "rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-900";
}

function guidanceBannerClassName(tone: OperationAutomationGuidance["tone"]) {
  if (tone === "danger") {
    return "rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900";
  }

  if (tone === "warning") {
    return "rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900";
  }

  return "rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs text-cyan-900";
}

function renderReasonChips(summaries: OperationAutomationReasonSummary[]) {
  if (summaries.length === 0) {
    return <p className="text-xs text-slate">No recent trend reasons.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {summaries.map((summary) => (
        <span
          className={
            summary.kind === "failure"
              ? "rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-900"
              : "rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-900"
          }
          key={`${summary.kind}-${summary.reason}`}
        >
          {summary.reason} ({summary.count})
        </span>
      ))}
    </div>
  );
}

function runStatusClassName(status: OperationEscalationRuleRunRecord["runStatus"]) {
  if (status === "failed") {
    return "rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-900";
  }

  if (status === "skipped") {
    return "rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900";
  }

  return "rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-900";
}

function formatLastAutomationEvent(input: {
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastSkipReason: string | null;
}) {
  const successTime = input.lastSuccessAt ? new Date(input.lastSuccessAt).getTime() : -1;
  const failureTime = input.lastFailureAt ? new Date(input.lastFailureAt).getTime() : -1;

  if (failureTime > successTime && input.lastFailureAt) {
    return `Last failure ${new Date(input.lastFailureAt).toLocaleString()}`;
  }

  if (input.lastSuccessAt) {
    return `Last success ${new Date(input.lastSuccessAt).toLocaleString()}`;
  }

  if (input.lastSkipReason) {
    return `Last skip: ${input.lastSkipReason}`;
  }

  return "No automation history yet";
}

function toDatetimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const pad = (segment: number) => String(segment).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getRuleRuns(
  ruleId: string,
  runs: OperationEscalationRuleRunRecord[]
) {
  return runs.filter((run) => run.operationEscalationRuleId === ruleId).slice(0, 4);
}

function getDigestRuns(
  subscriptionId: string,
  runs: OperationSubscriptionDigestRunRecord[]
) {
  return runs.filter((run) => run.operationQueueSubscriptionId === subscriptionId).slice(0, 4);
}

export function OperationsSavedViewsPanel({
  entityType,
  currentFiltersJson,
  currentSavedViewId,
  operators,
  returnTo,
  subscriptions,
  subscriptionHrefMap,
  escalationRules,
  escalationRuleHrefMap,
  recentRuleRuns,
  recentDigestRuns,
  views,
  viewHrefMap
}: {
  entityType: OperationEntityType;
  currentFiltersJson: string;
  currentSavedViewId: string | null;
  operators: AdminOperatorOption[];
  returnTo: string;
  subscriptions: OperationQueueSubscriptionRecord[];
  subscriptionHrefMap: Record<string, string>;
  escalationRules: OperationEscalationRuleRecord[];
  escalationRuleHrefMap: Record<string, string>;
  recentRuleRuns: OperationEscalationRuleRunRecord[];
  recentDigestRuns: OperationSubscriptionDigestRunRecord[];
  views: OperationSavedViewRecord[];
  viewHrefMap: Record<string, string>;
}) {
  const matchingSubscriptionIds = new Set(
    views
      .filter((view) =>
        subscriptions.some(
          (subscription) =>
            JSON.stringify(subscription.filters) === JSON.stringify(view.filters)
        )
      )
      .map((view) => view.id)
  );

  return (
    <div className="space-y-4 rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
          Saved Views
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">Operator Views</h3>
        <p className="text-sm text-slate">
          Save common queue filters, set a default view, or reload a saved triage slice quickly.
        </p>
      </div>

      <form action={createSavedViewAction} className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <input name="entityType" type="hidden" value={entityType} />
        <input name="filtersJson" type="hidden" value={currentFiltersJson} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <input
          className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          name="name"
          placeholder="Save current filters as..."
          required
          type="text"
        />
        <label className="inline-flex items-center gap-2 rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink">
          <input name="isDefault" type="checkbox" value="true" />
          <span>Default</span>
        </label>
        <button
          className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
          type="submit"
        >
          Save View
        </button>
      </form>

      <form action={createQueueSubscriptionAction} className="grid gap-3 md:grid-cols-[1fr_160px_auto_auto]">
        <input name="entityType" type="hidden" value={entityType} />
        <input name="filtersJson" type="hidden" value={currentFiltersJson} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <input
          className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          name="name"
          placeholder="Subscribe to current filters as..."
          required
          type="text"
        />
        <input
          className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          defaultValue={180}
          min={0}
          name="digestCooldownMinutes"
          type="number"
        />
        <label className="inline-flex items-center gap-2 rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink">
          <input defaultChecked name="isActive" type="checkbox" value="true" />
          <span>Active</span>
        </label>
        <button
          className="inline-flex rounded-full bg-cyan px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600"
          type="submit"
        >
          Subscribe Current View
        </button>
      </form>

      <form action={createEscalationRuleAction} className="grid gap-3 md:grid-cols-[1fr_1.2fr_140px_140px_140px_auto_auto]">
        <input name="entityType" type="hidden" value={entityType} />
        <input name="filtersJson" type="hidden" value={currentFiltersJson} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <input
          className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          name="name"
          placeholder="Escalation rule name"
          required
          type="text"
        />
        <input
          className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          name="escalationReason"
          placeholder="Escalation reason"
          required
          type="text"
        />
        <select
          className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          defaultValue="manual"
          name="runMode"
        >
          <option value="manual">Manual</option>
          <option value="automated">Automated</option>
        </select>
        <input
          className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          defaultValue={30}
          min={0}
          name="cooldownMinutes"
          type="number"
        />
        <input
          className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          defaultValue={25}
          min={1}
          name="maxMatchesPerRun"
          type="number"
        />
        <label className="inline-flex items-center gap-2 rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink">
          <input defaultChecked name="isActive" type="checkbox" value="true" />
          <span>Active</span>
        </label>
        <button
          className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
          type="submit"
        >
          Create Rule From Current View
        </button>
      </form>

      <div className="rounded-2xl border border-ink/10 bg-pearl px-4 py-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            Execute Current View
          </p>
          <p className="text-sm text-slate">
            Run a queue action across every incident currently matched by this saved view or
            filter state. Large executions require explicit confirmation and may be blocked
            if the current view is too broad.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink">
            <input name="confirmExecution" form={`execute-view-${entityType}`} type="checkbox" value="true" />
            <span>I understand this runs against every incident in the current view.</span>
          </label>

          <form
            action={executeCurrentViewAction}
            className="flex flex-wrap gap-2"
            id={`execute-view-${entityType}`}
          >
            <input name="entityType" type="hidden" value={entityType} />
            <input name="filtersJson" type="hidden" value={currentFiltersJson} />
            <input name="returnTo" type="hidden" value={returnTo} />
            {entityType === "notification_delivery" ? (
              <>
                <button
                  className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                  name="actionKey"
                  type="submit"
                  value="retry"
                >
                  Retry Current View
                </button>
                <button
                  className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                  name="actionKey"
                  type="submit"
                  value="force_retry"
                >
                  Force Retry Current View
                </button>
                <button
                  className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                  name="actionKey"
                  type="submit"
                  value="watch"
                >
                  Watch Current View
                </button>
                <button
                  className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                  name="actionKey"
                  type="submit"
                  value="unwatch"
                >
                  Unwatch Current View
                </button>
                <button
                  className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
                  name="actionKey"
                  type="submit"
                  value="ignore"
                >
                  Ignore Current View
                </button>
              </>
            ) : (
              <>
                <button
                  className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                  name="actionKey"
                  type="submit"
                  value="replay"
                >
                  Replay Current View
                </button>
                <button
                  className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                  name="actionKey"
                  type="submit"
                  value="force_replay"
                >
                  Force Replay Current View
                </button>
                <button
                  className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                  name="actionKey"
                  type="submit"
                  value="watch"
                >
                  Watch Current View
                </button>
                <button
                  className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                  name="actionKey"
                  type="submit"
                  value="unwatch"
                >
                  Unwatch Current View
                </button>
                <button
                  className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
                  name="actionKey"
                  type="submit"
                  value="cancel"
                >
                  Cancel Current View
                </button>
              </>
            )}
            <button
              className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
              name="actionKey"
              type="submit"
              value="workflow_investigating"
            >
              Mark Investigating
            </button>
            <button
              className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
              name="actionKey"
              type="submit"
              value="workflow_waiting"
            >
              Mark Waiting
            </button>
            <button
              className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
              name="actionKey"
              type="submit"
              value="workflow_resolved"
            >
              Mark Resolved
            </button>
            <button
              className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
              name="actionKey"
              type="submit"
              value="workflow_open"
            >
              Reopen Current View
            </button>
          </form>

          <form
            action={executeCurrentViewWatchPreferenceAction}
            className="grid gap-3 rounded-2xl border border-ink/10 bg-white p-4 md:grid-cols-[1fr_140px_auto]"
          >
            <input name="entityType" type="hidden" value={entityType} />
            <input name="filtersJson" type="hidden" value={currentFiltersJson} />
            <input name="returnTo" type="hidden" value={returnTo} />
            <input name="confirmExecution" type="hidden" value="true" />
            <select
              className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
              defaultValue="isMuted"
              name="preferenceKey"
            >
              <option value="isMuted">Mute</option>
              <option value="notifyOnComment">Comment notices</option>
              <option value="notifyOnOwnerChange">Owner-change notices</option>
              <option value="notifyOnWorkflowChange">Workflow notices</option>
              <option value="notifyOnResolve">Resolve notices</option>
            </select>
            <select
              className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
              defaultValue="true"
              name="preferenceValue"
            >
              <option value="true">Enable</option>
              <option value="false">Disable</option>
            </select>
            <button
              className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
              type="submit"
            >
              Update Watch Prefs For Current View
            </button>
          </form>

          <form
            action={executeCurrentViewAction}
            className="grid gap-3 rounded-2xl border border-ink/10 bg-white p-4 md:grid-cols-[1fr_1.2fr_auto]"
          >
            <input name="entityType" type="hidden" value={entityType} />
            <input name="filtersJson" type="hidden" value={currentFiltersJson} />
            <input name="returnTo" type="hidden" value={returnTo} />
            <input name="confirmExecution" type="hidden" value="true" />
            <select
              className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
              defaultValue=""
              name="assignedAdminUserId"
              required
            >
              <option disabled value="">
                Assign current view to...
              </option>
              {operators.map((operator) => (
                <option key={operator.userId} value={operator.userId}>
                  {operator.label}
                </option>
              ))}
            </select>
            <input
              className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
              name="handoffNote"
              placeholder="Optional handoff note for current-view assignment"
              type="text"
            />
            <button
              className="inline-flex rounded-full bg-cyan px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
              name="actionKey"
              type="submit"
              value="assign"
            >
              Assign Current View
            </button>
          </form>

          <form action={executeCurrentViewAction} className="flex flex-wrap gap-3">
            <input name="entityType" type="hidden" value={entityType} />
            <input name="filtersJson" type="hidden" value={currentFiltersJson} />
            <input name="returnTo" type="hidden" value={returnTo} />
            <input name="confirmExecution" type="hidden" value="true" />
            <button
              className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
              name="actionKey"
              type="submit"
              value="release"
            >
              Release Current View
            </button>
          </form>
        </div>
      </div>

      {views.length === 0 ? (
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
          No saved views yet. Save the current filters to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {views.map((view) => (
            <div className="rounded-2xl bg-pearl px-4 py-4" key={view.id}>
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{view.name}</p>
                    {view.isDefault ? (
                      <span className="rounded-full bg-cyan/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-900">
                        Default
                      </span>
                    ) : null}
                    {currentSavedViewId === view.id ? (
                      <span className="rounded-full bg-ink px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                        Active
                      </span>
                    ) : null}
                    {matchingSubscriptionIds.has(view.id) ? (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900">
                        Subscribed
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate">
                    Updated {new Date(view.updatedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    className="inline-flex rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                    href={viewHrefMap[view.id] ?? returnTo}
                  >
                    Load
                  </Link>
                  <form action={deleteSavedViewAction}>
                    <input name="viewId" type="hidden" value={view.id} />
                    <input name="returnTo" type="hidden" value={returnTo} />
                    <button
                      className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
                      type="submit"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>

              <form
                action={updateSavedViewAction}
                className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]"
              >
                <input name="viewId" type="hidden" value={view.id} />
                <input name="entityType" type="hidden" value={entityType} />
                <input name="filtersJson" type="hidden" value={currentFiltersJson} />
                <input name="returnTo" type="hidden" value={returnTo} />
                <input
                  className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                  defaultValue={view.name}
                  name="name"
                  required
                  type="text"
                />
                <label className="inline-flex items-center gap-2 rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink">
                  <input defaultChecked={view.isDefault} name="isDefault" type="checkbox" value="true" />
                  <span>Default</span>
                </label>
                <button
                  className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                  type="submit"
                >
                  Rename
                </button>
                <button
                  className="inline-flex rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-sm font-semibold text-cyan-900 transition hover:bg-cyan/20"
                  name="replaceFilters"
                  type="submit"
                  value="true"
                >
                  Update To Current Filters
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {subscriptions.length === 0 ? null : (
        <div className="space-y-3 rounded-2xl border border-ink/10 bg-pearl px-4 py-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
              Queue Subscriptions
            </p>
            <p className="text-sm text-slate">
              Subscribe to queue patterns for in-app match alerts and quick re-entry into high-signal slices.
            </p>
          </div>

          <form
            action={bulkQueueSubscriptionsAction}
            className="flex flex-wrap gap-2"
            id={`bulk-subscriptions-${entityType}`}
          >
            <input name="returnTo" type="hidden" value={returnTo} />
            <button
              className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
              name="subscriptionAction"
              type="submit"
              value="activate"
            >
              Activate Selected
            </button>
            <button
              className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
              name="subscriptionAction"
              type="submit"
              value="deactivate"
            >
              Pause Selected
            </button>
            <button
              className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
              name="subscriptionAction"
              type="submit"
              value="duplicate"
            >
              Duplicate Selected
            </button>
            <button
              className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
              name="subscriptionAction"
              type="submit"
              value="delete"
            >
              Delete Selected
            </button>
          </form>

          {subscriptions.map((subscription) => (
            <div className="rounded-2xl bg-white px-4 py-4" key={subscription.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-pearl px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
                      <input
                        className="size-3.5 rounded border-ink/20 text-cyan focus:ring-cyan"
                        form={`bulk-subscriptions-${entityType}`}
                        name="selectedSubscriptionIds"
                        type="checkbox"
                        value={subscription.id}
                      />
                      <span>Select</span>
                    </label>
                    <p className="font-semibold text-ink">{subscription.name}</p>
                    <span
                      className={
                        subscription.isActive
                          ? "rounded-full bg-cyan/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-900"
                          : "rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700"
                      }
                    >
                      {subscription.isActive ? "Active" : "Paused"}
                    </span>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
                      Matches {subscription.currentMatchCount}
                    </span>
                    {subscription.escalatedMatchCount > 0 ? (
                      <span className="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-900">
                        Escalated {subscription.escalatedMatchCount}
                      </span>
                    ) : null}
                    {subscription.staleMatchCount > 0 ? (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900">
                        Stale {subscription.staleMatchCount}
                      </span>
                    ) : null}
                    <span className={automationStateClassName(subscription.automationState)}>
                      {formatAutomationStateLabel(subscription.automationState)}
                    </span>
                    <span className={getAutomationHealthMeta(subscription.healthStatus).className}>
                      {getAutomationHealthMeta(subscription.healthStatus).label}
                    </span>
                  </div>
                  <p className="text-xs text-slate">
                    Updated {new Date(subscription.updatedAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-cyan-900">{subscription.matchExplanation}</p>
                  <p className="text-xs text-slate">{formatLastAutomationEvent(subscription)}</p>
                  <p className="text-xs text-slate">
                    {buildAutomationTrendSummary(subscription)}
                  </p>
                  {subscription.lastSkipReason ? (
                    <p className="text-xs text-amber-900">{subscription.lastSkipReason}</p>
                  ) : null}
                  {subscription.snoozedUntil || subscription.mutedOrSnoozedReason ? (
                    <p className="text-xs text-amber-900">
                      {subscription.snoozedUntil
                        ? `Snoozed until ${new Date(subscription.snoozedUntil).toLocaleString()}`
                        : "Muted"}
                      {subscription.mutedOrSnoozedReason
                        ? ` · ${subscription.mutedOrSnoozedReason}`
                        : ""}
                    </p>
                  ) : null}
                  <p className="text-xs text-slate">
                    Digest cooldown {subscription.digestCooldownMinutes} min
                    {subscription.lastDigestAt
                      ? ` · Last digest ${new Date(subscription.lastDigestAt).toLocaleString()}`
                      : " · No digest sent yet"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                    href={`${APP_ROUTES.adminOperationsSubscriptions}/${subscription.id}`}
                  >
                    View Health
                  </Link>
                  <Link
                    className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                    href={subscriptionHrefMap[subscription.id] ?? returnTo}
                  >
                    Load Filters
                  </Link>
                  <form action={generateSubscriptionDigestAction}>
                    <input name="subscriptionId" type="hidden" value={subscription.id} />
                    <input name="returnTo" type="hidden" value={returnTo} />
                    {subscription.automationState !== "active" ? (
                      <input name="overrideAutomationState" type="hidden" value="true" />
                    ) : null}
                    <button
                      className="inline-flex rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-sm font-semibold text-cyan-900 transition hover:bg-cyan/20"
                      type="submit"
                    >
                      {subscription.automationState === "active"
                        ? "Generate Digest"
                        : "Generate Digest Anyway"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <div className="rounded-2xl border border-ink/10 bg-pearl px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                    Health Drill-down
                  </p>
                  <p className="mt-2 text-sm font-semibold text-ink">
                    {getAutomationHealthMeta(subscription.healthStatus).label}
                  </p>
                  <p className="mt-1 text-xs text-slate">
                    Last success{" "}
                    {subscription.lastSuccessAt
                      ? new Date(subscription.lastSuccessAt).toLocaleString()
                      : "not recorded"}
                  </p>
                  <p className="text-xs text-slate">
                    Last failure{" "}
                    {subscription.lastFailureAt
                      ? new Date(subscription.lastFailureAt).toLocaleString()
                      : "not recorded"}
                  </p>
                  <p className="text-xs text-slate">
                    Last skip {subscription.lastSkipReason ?? "not recorded"}
                  </p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-pearl px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                    Skip Trends
                  </p>
                  <div className="mt-2">
                    {renderReasonChips(
                      summarizeAutomationReasons(
                        getDigestRuns(subscription.id, recentDigestRuns),
                        "skip",
                        3
                      )
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-pearl px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                    Failure Trends
                  </p>
                  <div className="mt-2">
                    {renderReasonChips(
                      summarizeAutomationReasons(
                        getDigestRuns(subscription.id, recentDigestRuns),
                        "failure",
                        3
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {buildManualRerunGuidance(
                  subscription,
                  getDigestRuns(subscription.id, recentDigestRuns),
                  { manualOverride: subscription.automationState !== "active" }
                ).map((item, index) => (
                  <p
                    className={guidanceBannerClassName(item.tone)}
                    key={`${subscription.id}-guidance-${index}`}
                  >
                    {item.message}
                  </p>
                ))}
              </div>

              <form
                action={updateQueueSubscriptionAction}
                className="mt-4 grid gap-3 md:grid-cols-[1fr_160px_auto_auto_auto]"
              >
                <input name="subscriptionId" type="hidden" value={subscription.id} />
                <input name="entityType" type="hidden" value={entityType} />
                <input name="filtersJson" type="hidden" value={currentFiltersJson} />
                <input name="returnTo" type="hidden" value={returnTo} />
                <input
                  className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                  defaultValue={subscription.name}
                  name="name"
                  required
                  type="text"
                />
                <input
                  className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                  defaultValue={subscription.digestCooldownMinutes}
                  min={0}
                  name="digestCooldownMinutes"
                  type="number"
                />
                <label className="inline-flex items-center gap-2 rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink">
                  <input defaultChecked={subscription.isActive} name="isActive" type="checkbox" value="true" />
                  <span>Active</span>
                </label>
                <button
                  className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                  type="submit"
                >
                  Save
                </button>
                <button
                  className="inline-flex rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-sm font-semibold text-cyan-900 transition hover:bg-cyan/20"
                  name="replaceFilters"
                  type="submit"
                  value="true"
                >
                  Update To Current Filters
                </button>
              </form>

              <form
                action={updateQueueSubscriptionAutomationControlAction}
                className="mt-3 grid gap-3 rounded-2xl border border-ink/10 bg-pearl p-4 md:grid-cols-[1fr_220px_auto_auto_auto]"
              >
                <input name="subscriptionId" type="hidden" value={subscription.id} />
                <input name="returnTo" type="hidden" value={returnTo} />
                <input
                  className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                  defaultValue={subscription.mutedOrSnoozedReason ?? ""}
                  name="automationReason"
                  placeholder="Reason for mute or snooze"
                  type="text"
                />
                <input
                  className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                  defaultValue={toDatetimeLocalValue(subscription.snoozedUntil)}
                  name="snoozedUntil"
                  type="datetime-local"
                />
                <button
                  className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                  name="automationAction"
                  type="submit"
                  value={subscription.isMuted ? "unmute" : "mute"}
                >
                  {subscription.isMuted ? "Unmute" : "Mute"}
                </button>
                <button
                  className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                  name="automationAction"
                  type="submit"
                  value="snooze"
                >
                  Snooze Custom
                </button>
                <button
                  className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
                  name="automationAction"
                  type="submit"
                  value="resume"
                >
                  Resume
                </button>
              </form>

              <div className="mt-3 flex flex-wrap gap-2">
                {(["1h", "6h", "24h", "3d"] as const).map((preset) => (
                  <form
                    action={updateQueueSubscriptionAutomationControlAction}
                    key={`${subscription.id}-preset-${preset}`}
                  >
                    <input name="subscriptionId" type="hidden" value={subscription.id} />
                    <input name="returnTo" type="hidden" value={returnTo} />
                    <input name="automationAction" type="hidden" value="snooze" />
                    <button
                      className="inline-flex rounded-full border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-50"
                      name="snoozePreset"
                      type="submit"
                      value={preset}
                    >
                      Snooze {preset}
                    </button>
                  </form>
                ))}
              </div>

              <form action={deleteQueueSubscriptionAction} className="mt-3">
                <input name="subscriptionId" type="hidden" value={subscription.id} />
                <input name="returnTo" type="hidden" value={returnTo} />
                <button
                  className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
                  type="submit"
                >
                  Delete Subscription
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {escalationRules.length === 0 ? null : (
        <div className="space-y-3 rounded-2xl border border-ink/10 bg-pearl px-4 py-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
              Escalation Rules
            </p>
            <p className="text-sm text-slate">
              Manual escalation rules apply queue-pattern logic to the current operations data and escalate matching incidents safely.
            </p>
          </div>

          {escalationRules.map((rule) => (
            <div className="rounded-2xl bg-white px-4 py-4" key={rule.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{rule.name}</p>
                    <span
                      className={
                        rule.isActive
                          ? "rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-900"
                          : "rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700"
                      }
                    >
                      {rule.isActive ? "Active" : "Paused"}
                    </span>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
                      Matches {rule.currentMatchCount}
                    </span>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
                      {rule.runMode}
                    </span>
                    <span className={automationStateClassName(rule.automationState)}>
                      {formatAutomationStateLabel(rule.automationState)}
                    </span>
                    <span className={getAutomationHealthMeta(rule.healthStatus).className}>
                      {getAutomationHealthMeta(rule.healthStatus).label}
                    </span>
                  </div>
                  <p className="text-xs text-rose-700">{rule.escalationReason}</p>
                  <p className="text-xs text-cyan-900">{rule.matchExplanation}</p>
                  <p className="text-xs text-slate">{formatLastAutomationEvent(rule)}</p>
                  <p className="text-xs text-slate">{buildAutomationTrendSummary(rule)}</p>
                  {rule.lastSkipReason ? (
                    <p className="text-xs text-amber-900">{rule.lastSkipReason}</p>
                  ) : null}
                  {rule.snoozedUntil || rule.mutedOrSnoozedReason ? (
                    <p className="text-xs text-amber-900">
                      {rule.snoozedUntil
                        ? `Snoozed until ${new Date(rule.snoozedUntil).toLocaleString()}`
                        : "Muted"}
                      {rule.mutedOrSnoozedReason ? ` · ${rule.mutedOrSnoozedReason}` : ""}
                    </p>
                  ) : null}
                  <p className="text-xs text-slate">
                    Cooldown {rule.cooldownMinutes} min · Max {rule.maxMatchesPerRun} matches/run
                    {rule.lastRunAt
                      ? ` · Last run ${new Date(rule.lastRunAt).toLocaleString()}`
                      : " · No runs yet"}
                    {rule.nextRunAt
                      ? ` · Next eligible ${new Date(rule.nextRunAt).toLocaleString()}`
                      : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                    href={`${APP_ROUTES.adminOperationsRules}/${rule.id}`}
                  >
                    View Health
                  </Link>
                  <Link
                    className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                    href={escalationRuleHrefMap[rule.id] ?? returnTo}
                  >
                    Load Filters
                  </Link>
                  <form action={applyEscalationRuleAction}>
                    <input name="ruleId" type="hidden" value={rule.id} />
                    <input name="returnTo" type="hidden" value={returnTo} />
                    {rule.automationState !== "active" ? (
                      <input name="overrideAutomationState" type="hidden" value="true" />
                    ) : null}
                    <button
                      className="inline-flex rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                      type="submit"
                    >
                      {rule.automationState === "active" ? "Apply Rule" : "Apply Rule Anyway"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <div className="rounded-2xl border border-ink/10 bg-pearl px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                    Health Drill-down
                  </p>
                  <p className="mt-2 text-sm font-semibold text-ink">
                    {getAutomationHealthMeta(rule.healthStatus).label}
                  </p>
                  <p className="mt-1 text-xs text-slate">
                    Last success{" "}
                    {rule.lastSuccessAt
                      ? new Date(rule.lastSuccessAt).toLocaleString()
                      : "not recorded"}
                  </p>
                  <p className="text-xs text-slate">
                    Last failure{" "}
                    {rule.lastFailureAt
                      ? new Date(rule.lastFailureAt).toLocaleString()
                      : "not recorded"}
                  </p>
                  <p className="text-xs text-slate">
                    Last skip {rule.lastSkipReason ?? "not recorded"}
                  </p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-pearl px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                    Skip Trends
                  </p>
                  <div className="mt-2">
                    {renderReasonChips(
                      summarizeAutomationReasons(getRuleRuns(rule.id, recentRuleRuns), "skip", 3)
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-pearl px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                    Failure Trends
                  </p>
                  <div className="mt-2">
                    {renderReasonChips(
                      summarizeAutomationReasons(
                        getRuleRuns(rule.id, recentRuleRuns),
                        "failure",
                        3
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {buildManualRerunGuidance(rule, getRuleRuns(rule.id, recentRuleRuns), {
                  manualOverride: rule.automationState !== "active"
                }).map((item, index) => (
                  <p
                    className={guidanceBannerClassName(item.tone)}
                    key={`${rule.id}-guidance-${index}`}
                  >
                    {item.message}
                  </p>
                ))}
              </div>

              <form
                action={updateEscalationRuleAction}
                className="mt-4 grid gap-3 md:grid-cols-[1fr_1.2fr_140px_140px_140px_auto_auto]"
              >
                <input name="ruleId" type="hidden" value={rule.id} />
                <input name="entityType" type="hidden" value={entityType} />
                <input name="filtersJson" type="hidden" value={currentFiltersJson} />
                <input name="returnTo" type="hidden" value={returnTo} />
                <input
                  className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                  defaultValue={rule.name}
                  name="name"
                  required
                  type="text"
                />
                <input
                  className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                  defaultValue={rule.escalationReason}
                  name="escalationReason"
                  required
                  type="text"
                />
                <select
                  className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                  defaultValue={rule.runMode}
                  name="runMode"
                >
                  <option value="manual">Manual</option>
                  <option value="automated">Automated</option>
                </select>
                <input
                  className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                  defaultValue={rule.cooldownMinutes}
                  min={0}
                  name="cooldownMinutes"
                  type="number"
                />
                <input
                  className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                  defaultValue={rule.maxMatchesPerRun}
                  min={1}
                  name="maxMatchesPerRun"
                  type="number"
                />
                <label className="inline-flex items-center gap-2 rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink">
                  <input defaultChecked={rule.isActive} name="isActive" type="checkbox" value="true" />
                  <span>Active</span>
                </label>
                <button
                  className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                  type="submit"
                >
                  Save
                </button>
                <button
                  className="inline-flex rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-sm font-semibold text-cyan-900 transition hover:bg-cyan/20"
                  name="replaceFilters"
                  type="submit"
                  value="true"
                >
                  Update To Current Filters
                </button>
              </form>

              <form
                action={updateEscalationRuleAutomationControlAction}
                className="mt-3 grid gap-3 rounded-2xl border border-ink/10 bg-pearl p-4 md:grid-cols-[1fr_220px_auto_auto_auto]"
              >
                <input name="ruleId" type="hidden" value={rule.id} />
                <input name="returnTo" type="hidden" value={returnTo} />
                <input
                  className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                  defaultValue={rule.mutedOrSnoozedReason ?? ""}
                  name="automationReason"
                  placeholder="Reason for mute or snooze"
                  type="text"
                />
                <input
                  className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                  defaultValue={toDatetimeLocalValue(rule.snoozedUntil)}
                  name="snoozedUntil"
                  type="datetime-local"
                />
                <button
                  className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                  name="automationAction"
                  type="submit"
                  value={rule.isMuted ? "unmute" : "mute"}
                >
                  {rule.isMuted ? "Unmute" : "Mute"}
                </button>
                <button
                  className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                  name="automationAction"
                  type="submit"
                  value="snooze"
                >
                  Snooze Custom
                </button>
                <button
                  className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
                  name="automationAction"
                  type="submit"
                  value="resume"
                >
                  Resume
                </button>
              </form>

              <div className="mt-3 flex flex-wrap gap-2">
                {(["1h", "6h", "24h", "3d"] as const).map((preset) => (
                  <form
                    action={updateEscalationRuleAutomationControlAction}
                    key={`${rule.id}-preset-${preset}`}
                  >
                    <input name="ruleId" type="hidden" value={rule.id} />
                    <input name="returnTo" type="hidden" value={returnTo} />
                    <input name="automationAction" type="hidden" value="snooze" />
                    <button
                      className="inline-flex rounded-full border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-50"
                      name="snoozePreset"
                      type="submit"
                      value={preset}
                    >
                      Snooze {preset}
                    </button>
                  </form>
                ))}
              </div>

              <form action={deleteEscalationRuleAction} className="mt-3">
                <input name="ruleId" type="hidden" value={rule.id} />
                <input name="returnTo" type="hidden" value={returnTo} />
                <button
                  className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
                  type="submit"
                >
                  Delete Rule
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {recentRuleRuns.length === 0 ? null : (
        <div className="space-y-3 rounded-2xl border border-ink/10 bg-pearl px-4 py-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
              Recent Rule Runs
            </p>
            <p className="text-sm text-slate">
              Manual and automated escalation-rule activity for this queue.
            </p>
          </div>
          {recentRuleRuns.map((run) => (
            <div className="rounded-2xl bg-white px-4 py-4" key={run.id}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-rose-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-900">
                  {run.triggeredBy}
                </span>
                <span className={runStatusClassName(run.runStatus)}>{run.runStatus}</span>
                <p className="text-sm font-semibold text-ink">
                  {run.escalatedCount}/{run.matchedCount} escalated
                </p>
              </div>
              <p className="mt-2 text-sm text-slate">{run.runSummary}</p>
              {run.skipReason ? (
                <p className="mt-2 text-xs text-amber-900">{run.skipReason}</p>
              ) : null}
              {run.failureReason ? (
                <p className="mt-2 text-xs text-rose-700">{run.failureReason}</p>
              ) : null}
              <p className="mt-2 text-xs text-slate">
                {new Date(run.createdAt).toLocaleString()}
                {run.triggeredByAdminUserLabel ? ` by ${run.triggeredByAdminUserLabel}` : ""}
                {run.durationMs !== null ? ` · ${run.durationMs} ms` : ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {recentDigestRuns.length === 0 ? null : (
        <div className="space-y-3 rounded-2xl border border-ink/10 bg-pearl px-4 py-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
              Recent Digests
            </p>
            <p className="text-sm text-slate">
              Recent queue-digest summaries delivered in-app for this queue.
            </p>
          </div>
          {recentDigestRuns.map((digestRun) => (
            <div className="rounded-2xl bg-white px-4 py-4" key={digestRun.id}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-cyan/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-900">
                  {digestRun.deliveredVia}
                </span>
                <span className="rounded-full bg-cyan/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-900">
                  {digestRun.triggeredBy}
                </span>
                <span className={runStatusClassName(digestRun.runStatus)}>{digestRun.runStatus}</span>
                <p className="text-sm font-semibold text-ink">
                  {digestRun.matchCount} matches
                </p>
              </div>
              <p className="mt-2 text-sm text-slate">{digestRun.digestSummary}</p>
              {digestRun.skipReason ? (
                <p className="mt-2 text-xs text-amber-900">{digestRun.skipReason}</p>
              ) : null}
              {digestRun.failureReason ? (
                <p className="mt-2 text-xs text-rose-700">{digestRun.failureReason}</p>
              ) : null}
              <p className="mt-2 text-xs text-slate">
                {new Date(digestRun.createdAt).toLocaleString()}
                {digestRun.triggeredByAdminUserLabel
                  ? ` by ${digestRun.triggeredByAdminUserLabel}`
                  : ""}
                {digestRun.durationMs !== null ? ` · ${digestRun.durationMs} ms` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
