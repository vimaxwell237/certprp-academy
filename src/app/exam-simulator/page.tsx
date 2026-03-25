import { redirect } from "next/navigation";

import { LockedFeatureCard } from "@/features/billing/components/locked-feature-card";
import {
  buildLockedFeatureModel,
  fetchBillingAccessState
} from "@/features/billing/data/billing-service";
import { hasBillingFeature } from "@/features/billing/lib/access-control";
import { ExamHistoryList } from "@/features/exams/components/exam-history-list";
import { ExamModeCard } from "@/features/exams/components/exam-mode-card";
import {
  fetchExamAttemptHistory,
  fetchExamConfigs
} from "@/features/exams/data/exam-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ExamSimulatorPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  try {
    const [configs, history, accessState] = await Promise.all([
      fetchExamConfigs(user.id),
      fetchExamAttemptHistory(user.id, 6),
      fetchBillingAccessState(user.id)
    ]);
    const isUnlocked = hasBillingFeature(accessState, "exam_simulator_access");
    const lockedContent = buildLockedFeatureModel("exam_simulator_access");

    return (
      <section className="w-full max-w-6xl space-y-8 pb-12">
        <div className="space-y-4 rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(14,116,144,0.92))] px-6 py-8 text-white shadow-soft lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">
            Exam Simulator
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Timed CCNA Exam Modes
          </h1>
          <p className="max-w-3xl text-base text-slate-100">
            Run serious practice sessions with randomized questions, persisted attempt
            state, flag-for-review flow, and full result breakdowns.
          </p>
        </div>

        {!isUnlocked ? (
          <LockedFeatureCard
            description={lockedContent.description}
            title={lockedContent.title}
          />
        ) : null}

        {configs.length === 0 ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            No published exam modes are available yet. Run the Phase 4 seed SQL in Supabase.
          </div>
        ) : (
          <div className="grid gap-5">
            {configs.map((config) => (
              <ExamModeCard exam={config} key={config.id} locked={!isUnlocked} />
            ))}
          </div>
        )}

        <ExamHistoryList attempts={history} />
      </section>
    );
  } catch (error) {
    const message = getPublicErrorMessage(
      error,
      "Exam simulator data could not be loaded right now."
    );

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load the exam simulator.</p>
          <p className="mt-2 text-sm">
            Confirm the Phase 4 exam migration and seed SQL has been executed in Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}
