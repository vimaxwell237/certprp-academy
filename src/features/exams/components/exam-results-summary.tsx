import Link from "next/link";

import { Card } from "@/components/ui/card";
import { formatSecondsLabel } from "@/features/exams/lib/exam-engine";
import type { ExamAttemptResult } from "@/types/exam";

function statusLabel(status: ExamAttemptResult["status"]) {
  return status === "timed_out" ? "Timed Out" : "Submitted";
}

export function ExamResultsSummary({ result }: { result: ExamAttemptResult }) {
  return (
    <Card className="space-y-6 border-ink/5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
            Exam Result
          </span>
          <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            {statusLabel(result.status)}
          </span>
        </div>

        <h1 className="font-display text-4xl font-semibold text-ink">{result.examTitle}</h1>
        <p className="max-w-3xl text-base text-slate">{result.description}</p>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Score</p>
          <p className="font-semibold text-ink">
            {result.score !== null ? `${result.score}%` : "N/A"}
          </p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Correct</p>
          <p className="font-semibold text-ink">{result.correctAnswers}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Incorrect</p>
          <p className="font-semibold text-ink">{result.incorrectAnswers}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Unanswered</p>
          <p className="font-semibold text-ink">{result.unansweredCount}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Flagged</p>
          <p className="font-semibold text-ink">{result.flaggedCount}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Time Used</p>
          <p className="font-semibold text-ink">{formatSecondsLabel(result.timeUsedSeconds)}</p>
        </div>
      </div>

      {result.domainBreakdown.length > 0 ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
              Domain Breakdown
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Performance by Module
            </h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {result.domainBreakdown.map((domain) => (
              <div className="rounded-2xl border border-ink/5 bg-pearl px-4 py-4" key={domain.moduleSlug}>
                <p className="font-semibold text-ink">{domain.moduleTitle}</p>
                <p className="mt-1 text-sm text-slate">
                  {domain.correctAnswers} / {domain.totalQuestions} correct
                </p>
                <p className="mt-3 text-lg font-semibold text-cyan">{domain.score}%</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Link
          className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
          href="/exam-simulator"
        >
          Back to Exam Modes
        </Link>
        <Link
          className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
          href={`/exam-simulator/${result.examSlug}`}
        >
          Retake This Exam
        </Link>
      </div>
    </Card>
  );
}
