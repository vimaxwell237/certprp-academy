import { notFound, redirect } from "next/navigation";

import { QuizResultsSummary } from "@/features/quizzes/components/quiz-results-summary";
import { QuizReviewList } from "@/features/quizzes/components/quiz-review-list";
import { fetchQuizAttemptResult } from "@/features/quizzes/data/quiz-service";
import { ContextualSupportCta } from "@/features/support/components/contextual-support-cta";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export default async function QuizResultsPage({
  params
}: {
  params: Promise<{ quizSlug: string; attemptId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const { quizSlug, attemptId } = await params;

  try {
    const result = await fetchQuizAttemptResult(user.id, quizSlug, attemptId);

    if (!result) {
      notFound();
    }

    return (
      <section className="w-full max-w-5xl space-y-8 pb-12">
        <QuizResultsSummary result={result} />
        <ContextualSupportCta
          category="quiz_help"
          description="Open a tutor thread from this quiz attempt if you want help understanding missed questions, distractors, or the explanation review."
          quizAttemptId={result.attemptId}
          subject={`Need help reviewing quiz: ${result.quizTitle}`}
          title="Want tutor help with this quiz review?"
        />
        <QuizReviewList result={result} />
      </section>
    );
  } catch (error) {
    console.error("[QuizResultsPage]", error);

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load quiz results.</p>
          <p className="mt-2 text-sm">
            Refresh the page or verify that the quiz attempt belongs to the signed-in user.
          </p>
        </div>
      </section>
    );
  }
}
