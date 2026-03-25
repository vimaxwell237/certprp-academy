import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LockedFeatureCard } from "@/features/billing/components/locked-feature-card";
import {
  buildLockedFeatureModel,
  canAccessExamSimulator
} from "@/features/billing/data/billing-service";
import { startExamAttempt } from "@/features/exams/actions/exam-attempt-actions";
import { ExamHistoryList } from "@/features/exams/components/exam-history-list";
import { fetchExamConfigDetail } from "@/features/exams/data/exam-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { getCurrentUser } from "@/lib/auth/session";

function isNavigationNotFoundError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const digest =
    "digest" in error && typeof error.digest === "string" ? error.digest : error.message;

  return digest.includes("NEXT_HTTP_ERROR_FALLBACK");
}

const examModeLabels = {
  full_mock: "Full Mock Exam",
  quick_practice: "Quick Practice Exam",
  random_mixed: "Random Mixed Exam"
} as const;

export default async function ExamDetailPage({
  params
}: {
  params: Promise<{ examSlug: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const { examSlug } = await params;

  if (!(await canAccessExamSimulator(user.id))) {
    const lockedContent = buildLockedFeatureModel("exam_simulator_access");

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.examSimulator}
        >
          Back to Exam Simulator
        </Link>
        <LockedFeatureCard
          description={lockedContent.description}
          title={lockedContent.title}
        />
      </section>
    );
  }

  try {
    const exam = await fetchExamConfigDetail(user.id, examSlug);

    if (!exam) {
      notFound();
    }

    return (
      <section className="w-full max-w-5xl space-y-8 pb-12">
        <div className="space-y-4 rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(14,116,144,0.92))] px-6 py-8 text-white shadow-soft lg:px-10">
          <Link
            className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:text-white"
            href={APP_ROUTES.examSimulator}
          >
            Back to Exam Simulator
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {examModeLabels[exam.examMode]}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {exam.timeLimitMinutes} minutes
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight">{exam.title}</h1>
          <p className="max-w-3xl text-base text-slate-100">{exam.description}</p>

          <div className="grid gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-slate-200">Questions</p>
              <p className="font-semibold text-white">{exam.questionCount}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-slate-200">Passing Score</p>
              <p className="font-semibold text-white">{exam.passingScore}%</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-slate-200">Attempts</p>
              <p className="font-semibold text-white">{exam.attemptsTaken}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-slate-200">Best Score</p>
              <p className="font-semibold text-white">
                {exam.bestScore !== null ? `${exam.bestScore}%` : "N/A"}
              </p>
            </div>
          </div>

          <form action={startExamAttempt}>
            <input name="examSlug" type="hidden" value={exam.slug} />
            <button
              className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-sand"
              type="submit"
            >
              Start Timed Exam
            </button>
          </form>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
              What to Expect
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate">
              <li>Questions are randomized from the current CCNA question bank.</li>
              <li>Answers and flags save while you move through the exam.</li>
              <li>Refreshing the page restores the same active attempt state.</li>
              <li>The exam auto-submits when the timer reaches zero.</li>
              <li>Results include score, unanswered items, and domain breakdown.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
              Attempt Snapshot
            </p>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Latest Score</p>
                <p className="font-semibold text-ink">
                  {exam.latestScore !== null ? `${exam.latestScore}%` : "Not taken"}
                </p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Recent Activity</p>
                <p className="font-semibold text-ink">
                  {exam.lastAttemptAt
                    ? new Date(exam.lastAttemptAt).toLocaleString()
                    : "No attempts yet"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <ExamHistoryList attempts={exam.recentAttempts} title="Recent Attempts for This Mode" />
      </section>
    );
  } catch (error) {
    if (isNavigationNotFoundError(error)) {
      throw error;
    }

    const message = getPublicErrorMessage(
      error,
      "Exam mode data could not be loaded right now."
    );

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.examSimulator}
        >
          Back to Exam Simulator
        </Link>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load this exam mode.</p>
          <p className="mt-2 text-sm">
            Confirm the Phase 4 exam migration and seed SQL has been executed in Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}
