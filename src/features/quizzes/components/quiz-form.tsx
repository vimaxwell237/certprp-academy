import { QuestionImageGallery } from "@/components/ui/question-image-gallery";
import { submitQuizAttempt } from "@/features/quizzes/actions/submit-quiz-attempt";
import { QuizProgressBar } from "@/features/quizzes/components/quiz-progress-bar";
import { QuizSubmitButton } from "@/features/quizzes/components/quiz-submit-button";
import type { QuizDetail } from "@/types/quiz";

export function QuizForm({ quiz }: { quiz: QuizDetail }) {
  return (
    <form action={submitQuizAttempt} className="space-y-8">
      <input name="quizSlug" type="hidden" value={quiz.slug} />

      {quiz.questions.map((question, index) => (
        <section
          className="space-y-5 rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft"
          id={`question-${question.orderIndex}`}
          key={question.id}
        >
          <QuizProgressBar current={index + 1} total={quiz.questions.length} />

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-2xl font-semibold text-ink">
                {question.questionText}
              </p>
              <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                {question.difficulty}
              </span>
            </div>
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
            {question.options.map((option) => (
              <label
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/10 bg-pearl px-4 py-4 transition hover:border-cyan/40 hover:bg-white"
                key={option.id}
              >
                <input
                  className="mt-1 h-4 w-4 accent-cyan"
                  name={`question:${question.id}`}
                  required
                  type="radio"
                  value={option.id}
                />
                <span className="text-base text-ink">{option.optionText}</span>
              </label>
            ))}
          </div>
        </section>
      ))}

      <div className="flex items-center justify-end">
        <QuizSubmitButton />
      </div>
    </form>
  );
}
