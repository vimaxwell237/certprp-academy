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
        <div className="space-y-4 rounded-[1.5rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(14,116,144,0.92))] px-4 py-6 text-white shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">
            Exam Simulator
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
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
    console.error("[ExamSimulatorPage]", error);

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load the exam simulator.</p>
          <p className="mt-2 text-sm">
            Check your exam simulator setup and refresh the page in a moment.
          </p>
        </div>
      </section>
    );
  }
}
