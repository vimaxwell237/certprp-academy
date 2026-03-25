import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { RelatedCliPanel } from "@/features/cli/components/related-cli-panel";
import { ContextualCommunityCta } from "@/features/community/components/contextual-community-cta";
import { buildCommunityPostHref } from "@/features/community/lib/community-link";
import { fetchRelatedCliChallengesForLessonContext } from "@/features/cli/data/cli-service";
import { RelatedLabsPanel } from "@/features/labs/components/related-labs-panel";
import { fetchRelatedLabsForLessonContext } from "@/features/labs/data/lab-service";
import { CompletionBadge } from "@/features/learning/components/completion-badge";
import { LessonCompletionForm } from "@/features/learning/components/lesson-completion-form";
import { StructuredLessonContent } from "@/features/learning/components/structured-lesson-content";
import { fetchLessonDetail } from "@/features/learning/data/learning-service";
import { RelatedQuizCard } from "@/features/quizzes/components/related-quiz-card";
import { fetchRelatedQuizForLessonContext } from "@/features/quizzes/data/quiz-service";
import { AskAiTutorCta } from "@/features/ai-tutor/components/ask-ai-tutor-cta";
import { RelatedSubnettingPanel } from "@/features/subnetting/components/related-subnetting-panel";
import { shouldShowSubnettingTrainerForLesson } from "@/features/subnetting/data/subnetting-practice-catalog";
import { ContextualSupportCta } from "@/features/support/components/contextual-support-cta";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LessonDetailPage({
  params
}: {
  params: Promise<{
    courseSlug: string;
    moduleSlug: string;
    lessonSlug: string;
  }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const { courseSlug, moduleSlug, lessonSlug } = await params;
  try {
    const lesson = await fetchLessonDetail(
      user.id,
      courseSlug,
      moduleSlug,
      lessonSlug
    );

    if (!lesson) {
      notFound();
    }

    const [relatedQuiz, relatedLabs, relatedCliChallenges] = await Promise.all([
      fetchRelatedQuizForLessonContext(
        user.id,
        courseSlug,
        moduleSlug,
        lessonSlug
      ),
      fetchRelatedLabsForLessonContext(
        user.id,
        courseSlug,
        moduleSlug,
        lessonSlug
      ),
      fetchRelatedCliChallengesForLessonContext(
        user.id,
        courseSlug,
        moduleSlug,
        lessonSlug
      )
    ]);
    const showSubnettingTrainer = shouldShowSubnettingTrainerForLesson(
      courseSlug,
      moduleSlug,
      lessonSlug
    );
    const communityHref = buildCommunityPostHref({
      lessonId: lesson.id,
      subject: `Help me understand: ${lesson.title}`,
      topic: "lesson_help"
    });

    return (
      <section className="w-full max-w-4xl space-y-6 pb-12 sm:space-y-8">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate sm:text-sm">
            <Link className="transition hover:text-cyan" href={APP_ROUTES.courses}>
              Courses
            </Link>
            <span>/</span>
            <Link
              className="transition hover:text-cyan"
              href={`/courses/${lesson.course.slug}`}
            >
              {lesson.course.title}
            </Link>
            <span>/</span>
            <span className="text-ink">{lesson.module.title}</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {lesson.title}
          </h1>
          <p className="text-sm leading-6 text-slate sm:text-base">{lesson.summary}</p>
          <div className="flex flex-wrap items-center gap-3">
            <p className="rounded-full bg-pearl px-3 py-1 text-sm font-medium text-ink">
              {lesson.estimatedMinutes} min
            </p>
            <p className="rounded-full bg-cyan/10 px-3 py-1 text-sm font-medium text-cyan">
              Lesson {lesson.currentLessonNumber} of {lesson.moduleLessonCount}
            </p>
            <CompletionBadge completed={lesson.completed} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.25fr_0.95fr]">
          <div className="rounded-3xl border border-ink/5 bg-white/90 p-4 shadow-soft sm:p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
              Current Focus
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold text-ink sm:text-2xl">
              {lesson.module.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate">
              You are on lesson {lesson.currentLessonNumber} of {lesson.moduleLessonCount} in
              this module. Use the lesson controls below to keep your progress moving in
              order.
            </p>
          </div>
          <div className="rounded-3xl border border-ink/5 bg-white/90 p-4 shadow-soft sm:p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
              Lesson Actions
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                className="inline-flex w-full justify-center rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/50 hover:text-cyan sm:w-auto"
                href={`/courses/${lesson.course.slug}`}
              >
                View Course Map
              </Link>
              {lesson.videoUrl ? (
                <a
                  className="inline-flex w-full justify-center rounded-full border border-cyan/20 bg-cyan/5 px-4 py-2 text-sm font-semibold text-cyan transition hover:border-cyan/50 sm:w-auto"
                  href={lesson.videoUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open Video Support
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <article className="rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft sm:p-6">
          <StructuredLessonContent content={lesson.content} />
          {lesson.videoUrl ? (
            <div className="mt-6 rounded-2xl border border-cyan/20 bg-cyan/5 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                Video Support
              </p>
              <a
                className="mt-2 inline-flex w-full text-sm font-semibold text-ink underline decoration-cyan/60 underline-offset-4 transition hover:text-cyan sm:w-auto"
                href={lesson.videoUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open Jeremy&apos;s IT Lab video support
              </a>
            </div>
          ) : null}
        </article>

        {relatedQuiz ? <RelatedQuizCard quiz={relatedQuiz} /> : null}
        {relatedLabs.length > 0 ? (
          <RelatedLabsPanel labs={relatedLabs} title="Hands-On Labs" />
        ) : null}
        {relatedCliChallenges.length > 0 ? (
          <RelatedCliPanel
            challenges={relatedCliChallenges}
            title="CLI Practice Challenges"
          />
        ) : null}
        {showSubnettingTrainer ? <RelatedSubnettingPanel /> : null}
        <AskAiTutorCta
          description="Ask the AI tutor to explain this lesson in simpler terms, compare related topics, or walk through a confusing concept step by step."
          lessonContext={`${lesson.module.title}: ${lesson.title}`}
          question={`Help me understand this lesson: ${lesson.title}`}
          source="lesson"
          title="Ask the AI Tutor about this lesson"
        />

        <ContextualSupportCta
          category="lesson_clarification"
          description="If the explanation, terminology, or troubleshooting logic in this lesson is still unclear, open a tutor thread directly from this lesson context."
          lessonId={lesson.id}
          subject={`Need help with lesson: ${lesson.title}`}
          title="Need clarification on this lesson?"
        />

        <ContextualCommunityCta
          description="Start a learner discussion tied to this lesson if you want peer explanations, alternative ways to think about the topic, or study partners working through the same concept."
          href={communityHref}
          title="Want to talk it through with the community?"
        />

        <div className="flex flex-col gap-4 rounded-3xl border border-ink/5 bg-white/90 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {lesson.previousLesson ? (
              <Link
                className="inline-flex w-full justify-center rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/50 hover:text-cyan sm:w-auto"
                href={`/courses/${lesson.previousLesson.courseSlug}/${lesson.previousLesson.moduleSlug}/${lesson.previousLesson.lessonSlug}`}
              >
                Previous: {lesson.previousLesson.title}
              </Link>
            ) : (
              <p className="text-sm font-medium text-slate">This is the first lesson in the course.</p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <LessonCompletionForm
              completed={lesson.completed}
              courseSlug={lesson.course.slug}
              lessonId={lesson.id}
              lessonSlug={lesson.slug}
              moduleSlug={lesson.module.slug}
            />

            {lesson.nextLesson ? (
              <Link
                className="inline-flex w-full justify-center rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/50 hover:text-cyan sm:w-auto"
                href={`/courses/${lesson.nextLesson.courseSlug}/${lesson.nextLesson.moduleSlug}/${lesson.nextLesson.lessonSlug}`}
              >
                Next: {lesson.nextLesson.title}
              </Link>
            ) : (
              <p className="text-sm font-medium text-slate">
                You reached the end of this course path.
              </p>
            )}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    const message = getPublicErrorMessage(
      error,
      "Lesson details could not be loaded right now."
    );

    return (
      <section className="w-full max-w-4xl space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.courses}
        >
          Back to Courses
        </Link>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load this lesson.</p>
          <p className="mt-2 text-sm">
            Confirm Phase 2 migration/seed SQL has been executed and lesson slugs are valid.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}
