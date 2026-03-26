import Link from "next/link";
import { redirect } from "next/navigation";

import { LockedFeatureCard } from "@/features/billing/components/locked-feature-card";
import {
  buildLockedFeatureModel,
  canAccessTutorSupport
} from "@/features/billing/data/billing-service";
import { SupportRequestCard } from "@/features/support/components/support-request-card";
import { fetchSupportOverview } from "@/features/support/data/support-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { getCurrentUser } from "@/lib/auth/session";

export default async function SupportPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  if (!(await canAccessTutorSupport(user.id))) {
    const lockedContent = buildLockedFeatureModel("tutor_support_access");

    return (
      <section className="w-full space-y-8 pb-12">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
            Tutor Support
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Support Requests
          </h1>
          <p className="max-w-2xl text-base text-slate">
            Tutor-backed support is part of the Tutor Plan. Upgrade to open support
            threads, message tutors, and route help requests from lessons, quizzes, labs,
            exams, and CLI practice.
          </p>
        </div>
        <LockedFeatureCard
          description={lockedContent.description}
          title={lockedContent.title}
        />
      </section>
    );
  }

  try {
    const overview = await fetchSupportOverview(user.id);

    return (
      <section className="w-full space-y-8 pb-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
              Tutor Support
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Support Requests
            </h1>
            <p className="max-w-2xl text-base text-slate">
              Create a support thread, continue existing conversations, and review tutor
              responses tied to your learning activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.bookSession}
            >
              Book Live Session
            </Link>
            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.tutors}
            >
              View Tutors
            </Link>
            <Link
              className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
              href={APP_ROUTES.supportNew}
            >
              New Support Request
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
              Learner View
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Your Requests
            </h2>
          </div>

          {overview.learnerRequests.length === 0 ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
              You have not created any support requests yet.
            </div>
          ) : (
            <div className="grid gap-5">
              {overview.learnerRequests.map((request) => (
                <SupportRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>

        {overview.tutorProfile ? (
          <div className="space-y-5">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Tutor View
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Active Tutor Queue
              </h2>
              <p className="text-sm text-slate">
                Signed in with tutor access as {overview.tutorProfile.displayName}.
              </p>
            </div>

            {overview.tutorRequests.length === 0 ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                No open or assigned support requests are waiting in your tutor queue.
              </div>
            ) : (
              <div className="grid gap-5">
              {overview.tutorRequests.map((request) => (
                <SupportRequestCard
                  key={request.id}
                  request={request}
                  showBookingCta={false}
                  subtitle="Tutor queue request"
                />
              ))}
              </div>
            )}
          </div>
        ) : null}
      </section>
    );
  } catch (error) {
    const message = getPublicErrorMessage(
      error,
      "Support requests could not be loaded right now."
    );

    return (
      <section className="w-full space-y-6 pb-12">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Support Requests
        </h1>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load support requests.</p>
          <p className="mt-2 text-sm">
            Confirm the Phase 7 migration and seed SQL has been executed in Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}
