import Link from "next/link";

import { Card } from "@/components/ui/card";
import { RelatedCliPanel } from "@/features/cli/components/related-cli-panel";
import { CompletionBadge } from "@/features/learning/components/completion-badge";
import { RelatedLabsPanel } from "@/features/labs/components/related-labs-panel";
import { ProgressIndicator } from "@/features/learning/components/progress-indicator";
import { RelatedQuizCard } from "@/features/quizzes/components/related-quiz-card";
import type { RelatedCliChallengeSummary } from "@/types/cli";
import type { RelatedLabSummary } from "@/types/lab";
import type { ModuleSummary } from "@/types/learning";
import type { RelatedQuizSummary } from "@/types/quiz";

export function ModuleCard({
  courseSlug,
  module,
  relatedQuiz,
  relatedLabs,
  relatedCliChallenges
}: {
  courseSlug: string;
  module: ModuleSummary;
  relatedQuiz?: RelatedQuizSummary | null;
  relatedLabs?: RelatedLabSummary[];
  relatedCliChallenges?: RelatedCliChallengeSummary[];
}) {
  return (
    <Card
      className="space-y-5 border-ink/5 scroll-mt-24 sm:space-y-6"
      id={`module-${module.slug}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
            Module {module.orderIndex}
          </p>
          <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
            {module.title}
          </h2>
          <p className="text-sm leading-6 text-slate sm:text-base">{module.description}</p>
        </div>

        {module.nextLesson ? (
          <Link
            className="inline-flex w-full justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900 sm:w-auto"
            href={`/courses/${courseSlug}/${module.nextLesson.moduleSlug}/${module.nextLesson.lessonSlug}`}
          >
            {module.completedLessons === module.lessonCount ? "Review Module" : "Continue Module"}
          </Link>
        ) : null}
      </div>

      <div className="grid gap-2 text-sm sm:grid-cols-3 sm:gap-3">
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Lessons</p>
          <p className="font-semibold text-ink">{module.lessonCount}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Completed</p>
          <p className="font-semibold text-ink">
            {module.completedLessons} / {module.lessonCount}
          </p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Study Time</p>
          <p className="font-semibold text-ink">{module.estimatedMinutesTotal} min</p>
        </div>
      </div>

      <ProgressIndicator
        completed={module.completedLessons}
        total={module.lessonCount}
        percentage={module.progressPercentage}
      />

      {module.lessons.length > 0 ? (
        <ul className="space-y-3">
          {module.lessons.map((lesson) => (
            <li
              className="flex flex-col gap-3 rounded-2xl border border-ink/5 bg-pearl p-3.5 sm:p-4 md:flex-row md:items-center md:justify-between"
              key={lesson.id}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
                    Lesson {lesson.orderIndex}
                  </p>
                  {module.nextLesson?.lessonSlug === lesson.slug ? (
                    <span className="rounded-full bg-cyan/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan">
                      Next Up
                    </span>
                  ) : null}
                </div>
                <p className="font-semibold text-ink">{lesson.title}</p>
                <p className="text-sm leading-6 text-slate">{lesson.summary}</p>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate">
                  {lesson.estimatedMinutes} min
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <CompletionBadge completed={lesson.completed} />
                <Link
                  className="inline-flex w-full justify-center rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/50 hover:text-cyan sm:w-auto"
                  href={`/courses/${courseSlug}/${module.slug}/${lesson.slug}`}
                >
                  Open Lesson
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No lessons found for this module yet.
        </p>
      )}

      {relatedQuiz ? <RelatedQuizCard quiz={relatedQuiz} /> : null}
      {relatedLabs && relatedLabs.length > 0 ? (
        <RelatedLabsPanel labs={relatedLabs} title="Related Labs" />
      ) : null}
      {relatedCliChallenges && relatedCliChallenges.length > 0 ? (
        <RelatedCliPanel challenges={relatedCliChallenges} title="Related CLI Practice" />
      ) : null}
    </Card>
  );
}
