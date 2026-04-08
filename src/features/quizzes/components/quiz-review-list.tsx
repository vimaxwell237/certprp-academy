import { Card } from "@/components/ui/card";
import { QuestionImageGallery } from "@/components/ui/question-image-gallery";
import type { QuizAttemptResult } from "@/types/quiz";

export function QuizReviewList({ result }: { result: QuizAttemptResult }) {
  return (
    <div className="space-y-5">
      {result.review.map((question, index) => (
        <Card className="space-y-5 border-ink/5" key={question.id}>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Question {index + 1}
              </p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                  question.isCorrect
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {question.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              {question.questionText}
            </h2>
          </div>

          <QuestionImageGallery
            images={[
              {
                src: question.questionImageUrl,
                alt: question.questionImageAlt || "Question reference image 1",
                key: `${question.id}-primary`
              },
              {
                src: question.questionImageSecondaryUrl,
                alt: question.questionImageSecondaryAlt || "Question reference image 2",
                key: `${question.id}-secondary`
              }
            ]}
          />

          <div className="space-y-3">
            {question.options.map((option) => {
              const stateClass = option.isCorrect
                ? "border-emerald-300 bg-emerald-50"
                : option.isSelected
                  ? "border-rose-300 bg-rose-50"
                  : "border-ink/10 bg-pearl";

              return (
                <div
                  className={`rounded-2xl border px-4 py-3 ${stateClass}`}
                  key={option.id}
                >
                  <p className="text-base text-ink">{option.optionText}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl bg-pearl px-4 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
              Explanation
            </p>
            <p className="mt-2 text-base text-ink">{question.explanation}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
