import Link from "next/link";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { fetchBillingAccessState } from "@/features/billing/data/billing-service";
import { generateStudyPlanAction } from "@/features/guidance/actions/guidance-actions";
import { StudyPlanCard } from "@/features/guidance/components/study-plan-card";
import { fetchActiveStudyPlan } from "@/features/guidance/data/guidance-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export default async function StudyPlanPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  try {
    const [accessState, activePlan] = await Promise.all([
      fetchBillingAccessState(user.id),
      fetchActiveStudyPlan(user.id)
    ]);

    if (!accessState.isPaid) {
      return (
        <section className="w-full max-w-5xl space-y-8 pb-12">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
              Guidance
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Study Plan
            </h1>
            <p className="max-w-2xl text-base text-slate">
              Guided study plans are part of Premium and Tutor Plan access.
            </p>
          </div>

          <Card className="border-amber-200 bg-amber-50">
            <h2 className="font-display text-2xl font-semibold text-amber-900">
              Upgrade to unlock structured study plans
            </h2>
            <p className="mt-2 text-base text-amber-900">
              Free users can still generate recommendations, but multi-step remediation plans
              require Premium or Tutor Plan access.
            </p>
            <Link
              className="mt-4 inline-flex rounded-full border border-amber-700 px-5 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
              href={APP_ROUTES.pricing}
            >
              View Plans
            </Link>
          </Card>
        </section>
      );
    }

    return (
      <section className="w-full max-w-6xl space-y-8 pb-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
              Guidance
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Study Plan
            </h1>
            <p className="max-w-3xl text-base text-slate">
              Turn your recommendation set into an ordered remediation plan and track
              completion over time.
            </p>
          </div>

          <form action={generateStudyPlanAction}>
            <button
              className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
              type="submit"
            >
              {activePlan ? "Regenerate Plan" : "Generate Study Plan"}
            </button>
          </form>
        </div>

        {activePlan ? (
          <StudyPlanCard plan={activePlan} />
        ) : (
          <Card className="border-amber-200 bg-amber-50">
            <h2 className="font-display text-2xl font-semibold text-amber-900">
              No active study plan yet
            </h2>
            <p className="mt-2 text-base text-amber-900">
              Build a study plan from your current recommendations to create a sequenced
              remediation path.
            </p>
          </Card>
        )}

        <Card className="space-y-4 border-ink/5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
            Recommendation Flow
          </p>
          <p className="text-base text-slate">
            Update your recommendation set first if you want the plan to reflect your latest
            exam, quiz, lab, CLI, and support activity.
          </p>
          <Link
            className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
            href={APP_ROUTES.recommendations}
          >
            Open Recommendations
          </Link>
        </Card>
      </section>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Study Plan
        </h1>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load the study plan.</p>
          <p className="mt-2 text-sm">
            Confirm the Phase 9 guidance migration has been executed in Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}
