import Link from "next/link";
import { redirect } from "next/navigation";

import { LockedFeatureCard } from "@/features/billing/components/locked-feature-card";
import {
  buildLockedFeatureModel,
  canAccessTutorSupport
} from "@/features/billing/data/billing-service";
import { SupportRequestForm } from "@/features/support/components/support-request-form";
import { TutorCard } from "@/features/support/components/tutor-card";
import { fetchSupportCreateFormData } from "@/features/support/data/support-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { getCurrentUser } from "@/lib/auth/session";

export default async function NewSupportRequestPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const resolvedSearchParams = await searchParams;

  if (!(await canAccessTutorSupport(user.id))) {
    const lockedContent = buildLockedFeatureModel("tutor_support_access");

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.support}
        >
          Back to Support
        </Link>
        <LockedFeatureCard
          description={lockedContent.description}
          title={lockedContent.title}
        />
      </section>
    );
  }

  try {
    const formData = await fetchSupportCreateFormData(user.id, resolvedSearchParams);

    return (
      <section className="w-full max-w-6xl space-y-8 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.support}
        >
          Back to Support
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <SupportRequestForm formData={formData} />

          <div className="space-y-5">
            <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Tutor Matching
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                Available Tutors
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate">
                Leave the tutor field unassigned if you want the request to land in the
                general tutor queue.
              </p>
            </div>

            {formData.tutors.length === 0 ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                No tutor profiles are active yet. Run the Phase 7 seed SQL after at least one
                auth user exists, or create a tutor profile directly in Supabase.
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
  } catch (error) {
    const message = getPublicErrorMessage(
      error,
      "Support request form data could not be loaded right now."
    );

    return (
      <section className="w-full space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.support}
        >
          Back to Support
        </Link>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to prepare the support request form.</p>
          <p className="mt-2 text-sm">
            Confirm the Phase 7 migration and seed SQL has been executed in Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}
