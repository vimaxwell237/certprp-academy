import { notFound, redirect } from "next/navigation";

import { ExamResultsSummary } from "@/features/exams/components/exam-results-summary";
import { ExamReviewList } from "@/features/exams/components/exam-review-list";
import { fetchExamAttemptResult } from "@/features/exams/data/exam-service";
import { ContextualSupportCta } from "@/features/support/components/contextual-support-cta";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ExamResultsPage({
  params
}: {
  params: Promise<{ examSlug: string; attemptId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const { examSlug, attemptId } = await params;

  try {
    const result = await fetchExamAttemptResult(user.id, examSlug, attemptId);

    if (!result) {
      notFound();
    }

    return (
      <section className="w-full max-w-5xl space-y-8 pb-12">
        <ExamResultsSummary result={result} />
        <ContextualSupportCta
          category="exam_help"
          description="If you want targeted feedback on your weak domains, flagged questions, or timed-exam strategy, create a tutor request from this exam attempt."
          examAttemptId={result.attemptId}
          subject={`Need help reviewing exam: ${result.examTitle}`}
          title="Need tutor feedback on this exam attempt?"
        />
        <ExamReviewList result={result} />
      </section>
    );
  } catch (error) {
    console.error("[ExamResultsPage]", error);

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load exam results.</p>
          <p className="mt-2 text-sm">
            Refresh the page or verify that the exam attempt belongs to the signed-in user.
          </p>
        </div>
      </section>
    );
  }
}
