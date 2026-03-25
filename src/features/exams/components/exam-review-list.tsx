import { Card } from "@/components/ui/card";
import type { ExamAttemptResult } from "@/types/exam";

export function ExamReviewList({ result }: { result: ExamAttemptResult }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Review
        </p>
        <h2 className="font-display text-3xl font-semibold text-ink">
          Question-by-Question Review
        </h2>
      </div>

      <div className="space-y-4">
        {result.review.map((question, index) => (
          <Card className="space-y-5 border-ink/5" key={question.id}>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                  Question {index + 1}
                </span>
                <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                  {question.difficulty}
                </span>
                {question.moduleTitle ? (
                  <span className="rounded-full bg-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
                    {question.moduleTitle}
                  </span>
                ) : null}
                {question.flagged ? (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">
                    Flagged
                  </span>
                ) : null}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                    question.isCorrect
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-rose-100 text-rose-900"
                  }`}
                >
                  {question.isCorrect ? "Correct" : "Review Needed"}
                </span>
              </div>

              <h3 className="font-display text-2xl font-semibold text-ink">
                {question.questionText}
              </h3>
            </div>

            <div className="space-y-3">
              {question.options.map((option) => {
                const stateClass = option.isCorrect
                  ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                  : option.isSelected
                    ? "border-rose-200 bg-rose-50 text-rose-950"
                    : "border-ink/10 bg-pearl text-ink";

                return (
                  <div className={`rounded-2xl border px-4 py-4 ${stateClass}`} key={option.id}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-base">{option.optionText}</p>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {option.isSelected ? (
                          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
                            Selected
                          </span>
                        ) : null}
                        {option.isCorrect ? (
                          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
                            Correct
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl bg-slate-950 px-4 py-4 text-slate-100">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
                Explanation
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-200">{question.explanation}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
