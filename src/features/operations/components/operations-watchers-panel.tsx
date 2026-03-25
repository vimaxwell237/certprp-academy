import {
  updateWatchPreferencesAction,
  unwatchIncidentAction,
  watchIncidentAction
} from "@/features/operations/actions/operations-actions";
import { getAutomationHealthMeta } from "@/features/operations/lib/health";
import type {
  OperationQueueSubscriptionRecord,
  OperationEntityType,
  OperationWatcherRecord
} from "@/types/operations";

export function OperationsWatchersPanel({
  entityType,
  entityId,
  watchers,
  matchingSubscriptions,
  currentAdminUserId,
  returnTo
}: {
  entityType: OperationEntityType;
  entityId: string;
  watchers: OperationWatcherRecord[];
  matchingSubscriptions: OperationQueueSubscriptionRecord[];
  currentAdminUserId: string;
  returnTo: string;
}) {
  const currentWatcher =
    watchers.find((watcher) => watcher.adminUserId === currentAdminUserId) ?? null;
  const isWatching = Boolean(currentWatcher);

  return (
    <div className="space-y-4 rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
          Watch State
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">Incident Watchers</h3>
        <p className="text-sm text-slate">
          Follow incident changes without taking ownership. Watchers get in-app updates for
          workflow changes, ownership changes, and collaboration activity.
        </p>
      </div>

      <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
        <p>
          <span className="font-semibold text-ink">Watching:</span> {watchers.length} admin
          {watchers.length === 1 ? "" : "s"}
        </p>
        {watchers.length > 1 ? (
          <p className="mt-2 text-xs text-amber-900">
            This incident has team follow coverage across multiple admins.
          </p>
        ) : null}
        {currentWatcher ? (
          <p className="mt-2 text-xs">
            {currentWatcher.isMuted
              ? "Your watch is muted. You will not receive watcher updates until you unmute."
              : "Your watch is active. Preference toggles below control which watcher updates you receive."}
          </p>
        ) : null}
        {matchingSubscriptions.length > 0 ? (
          <div className="mt-2 space-y-2 text-xs text-cyan-900">
            <p>Your active queue subscriptions matching this incident:</p>
            {matchingSubscriptions.map((subscription) => (
              <div className="rounded-2xl bg-white/80 px-3 py-2" key={subscription.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink">{subscription.name}</p>
                  <span className={getAutomationHealthMeta(subscription.healthStatus).className}>
                    {getAutomationHealthMeta(subscription.healthStatus).label}
                  </span>
                  <span className="rounded-full bg-cyan/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-900">
                    Matches {subscription.currentMatchCount}
                  </span>
                </div>
                <p>{subscription.matchExplanation}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <form action={isWatching ? unwatchIncidentAction : watchIncidentAction}>
        <input name="entityType" type="hidden" value={entityType} />
        <input name="entityId" type="hidden" value={entityId} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <button
          className={
            isWatching
              ? "inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
              : "inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
          }
          type="submit"
        >
          {isWatching ? "Unwatch Incident" : "Watch Incident"}
        </button>
      </form>

      {currentWatcher ? (
        <form action={updateWatchPreferencesAction} className="space-y-3 rounded-2xl bg-pearl px-4 py-4">
          <input name="entityType" type="hidden" value={entityType} />
          <input name="entityId" type="hidden" value={entityId} />
          <input name="returnTo" type="hidden" value={returnTo} />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            Follow Preferences
          </p>
          <label className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink">
            <input
              defaultChecked={currentWatcher.isMuted}
              name="isMuted"
              type="checkbox"
              value="true"
            />
            <span>Mute watcher updates</span>
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink">
            <input
              defaultChecked={currentWatcher.notifyOnComment}
              name="notifyOnComment"
              type="checkbox"
              value="true"
            />
            <span>Notify on new comments</span>
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink">
            <input
              defaultChecked={currentWatcher.notifyOnOwnerChange}
              name="notifyOnOwnerChange"
              type="checkbox"
              value="true"
            />
            <span>Notify on owner changes</span>
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink">
            <input
              defaultChecked={currentWatcher.notifyOnWorkflowChange}
              name="notifyOnWorkflowChange"
              type="checkbox"
              value="true"
            />
            <span>Notify on workflow changes</span>
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink">
            <input
              defaultChecked={currentWatcher.notifyOnResolve}
              name="notifyOnResolve"
              type="checkbox"
              value="true"
            />
            <span>Notify on resolve or reopen</span>
          </label>
          <button
            className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
            type="submit"
          >
            Save Preferences
          </button>
        </form>
      ) : null}

      {watchers.length === 0 ? (
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
          Nobody is watching this incident yet.
        </div>
      ) : (
        <div className="space-y-3">
          {watchers.map((watcher) => (
            <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate" key={watcher.id}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-ink">{watcher.adminUserLabel}</p>
                <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
                  @{watcher.adminUserHandle}
                </span>
                {watcher.isMuted ? (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900">
                    Muted
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-xs">
                Watching since {new Date(watcher.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
