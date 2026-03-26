import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LockedFeatureCard } from "@/features/billing/components/locked-feature-card";
import {
  buildLockedFeatureModel,
  canAccessExamSimulator
} from "@/features/billing/data/billing-service";
import { ExamAttemptClient } from "@/features/exams/components/exam-attempt-client";
import {
  fetchExamAttemptState,
  submitExamAttemptForUser
} from "@/features/exams/data/exam-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicPageErrorMessage } from "@/lib/errors/page-error";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ExamAttemptPage({
  params
}: {
  params: Promise<{ examSlug: string; attemptId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const { examSlug, attemptId } = await params;

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
    const attempt = await fetchExamAttemptState(user.id, examSlug, attemptId);

    if (!attempt) {
      notFound();
    }

    if (attempt.status !== "in_progress") {
      redirect(`/exam-simulator/${examSlug}/results/${attemptId}`);
    }

    if (attempt.remainingSeconds <= 0) {
      const submission = await submitExamAttemptForUser(
        user.id,
        examSlug,
        attemptId,
        "timeout"
      );

      redirect(submission.redirectPath);
    }

    return (
      <section className="w-full max-w-7xl space-y-6 pb-12">
        <div className="space-y-2">
          <Link
            className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
            href={`/exam-simulator/${examSlug}`}
          >
            Back to Exam Mode
          </Link>
          <p className="text-sm text-slate">
            Stay focused. This session is timed and will submit automatically when the
            countdown reaches zero.
          </p>
        </div>

        <ExamAttemptClient attempt={attempt} />
      </section>
    );
  } catch (error) {
    const message = getPublicPageErrorMessage(
      error,
      "Exam attempt data could not be loaded right now."
    );

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load this exam attempt.</p>
          <p className="mt-2 text-sm">
            Refresh the page or verify that the attempt belongs to the signed-in user.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}
