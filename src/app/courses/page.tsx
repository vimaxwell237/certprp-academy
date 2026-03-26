import { redirect } from "next/navigation";

import { CourseCard } from "@/features/learning/components/course-card";
import { fetchCourses } from "@/features/learning/data/learning-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicPageErrorMessage } from "@/lib/errors/page-error";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CoursesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  try {
    const courses = await fetchCourses(user.id);

    return (
      <section className="w-full space-y-8 pb-12">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
            Learning Paths
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Courses
          </h1>
          <p className="max-w-2xl text-base text-slate">
            Browse active certification courses and continue where you left off.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            No courses are available right now. Published course content may still be
            syncing or unavailable for this account.
          </div>
        ) : (
          <div className="grid gap-6">
            {courses.map((course) => (
              <CourseCard course={course} key={course.id} />
            ))}
          </div>
        )}
      </section>
    );
  } catch (error) {
    const message = getPublicPageErrorMessage(
      error,
      "Course data could not be loaded right now."
    );

    return (
      <section className="w-full space-y-6 pb-12">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Courses
        </h1>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load course data.</p>
          <p className="mt-2 text-sm">
            Course content may be unavailable, still being updated, or temporarily
            inaccessible.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}
