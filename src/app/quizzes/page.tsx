import { redirect } from "next/navigation";

import { LockedFeatureCard } from "@/features/billing/components/locked-feature-card";
import {
  buildLockedFeatureModel,
  fetchBillingAccessState
} from "@/features/billing/data/billing-service";
import { canAccessQuizModule } from "@/features/billing/lib/access-control";
import { QuizCard } from "@/features/quizzes/components/quiz-card";
import { QuizHistoryList } from "@/features/quizzes/components/quiz-history-list";
import {
  fetchQuizAttemptHistory,
  fetchQuizList
} from "@/features/quizzes/data/quiz-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export default async function QuizzesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  try {
    const [quizzes, attemptHistory, accessState] = await Promise.all([
      fetchQuizList(user.id),
      fetchQuizAttemptHistory(user.id, 8),
      fetchBillingAccessState(user.id)
    ]);
    const quizLockContent = buildLockedFeatureModel("full_quiz_access");
    const hasLockedQuizzes = quizzes.some(
      (quiz) => !canAccessQuizModule(accessState, quiz.moduleSlug)
    );

    return (
      <section className="w-full space-y-8 pb-12">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
            Practice Questions
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Quizzes
          </h1>
          <p className="max-w-2xl text-base text-slate">
            Practice module-level quizzes, review explanations, and monitor performance
            over time.
          </p>
        </div>

        {hasLockedQuizzes ? (
          <LockedFeatureCard
            description={quizLockContent.description}
            title={quizLockContent.title}
          />
        ) : null}

        {quizzes.length === 0 ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            No quizzes are available yet. Run the Phase 3 seed script to load starter
            CCNA quizzes.
          </div>
        ) : (
          <div className="grid gap-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                locked={!canAccessQuizModule(accessState, quiz.moduleSlug)}
                quiz={quiz}
              />
            ))}
          </div>
        )}

        <QuizHistoryList attempts={attemptHistory} />
      </section>
    );
  } catch (error) {
    console.error("[QuizzesPage]", error);

    return (
      <section className="w-full space-y-6 pb-12">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Quizzes
        </h1>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load quiz data.</p>
          <p className="mt-2 text-sm">
            Check your quiz setup and refresh the page in a moment.
          </p>
        </div>
      </section>
    );
  }
}
