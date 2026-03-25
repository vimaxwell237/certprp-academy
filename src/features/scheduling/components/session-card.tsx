import type { ReactNode } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { getBookingCategoryLabel } from "@/features/scheduling/lib/scheduling-display";
import { SessionStatusBadge } from "@/features/scheduling/components/session-status-badge";
import { APP_ROUTES } from "@/lib/auth/redirects";
import type { TutorSessionListItem } from "@/types/scheduling";

export function SessionCard({
  session,
  metaLabel,
  actions
}: {
  session: TutorSessionListItem;
  metaLabel: string;
  actions?: ReactNode;
}) {
  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SessionStatusBadge status={session.status} />
          <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            {getBookingCategoryLabel(session.category)}
          </span>
          {session.followup ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900">
              Follow-up Ready
            </span>
          ) : null}
          {session.reminderState?.pendingCount ? (
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-900">
              {session.reminderState.pendingCount} reminder
              {session.reminderState.pendingCount === 1 ? "" : "s"} queued
            </span>
          ) : null}
        </div>

        <div className="space-y-1">
          <h3 className="font-display text-2xl font-semibold text-ink">{session.subject}</h3>
          <p className="text-sm text-slate">{metaLabel}</p>
        </div>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Starts</p>
          <p className="font-semibold text-ink">
            {new Date(session.scheduledStartsAt).toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Ends</p>
          <p className="font-semibold text-ink">
            {new Date(session.scheduledEndsAt).toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3 sm:col-span-2">
          <p className="text-slate">Reminder State</p>
          <p className="font-semibold text-ink">
            {session.reminderState?.nextScheduledFor
              ? `Next reminder ${new Date(session.reminderState.nextScheduledFor).toLocaleString()}`
              : "No pending reminders queued"}
          </p>
          {session.reminderState && session.reminderState.retryCount > 0 ? (
            <p className="mt-1 text-xs text-slate">
              Retry attempts so far: {session.reminderState.retryCount}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
        <p>
          <span className="font-semibold text-ink">Tutor:</span> {session.tutorDisplayName}
        </p>
        <p>
          <span className="font-semibold text-ink">Meeting Link:</span>{" "}
          {session.meetingLink ? (
            <Link
              className="font-semibold text-cyan transition hover:text-teal"
              href={session.meetingLink}
              rel="noreferrer"
              target="_blank"
            >
              Join Session
            </Link>
          ) : (
            "Pending tutor confirmation"
          )}
        </p>
        <p>
          <span className="font-semibold text-ink">Notes:</span>{" "}
          {session.notes ?? "No notes added yet."}
        </p>
        {session.supportRequestId ? (
          <p>
            <span className="font-semibold text-ink">Support Context:</span>{" "}
            <Link
              className="font-semibold text-cyan transition hover:text-teal"
              href={`${APP_ROUTES.support}/${session.supportRequestId}`}
            >
              Open Linked Thread
            </Link>
          </p>
        ) : null}
      </div>

      {session.followup ? (
        <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
          <p className="text-sm font-semibold uppercase tracking-[0.16em]">
            Tutor Follow-Up
          </p>
          <p>
            <span className="font-semibold">Summary:</span> {session.followup.summary}
          </p>
          {session.followup.recommendations ? (
            <p>
              <span className="font-semibold">Recommendations:</span>{" "}
              {session.followup.recommendations}
            </p>
          ) : null}
          {session.followup.homework ? (
            <p>
              <span className="font-semibold">Homework:</span> {session.followup.homework}
            </p>
          ) : null}
          {session.followup.nextSteps ? (
            <p>
              <span className="font-semibold">Next Steps:</span> {session.followup.nextSteps}
            </p>
          ) : null}
        </div>
      ) : null}

      {actions ? <div className="space-y-4">{actions}</div> : null}
    </Card>
  );
}
