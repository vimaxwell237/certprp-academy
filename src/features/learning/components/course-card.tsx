import Link from "next/link";

import { Card } from "@/components/ui/card";
import { ProgressIndicator } from "@/features/learning/components/progress-indicator";
import type { CourseSummary } from "@/types/learning";

export function CourseCard({ course }: { course: CourseSummary }) {
  return (
    <Card className="border-ink/5">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
            {course.certificationName}
          </p>
          <h2 className="font-display text-2xl font-semibold text-ink">
            {course.title}
          </h2>
          <p className="text-base text-slate">{course.description}</p>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-2xl bg-pearl px-4 py-3">
            <p className="text-slate">Level</p>
            <p className="font-semibold text-ink">{course.level}</p>
          </div>
          <div className="rounded-2xl bg-pearl px-4 py-3">
            <p className="text-slate">Modules</p>
            <p className="font-semibold text-ink">{course.moduleCount}</p>
          </div>
          <div className="rounded-2xl bg-pearl px-4 py-3">
            <p className="text-slate">Lessons</p>
            <p className="font-semibold text-ink">{course.lessonCount}</p>
          </div>
        </div>

        <ProgressIndicator
          completed={course.completedLessons}
          total={course.lessonCount}
          percentage={course.progressPercentage}
        />

        <Link
          className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
          href={`/courses/${course.slug}`}
        >
          Continue Course
        </Link>
      </div>
    </Card>
  );
}

