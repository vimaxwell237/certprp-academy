import Link from "next/link";
import { redirect } from "next/navigation";

import {
  buildLockedFeatureModel,
  canAccessTutorSupport
} from "@/features/billing/data/billing-service";
import { cancelLearnerTutorSessionAction } from "@/features/scheduling/actions/scheduling-actions";
import { FlashBanner } from "@/features/scheduling/components/flash-banner";
import { SessionCard } from "@/features/scheduling/components/session-card";
import { fetchLearnerSessionsOverview } from "@/features/scheduling/data/scheduling-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

function LearnerSessionActions({
  sessionId,
  canCancel
}: {
  sessionId: string;
  canCancel: boolean;
}) {
  if (!canCancel) {
    return null;
  }

  return (
    <form action={cancelLearnerTutorSessionAction}>
      <input name="sessionId" type="hidden" value={sessionId} />
      <button
        className="inline-flex rounded-full border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-900 transition hover:bg-rose-50"
        type="submit"
      >
        Cancel Session
      </button>
    </form>
  );
}

export default async function SessionsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

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
    const [overview, canBook] = await Promise.all([
      fetchLearnerSessionsOverview(user.id),
      canAccessTutorSupport(user.id)
    ]);
    const lockedModel = buildLockedFeatureModel("tutor_support_access");

    return (
      <section className="w-full space-y-8 pb-12">
        {success ? <FlashBanner message={success} tone="success" /> : null}
        {error ? <FlashBanner message={error} tone="error" /> : null}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
              Live Tutor Sessions
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Your Session Queue
            </h1>
            <p className="max-w-2xl text-base text-slate">
              Track session requests, review meeting links and tutor follow-ups, and keep
              your live-help history organized.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {canBook ? (
              <Link
                className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                href={APP_ROUTES.bookSession}
              >
                Book a Session
              </Link>
            ) : (
              <Link
                className="inline-flex rounded-full border border-amber-700 px-5 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                href={APP_ROUTES.pricing}
              >
                Upgrade for Live Help
              </Link>
            )}
            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.notifications}
            >
              View Notifications
            </Link>
          </div>
        </div>

        {!canBook ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <p className="font-semibold">{lockedModel.title}</p>
            <p className="mt-2 text-sm">{lockedModel.description}</p>
          </div>
        ) : null}

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
              Upcoming
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Scheduled or Requested Sessions
            </h2>
          </div>

          {overview.upcomingSessions.length === 0 ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
              No upcoming sessions yet. Book a slot when you want live help from a tutor.
            </div>
          ) : (
            <div className="grid gap-5">
              {overview.upcomingSessions.map((session) => (
                <SessionCard
                  actions={
                    <LearnerSessionActions
                      canCancel={
                        ["requested", "confirmed"].includes(session.status) &&
                        new Date(session.scheduledStartsAt).getTime() > Date.now()
                      }
                      sessionId={session.id}
                    />
                  }
                  key={session.id}
                  metaLabel={`Tutor ${session.tutorDisplayName} - Updated ${new Date(session.updatedAt).toLocaleString()}`}
                  session={session}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
              History
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink">Past Sessions</h2>
          </div>

          {overview.pastSessions.length === 0 ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
              No past sessions yet.
            </div>
          ) : (
            <div className="grid gap-5">
              {overview.pastSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  metaLabel={`Tutor ${session.tutorDisplayName} - Updated ${new Date(session.updatedAt).toLocaleString()}`}
                  session={session}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  } catch (serviceError) {
    const message =
      serviceError instanceof Error ? serviceError.message : "Unknown scheduling error.";

    return (
      <section className="w-full space-y-6 pb-12">
        {success ? <FlashBanner message={success} tone="success" /> : null}
        {error ? <FlashBanner message={error} tone="error" /> : null}
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load tutor sessions.</p>
          <p className="mt-2 text-sm">
            Confirm the Phase 12 notification and follow-up migration has been executed in
            Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}
