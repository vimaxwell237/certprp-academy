import { redirect } from "next/navigation";

import { LockedFeatureCard } from "@/features/billing/components/locked-feature-card";
import {
  buildLockedFeatureModel,
  canAccessTutorSupport
} from "@/features/billing/data/billing-service";
import { TutorCard } from "@/features/support/components/tutor-card";
import { fetchTutorCatalog } from "@/features/support/data/support-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { getCurrentUser } from "@/lib/auth/session";

export default async function TutorsPage() {
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
            Tutor Directory
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
            Available Tutors
          </h1>
          <p className="max-w-2xl text-base text-slate">
            Tutor discovery is part of the Tutor Plan. Upgrade to browse mentors and route
            new support requests to a specific tutor.
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
    const tutors = await fetchTutorCatalog();

    return (
      <section className="w-full space-y-8 pb-12">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
            Tutor Directory
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
            Available Tutors
          </h1>
          <p className="max-w-2xl text-base text-slate">
            Browse active tutors and route new support requests to a specific mentor when
            you want a focused response.
          </p>
        </div>

        {tutors.length === 0 ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            No tutor profiles are active yet. Run the Phase 7 tutor seed SQL after at least
            one auth user exists.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {tutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        )}
      </section>
    );
  } catch (error) {
    const message = getPublicErrorMessage(
      error,
      "Tutor profiles could not be loaded right now."
    );

    return (
      <section className="w-full space-y-6 pb-12">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
          Available Tutors
        </h1>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load tutor profiles.</p>
          <p className="mt-2 text-sm">
            Confirm the Phase 7 migration and seed SQL has been executed in Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}
