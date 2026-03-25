import { updateLabProgress } from "@/features/labs/actions/update-lab-progress";
import { Button } from "@/components/ui/button";
import type { LabStatus } from "@/types/lab";

export function LabProgressForm({
  labId,
  labSlug,
  status,
  returnPath,
  courseSlug,
  moduleSlug,
  lessonSlug
}: {
  labId: string;
  labSlug: string;
  status: LabStatus;
  returnPath: string;
  courseSlug?: string;
  moduleSlug?: string;
  lessonSlug?: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {status !== "in_progress" ? (
        <form action={updateLabProgress}>
          <input name="labId" type="hidden" value={labId} />
          <input name="labSlug" type="hidden" value={labSlug} />
          <input name="status" type="hidden" value="in_progress" />
          <input name="returnPath" type="hidden" value={returnPath} />
          {courseSlug ? <input name="courseSlug" type="hidden" value={courseSlug} /> : null}
          {moduleSlug ? <input name="moduleSlug" type="hidden" value={moduleSlug} /> : null}
          {lessonSlug ? <input name="lessonSlug" type="hidden" value={lessonSlug} /> : null}
          <Button type="submit" variant="secondary">
            {status === "completed" ? "Reopen Lab" : "Mark In Progress"}
          </Button>
        </form>
      ) : null}

      {status !== "completed" ? (
        <form action={updateLabProgress}>
          <input name="labId" type="hidden" value={labId} />
          <input name="labSlug" type="hidden" value={labSlug} />
          <input name="status" type="hidden" value="completed" />
          <input name="returnPath" type="hidden" value={returnPath} />
          {courseSlug ? <input name="courseSlug" type="hidden" value={courseSlug} /> : null}
          {moduleSlug ? <input name="moduleSlug" type="hidden" value={moduleSlug} /> : null}
          {lessonSlug ? <input name="lessonSlug" type="hidden" value={lessonSlug} /> : null}
          <Button type="submit">Mark Completed</Button>
        </form>
      ) : null}
    </div>
  );
}
