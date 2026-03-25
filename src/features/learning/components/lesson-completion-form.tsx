import { markLessonComplete } from "@/features/learning/actions/mark-lesson-complete";

export function LessonCompletionForm({
  lessonId,
  courseSlug,
  moduleSlug,
  lessonSlug,
  completed
}: {
  lessonId: string;
  courseSlug: string;
  moduleSlug: string;
  lessonSlug: string;
  completed: boolean;
}) {
  if (completed) {
    return (
      <p className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
        Completed
      </p>
    );
  }

  return (
    <form action={markLessonComplete}>
      <input name="lessonId" type="hidden" value={lessonId} />
      <input name="courseSlug" type="hidden" value={courseSlug} />
      <input name="moduleSlug" type="hidden" value={moduleSlug} />
      <input name="lessonSlug" type="hidden" value={lessonSlug} />
      <button
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
        type="submit"
      >
        Mark as Complete
      </button>
    </form>
  );
}

