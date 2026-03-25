import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { fetchModuleCliChallengeIndex } from "@/features/cli/data/cli-service";
import { fetchModuleLabIndex } from "@/features/labs/data/lab-service";
import { ModuleCard } from "@/features/learning/components/module-card";
import { ProgressIndicator } from "@/features/learning/components/progress-indicator";
import { fetchCourseDetail } from "@/features/learning/data/learning-service";
import { fetchModuleQuizIndex } from "@/features/quizzes/data/quiz-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const { courseSlug } = await params;
  try {
    const course = await fetchCourseDetail(user.id, courseSlug);

    if (!course) {
      notFound();
    }

    const [moduleQuizIndex, moduleLabIndex, moduleCliIndex] = await Promise.all([
      fetchModuleQuizIndex(
        user.id,
        course.modules.map((module) => module.id)
      ),
      fetchModuleLabIndex(
        user.id,
        course.modules.map((module) => module.id)
      ),
      fetchModuleCliChallengeIndex(
        user.id,
        course.modules.map((module) => module.id)
      )
    ]);

    return (
      <section className="w-full space-y-6 pb-12 sm:space-y-8">
        <div className="space-y-4 rounded-3xl border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,145,178,0.9))] px-5 py-6 text-white shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:px-10">
          <Link
            className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:text-white"
            href={APP_ROUTES.courses}
          >
            Back to Courses
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">
            {course.certificationName}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {course.title}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-100 sm:text-base">
            {course.description}
          </p>
          <div className="grid gap-2 text-sm sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-slate-200">Level</p>
              <p className="font-semibold text-white">{course.level}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-slate-200">Modules</p>
              <p className="font-semibold text-white">{course.moduleCount}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-slate-200">Lessons</p>
              <p className="font-semibold text-white">{course.lessonCount}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-slate-200">Study Time</p>
              <p className="font-semibold text-white">{course.estimatedMinutesTotal} min</p>
            </div>
          </div>
          <ProgressIndicator
            completed={course.completedLessons}
            percentage={course.progressPercentage}
            total={course.lessonCount}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {course.continueLesson ? (
              <Link
                className="inline-flex w-full justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-slate-100 sm:w-auto"
                href={`/courses/${course.slug}/${course.continueLesson.moduleSlug}/${course.continueLesson.lessonSlug}`}
              >
                {course.progressPercentage === 100 ? "Review from Start" : "Continue Learning"}
              </Link>
            ) : null}
            <Link
              className="inline-flex w-full justify-center rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
              href={APP_ROUTES.dashboard}
            >
              Return to Dashboard
            </Link>
          </div>
        </div>

        {course.modules.length > 0 ? (
          <div className="rounded-3xl border border-ink/5 bg-white/90 p-4 shadow-soft sm:p-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Module Map
              </p>
              <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
                Jump Through {course.moduleCount} Modules
              </h2>
              <p className="text-sm leading-6 text-slate">
                Use the quick links below to move through the CCNA path in order and
                jump back to any module you want to review.
              </p>
            </div>
            <div className="-mx-1 mt-4 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              {course.modules.map((module) => (
                <Link
                  className="inline-flex shrink-0 rounded-full border border-ink/10 bg-pearl px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/50 hover:text-cyan"
                  href={`#module-${module.slug}`}
                  key={module.id}
                >
                  {module.orderIndex}. {module.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {course.modules.length === 0 ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            No lessons found for this course yet.
          </div>
        ) : (
          <div className="grid gap-5 sm:gap-6">
            {course.modules.map((module) => (
              <ModuleCard
                courseSlug={course.slug}
                key={module.id}
                module={module}
                relatedCliChallenges={moduleCliIndex[module.id] ?? []}
                relatedLabs={moduleLabIndex[module.id] ?? []}
                relatedQuiz={moduleQuizIndex[module.id] ?? null}
              />
            ))}
          </div>
        )}
      </section>
    );
  } catch (error) {
    const message = getPublicErrorMessage(
      error,
      "Course details could not be loaded right now."
    );

    return (
      <section className="w-full space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.courses}
        >
          Back to Courses
        </Link>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load this course.</p>
          <p className="mt-2 text-sm">
            Confirm Phase 2 migration/seed SQL has been executed in Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}
