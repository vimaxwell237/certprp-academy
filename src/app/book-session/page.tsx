import Link from "next/link";
import { redirect } from "next/navigation";

import { LockedFeatureCard } from "@/features/billing/components/locked-feature-card";
import {
  buildLockedFeatureModel,
  canAccessTutorSupport
} from "@/features/billing/data/billing-service";
import { BookingForm } from "@/features/scheduling/components/booking-form";
import { FlashBanner } from "@/features/scheduling/components/flash-banner";
import { fetchTutorBookingFormData } from "@/features/scheduling/data/scheduling-service";
import { TutorCard } from "@/features/support/components/tutor-card";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export default async function BookSessionPage({
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

  if (!(await canAccessTutorSupport(user.id))) {
    const lockedContent = buildLockedFeatureModel("tutor_support_access");

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.sessions}
        >
          Back to Sessions
        </Link>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
            Live Tutor Scheduling
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
            Book a Tutor Session
          </h1>
          <p className="max-w-2xl text-base text-slate">
            Live session booking is part of the Tutor Plan. Upgrade to reserve tutor time
            directly from available slots.
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
    const formData = await fetchTutorBookingFormData(user.id, resolvedSearchParams);

    return (
      <section className="w-full space-y-8 pb-12">
        {success ? <FlashBanner message={success} tone="success" /> : null}
        {error ? <FlashBanner message={error} tone="error" /> : null}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
              Live Tutor Scheduling
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
              Book a Tutor Session
            </h1>
            <p className="max-w-2xl text-base text-slate">
              Browse open availability, filter by tutor, and send a live-help request with
              the exact study subject you want to cover.
            </p>
          </div>

          <Link
            className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
            href={APP_ROUTES.sessions}
          >
            View Your Sessions
          </Link>
        </div>

        <form className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft" method="get">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className="space-y-2 text-sm font-medium text-ink">
              <span>Filter by Tutor</span>
              <select
                className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan/60"
                defaultValue={formData.selectedTutorProfileId}
                name="tutorProfileId"
              >
                <option value="">All active tutors</option>
                {formData.tutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.displayName}
                  </option>
                ))}
              </select>
            </label>

            {formData.supportContext ? (
              <input
                name="supportRequestId"
                type="hidden"
                value={formData.supportContext.requestId}
              />
            ) : null}
            {formData.initialValues.subject ? (
              <input name="subject" type="hidden" value={formData.initialValues.subject} />
            ) : null}
            <input name="category" type="hidden" value={formData.initialValues.category} />
            {formData.initialValues.notes ? (
              <input name="notes" type="hidden" value={formData.initialValues.notes} />
            ) : null}

            <button
              className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
              type="submit"
            >
              Apply Filter
            </button>
          </div>
        </form>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <BookingForm formData={formData} />

          <div className="space-y-5">
            <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Tutor Availability
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                Active Tutors
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate">
                Use the filter to narrow the available slot list to a specific mentor.
              </p>
            </div>

            {formData.tutors.length === 0 ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                No active tutors are available yet. Activate a tutor profile and publish
                availability from the tutor workspace first.
              </div>
            ) : (
              <div className="grid gap-5">
                {formData.tutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            )}
          </div>
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
          <p className="font-semibold">Unable to prepare tutor booking.</p>
          <p className="mt-2 text-sm">
            Confirm the Phase 11 scheduling migration has been executed in Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}
