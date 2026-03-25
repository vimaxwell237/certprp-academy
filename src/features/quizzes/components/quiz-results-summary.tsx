import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { QuizAttemptResult } from "@/types/quiz";

export function QuizResultsSummary({ result }: { result: QuizAttemptResult }) {
  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Results
        </p>
        <h1 className="font-display text-4xl font-semibold text-ink">
          {result.quizTitle}
        </h1>
        <p className="text-base text-slate">{result.description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-sm text-slate">Score</p>
          <p className="text-2xl font-semibold text-ink">{result.score}%</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-sm text-slate">Correct</p>
          <p className="text-2xl font-semibold text-ink">{result.correctAnswers}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-sm text-slate">Incorrect</p>
          <p className="text-2xl font-semibold text-ink">{result.incorrectAnswers}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-sm text-slate">Questions</p>
          <p className="text-2xl font-semibold text-ink">{result.totalQuestions}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
          href={`/quizzes/${result.quizSlug}`}
        >
          Retake Quiz
        </Link>
        <Link
          className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
          href="/quizzes"
        >
          All Quizzes
        </Link>
      </div>
    </Card>
  );
}

