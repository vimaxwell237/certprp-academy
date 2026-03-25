import type { ReactNode } from "react";

import {
  updateTutorSessionAction,
  upsertTutorSessionFollowupAction
} from "@/features/scheduling/actions/scheduling-actions";
import { FlashBanner } from "@/features/scheduling/components/flash-banner";
import { SessionCard } from "@/features/scheduling/components/session-card";
import { fetchTutorSessionsOverview } from "@/features/scheduling/data/scheduling-service";
import { TUTOR_SESSION_STATUS_OPTIONS } from "@/features/scheduling/lib/scheduling-display";
import { requireTutorUser } from "@/lib/auth/roles";

function TutorSessionActions({
  sessionId,
  currentStatus,
  meetingLink,
  notes
}: {
  sessionId: string;
  currentStatus: string;
  meetingLink: string | null;
  notes: string | null;
}) {
  return (
    <form action={updateTutorSessionAction} className="space-y-4">
      <input name="sessionId" type="hidden" value={sessionId} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Status</span>
          <select
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan/60"
            defaultValue={currentStatus}
            name="status"
          >
            {TUTOR_SESSION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Meeting Link</span>
          <input
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan/60"
            defaultValue={meetingLink ?? ""}
            name="meetingLink"
            placeholder="https://meeting.example.com/room"
            type="url"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-ink">
        <span>Tutor Notes</span>
        <textarea
          className="min-h-28 w-full rounded-3xl border border-ink/10 bg-white px-4 py-4 text-sm leading-7 outline-none transition focus:border-cyan/60"
          defaultValue={notes ?? ""}
          name="notes"
          placeholder="Add the agenda, follow-up actions, or session outcomes."
        />
      </label>

      <button
        className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
        type="submit"
      >
        Save Session Update
      </button>
    </form>
  );
}

function TutorFollowupActions({
  sessionId,
  summary,
  recommendations,
  homework,
  nextSteps
}: {
  sessionId: string;
  summary: string | null;
  recommendations: string | null;
  homework: string | null;
  nextSteps: string | null;
}) {
  return (
    <form
      action={upsertTutorSessionFollowupAction}
      className="space-y-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5"
    >
      <input name="sessionId" type="hidden" value={sessionId} />
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-900">
          Tutor Follow-Up
        </p>
        <h3 className="font-display text-xl font-semibold text-emerald-950">
          Save Post-Session Guidance
        </h3>
      </div>

      <label className="block space-y-2 text-sm font-medium text-emerald-950">
        <span>Summary</span>
        <textarea
          className="min-h-24 w-full rounded-3xl border border-emerald-200 bg-white px-4 py-4 text-sm leading-7 outline-none transition focus:border-emerald-500"
          defaultValue={summary ?? ""}
          name="summary"
          placeholder="Summarize what was covered during the session."
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-emerald-950">
          <span>Recommendations</span>
          <textarea
            className="min-h-24 w-full rounded-3xl border border-emerald-200 bg-white px-4 py-4 text-sm leading-7 outline-none transition focus:border-emerald-500"
            defaultValue={recommendations ?? ""}
            name="recommendations"
            placeholder="Suggested study focus or review areas."
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-emerald-950">
          <span>Homework</span>
          <textarea
            className="min-h-24 w-full rounded-3xl border border-emerald-200 bg-white px-4 py-4 text-sm leading-7 outline-none transition focus:border-emerald-500"
            defaultValue={homework ?? ""}
            name="homework"
            placeholder="Labs, quizzes, or practice tasks for the learner."
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-emerald-950">
        <span>Next Steps</span>
        <textarea
          className="min-h-24 w-full rounded-3xl border border-emerald-200 bg-white px-4 py-4 text-sm leading-7 outline-none transition focus:border-emerald-500"
          defaultValue={nextSteps ?? ""}
          name="nextSteps"
          placeholder="Describe the next study or live-help actions."
        />
      </label>

      <button
        className="inline-flex rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-950"
        type="submit"
      >
        Save Follow-Up
      </button>
    </form>
  );
}

function SessionSection({
  title,
  subtitle,
  emptyState,
  sessions,
  renderActions
}: {
  title: string;
  subtitle: string;
  emptyState: string;
  sessions: Awaited<ReturnType<typeof fetchTutorSessionsOverview>>["pendingSessions"];
  renderActions?: (
    session: Awaited<ReturnType<typeof fetchTutorSessionsOverview>>["pendingSessions"][number]
  ) => ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          {subtitle}
        </p>
        <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          {emptyState}
        </div>
      ) : (
        <div className="grid gap-5">
          {sessions.map((session) => (
            <SessionCard
              actions={renderActions ? renderActions(session) : undefined}
              key={session.id}
              metaLabel={`Learner request ${session.learnerUserId.slice(0, 8)} | ${new Date(session.createdAt).toLocaleString()}`}
              session={session}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TutorWorkloadPanel({
  pendingRequests,
  todaySessions,
  sessionsNeedingFollowup,
  overdueFollowups,
  sessionsAwaitingReminders
}: {
  pendingRequests: number;
  todaySessions: number;
  sessionsNeedingFollowup: number;
  overdueFollowups: number;
  sessionsAwaitingReminders: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      <div className="rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Pending
        </p>
        <p className="mt-3 text-3xl font-semibold text-ink">{pendingRequests}</p>
      </div>
      <div className="rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Today
        </p>
        <p className="mt-3 text-3xl font-semibold text-ink">{todaySessions}</p>
      </div>
      <div className="rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Need Follow-Up
        </p>
        <p className="mt-3 text-3xl font-semibold text-ink">{sessionsNeedingFollowup}</p>
      </div>
      <div className="rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Overdue
        </p>
        <p className="mt-3 text-3xl font-semibold text-ink">{overdueFollowups}</p>
      </div>
      <div className="rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Awaiting Reminders
        </p>
        <p className="mt-3 text-3xl font-semibold text-ink">{sessionsAwaitingReminders}</p>
      </div>
    </div>
  );
}

export default async function TutorSessionsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireTutorUser();
  const resolvedSearchParams = await searchParams;
  const success =
    (Array.isArray(resolvedSearchParams.success)
      ? resolvedSearchParams.success[0]
      : resolvedSearchParams.success) ?? "";
  const error =
    (Array.isArray(resolvedSearchParams.error)
      ? resolvedSearchParams.error[0]
      : resolvedSearchParams.error) ?? "";

  try {
    const overview = await fetchTutorSessionsOverview(user.id);
    const now = Date.now();
    const startOfToday = new Date();

    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const todaySessions = [...overview.upcomingSessions, ...overview.completedSessions].filter(
      (session) => {
        const startTime = new Date(session.scheduledStartsAt).getTime();

        return (
          startTime >= startOfToday.getTime() &&
          startTime < startOfTomorrow.getTime()
        );
      }
    ).length;
    const sessionsNeedingFollowup = overview.completedSessions.filter(
      (session) => !session.followup
    ).length;
    const overdueFollowups = overview.completedSessions.filter(
      (session) =>
        !session.followup &&
        new Date(session.scheduledEndsAt).getTime() < now - 24 * 60 * 60 * 1000
    ).length;
    const sessionsAwaitingReminders = overview.upcomingSessions.filter(
      (session) =>
        new Date(session.scheduledStartsAt).getTime() > now + 15 * 60 * 1000 &&
        !session.reminderState?.pendingCount
    ).length;

    return (
      <section className="space-y-8 pb-12">
        {success ? <FlashBanner message={success} tone="success" /> : null}
        {error ? <FlashBanner message={error} tone="error" /> : null}

        <TutorWorkloadPanel
          overdueFollowups={overdueFollowups}
          pendingRequests={overview.pendingSessions.length}
          sessionsAwaitingReminders={sessionsAwaitingReminders}
          sessionsNeedingFollowup={sessionsNeedingFollowup}
          todaySessions={todaySessions}
        />

        <SessionSection
          emptyState="No pending learner requests yet."
          renderActions={(session) => (
            <TutorSessionActions
              currentStatus={session.status}
              meetingLink={session.meetingLink}
              notes={session.notes}
              sessionId={session.id}
            />
          )}
          sessions={overview.pendingSessions}
          subtitle="Needs Action"
          title="Pending Requests"
        />
        <SessionSection
          emptyState="No confirmed sessions are currently scheduled."
          renderActions={(session) => (
            <TutorSessionActions
              currentStatus={session.status}
              meetingLink={session.meetingLink}
              notes={session.notes}
              sessionId={session.id}
            />
          )}
          sessions={overview.upcomingSessions}
          subtitle="Upcoming"
          title="Confirmed Sessions"
        />
        <SessionSection
          emptyState="No completed tutor sessions yet."
          renderActions={(session) => (
            <TutorFollowupActions
              homework={session.followup?.homework ?? null}
              nextSteps={session.followup?.nextSteps ?? null}
              recommendations={session.followup?.recommendations ?? null}
              sessionId={session.id}
              summary={session.followup?.summary ?? null}
            />
          )}
          sessions={overview.completedSessions}
          subtitle="History"
          title="Completed Sessions"
        />
        <SessionSection
          emptyState="No canceled tutor sessions yet."
          sessions={overview.canceledSessions}
          subtitle="History"
          title="Canceled Sessions"
        />
      </section>
    );
  } catch (serviceError) {
    const message =
      serviceError instanceof Error ? serviceError.message : "Unknown scheduling error.";

    return (
      <section className="space-y-6 pb-12">
        {success ? <FlashBanner message={success} tone="success" /> : null}
        {error ? <FlashBanner message={error} tone="error" /> : null}
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load tutor sessions.</p>
          <p className="mt-2 text-sm">
            Confirm the Phase 14 automation and preferences migration has been executed in
            Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}

