import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { QuizListItem } from "@/types/quiz";

export function QuizCard({
  quiz,
  locked = false
}: {
  quiz: QuizListItem;
  locked?: boolean;
}) {
  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          {quiz.moduleTitle ?? quiz.courseTitle}
        </p>
        <h2 className="font-display text-2xl font-semibold text-ink">{quiz.title}</h2>
        <p className="text-base text-slate">{quiz.description}</p>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Questions</p>
          <p className="font-semibold text-ink">{quiz.questionCount}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Attempts</p>
          <p className="font-semibold text-ink">{quiz.attemptsTaken}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Latest</p>
          <p className="font-semibold text-ink">
            {quiz.latestScore !== null ? `${quiz.latestScore}%` : "Not taken"}
          </p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Average</p>
          <p className="font-semibold text-ink">
            {quiz.averageScore !== null ? `${quiz.averageScore}%` : "N/A"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {locked ? (
          <Link
            className="inline-flex rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-amber-400"
            href="/pricing"
          >
            Upgrade to Unlock
          </Link>
        ) : (
          <Link
            className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
            href={`/quizzes/${quiz.slug}`}
          >
            {quiz.attemptsTaken > 0 ? "Retake Quiz" : "Start Quiz"}
          </Link>
        )}
        {quiz.moduleSlug ? (
          <Link
            className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
            href={`/courses/${quiz.courseSlug}`}
          >
            Open Module
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
