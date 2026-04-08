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
import { getCurrentUser } from "@/lib/auth/session";

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

    const hasActiveAttempt = Boolean(exam.activeAttemptId);

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12 sm:space-y-8">
        <div className="space-y-4 rounded-[1.5rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(14,116,144,0.92))] px-4 py-6 text-white shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:px-10">
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

          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{exam.title}</h1>
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

          {hasActiveAttempt ? (
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-sm text-slate-100">
              An exam attempt is already in progress for this mode. Resume it to keep the same
              question set, or start fresh to time out the old attempt and load newly added exam
              questions.
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <form action={startExamAttempt}>
              <input name="examSlug" type="hidden" value={exam.slug} />
              <button
                className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-sand"
                type="submit"
              >
                {hasActiveAttempt ? "Resume Active Exam" : "Start Timed Exam"}
              </button>
            </form>

            {hasActiveAttempt ? (
              <form action={startExamAttempt}>
                <input name="examSlug" type="hidden" value={exam.slug} />
                <input name="forceRestart" type="hidden" value="true" />
                <button
                  className="inline-flex rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
                  type="submit"
                >
                  Start Fresh Exam
                </button>
              </form>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
              What to Expect
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate">
              <li>Questions are randomized from the current CCNA question bank.</li>
              <li>New exam-only drag-and-drop questions are prioritized on fresh attempts.</li>
              <li>Answers and flags save while you move through the exam.</li>
              <li>Starting this mode again resumes the same in-progress attempt unless you start fresh.</li>
              <li>The exam auto-submits when the timer reaches zero.</li>
              <li>Results include score, unanswered items, and domain breakdown.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft sm:p-6">
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
    console.error("[ExamDetailPage]", error);

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
            This exam mode is temporarily unavailable. Please go back and try again.
          </p>
        </div>
      </section>
    );
  }
}
