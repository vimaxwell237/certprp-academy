import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LockedFeatureCard } from "@/features/billing/components/locked-feature-card";
import {
  buildLockedFeatureModel,
  canAccessQuizSlug
} from "@/features/billing/data/billing-service";
import { QuizForm } from "@/features/quizzes/components/quiz-form";
import { fetchQuizDetail } from "@/features/quizzes/data/quiz-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export default async function QuizDetailPage({
  params
}: {
  params: Promise<{ quizSlug: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const { quizSlug } = await params;

  if (!(await canAccessQuizSlug(user.id, quizSlug))) {
    const lockedContent = buildLockedFeatureModel("full_quiz_access");

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.quizzes}
        >
          Back to Quizzes
        </Link>
        <LockedFeatureCard
          description={lockedContent.description}
          title={lockedContent.title}
        />
      </section>
    );
  }

  try {
    const quiz = await fetchQuizDetail(user.id, quizSlug);

    if (!quiz) {
      notFound();
    }

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12 sm:space-y-8">
        <div className="space-y-4 rounded-[1.5rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,145,178,0.9))] px-4 py-6 text-white shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:px-10">
          <Link
            className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:text-white"
            href={APP_ROUTES.quizzes}
          >
            Back to Quizzes
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">
            {quiz.moduleTitle ?? quiz.courseTitle}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{quiz.title}</h1>
          <p className="max-w-3xl text-slate-100">{quiz.description}</p>

          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-slate-200">Questions</p>
              <p className="font-semibold text-white">{quiz.questionCount}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-slate-200">Attempts</p>
              <p className="font-semibold text-white">{quiz.attemptsTaken}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-slate-200">Latest</p>
              <p className="font-semibold text-white">
                {quiz.latestScore !== null ? `${quiz.latestScore}%` : "Not taken"}
              </p>
            </div>
          </div>

          <a
            className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-sand"
            href="#quiz-questions"
          >
            Start Quiz
          </a>
        </div>

        {quiz.questions.length === 0 ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            This quiz is published but does not have questions yet.
          </div>
        ) : (
          <div className="space-y-6" id="quiz-questions">
            <QuizForm quiz={quiz} />
          </div>
        )}
      </section>
    );
  } catch (error) {
    console.error("[QuizDetailPage]", error);

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.quizzes}
        >
          Back to Quizzes
        </Link>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load this quiz.</p>
          <p className="mt-2 text-sm">
            This quiz is temporarily unavailable. Please go back and try again.
          </p>
        </div>
      </section>
    );
  }
}
