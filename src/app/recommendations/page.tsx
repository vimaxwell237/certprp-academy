import Link from "next/link";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { generateRecommendationsAction, generateStudyPlanAction } from "@/features/guidance/actions/guidance-actions";
import { RecommendationCard } from "@/features/guidance/components/recommendation-card";
import { fetchRecommendationsPageData } from "@/features/guidance/data/guidance-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export default async function RecommendationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  try {
    const data = await fetchRecommendationsPageData(user.id);

    return (
      <section className="w-full max-w-6xl space-y-8 pb-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
              Guidance
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
              Recommendations
            </h1>
            <p className="max-w-3xl text-base text-slate">
              Generate targeted next steps from your lesson, quiz, exam, lab, CLI, and
              support history.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <form action={generateRecommendationsAction}>
              <button
                className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                type="submit"
              >
                {data.recommendations.length > 0 ? "Refresh Recommendations" : "Generate Recommendations"}
              </button>
            </form>
            <form action={generateStudyPlanAction}>
              <button
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
                type="submit"
              >
                Build Study Plan
              </button>
            </form>
          </div>
        </div>

        {data.generatedAt ? (
          <Card className="border-ink/5">
            <p className="text-sm text-slate">
              Last generated: {new Date(data.generatedAt).toLocaleString()}
            </p>
          </Card>
        ) : null}

        {data.recommendations.length === 0 ? (
          <Card className="border-amber-200 bg-amber-50">
            <h2 className="font-display text-2xl font-semibold text-amber-900">
              {data.hasActivity ? "No active recommendations right now" : "No activity yet"}
            </h2>
            <p className="mt-2 text-base text-amber-900">
              {data.hasActivity
                ? "Generate recommendations to rebuild a focused guidance set from your latest activity."
                : "Start a lesson, quiz, lab, CLI challenge, or exam attempt first, then generate recommendations."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-5">
            {data.recommendations.map((recommendation) => (
              <RecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
          </div>
        )}

        <Card className="space-y-4 border-ink/5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
            Next Step
          </p>
          <p className="text-base text-slate">
            Need a structured sequence instead of a loose recommendation list? Build a study
            plan and track completion one action at a time.
          </p>
          <Link
            className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
            href={APP_ROUTES.studyPlan}
          >
            Open Study Plan
          </Link>
        </Card>
      </section>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
          Recommendations
        </h1>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load recommendation data.</p>
          <p className="mt-2 text-sm">
            Confirm the Phase 9 guidance migration has been executed in Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}
