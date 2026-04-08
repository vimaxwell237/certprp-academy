import Link from "next/link";

import {
  saveQuizAction,
  toggleQuizPublishAction
} from "@/features/admin/actions/admin-actions";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";
import {
  AdminEntityForm,
  type AdminEntityField
} from "@/features/admin/components/admin-entity-form";
import { AdminInlineToggle } from "@/features/admin/components/admin-inline-toggle";
import { AdminSectionHeader } from "@/features/admin/components/admin-section-header";
import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import {
  fetchAdminLessonOptions,
  fetchAdminModuleOptions,
  fetchAdminQuiz,
  fetchAdminQuizzes
} from "@/features/admin/data/admin-service";
import { APP_ROUTES } from "@/lib/auth/redirects";

export default async function AdminQuizzesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const editId =
    typeof resolvedSearchParams.edit === "string" ? resolvedSearchParams.edit : undefined;
  const [quizzes, modules, lessons, editingRecord] = await Promise.all([
    fetchAdminQuizzes(),
    fetchAdminModuleOptions(),
    fetchAdminLessonOptions(),
    editId ? fetchAdminQuiz(editId) : Promise.resolve(null)
  ]);

  const quizFields: AdminEntityField[] = [
    {
      name: "moduleId",
      label: "Linked Module",
      type: "select",
      options: modules,
      description: "Choose a module for a module-level quiz."
    },
    {
      name: "lessonId",
      label: "Linked Lesson",
      type: "select",
      options: lessons,
      description: "Choose a lesson instead of a module for lesson-level quizzes."
    },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", rows: 5 },
    {
      name: "isPublished",
      label: "Publish",
      type: "checkbox",
      description: "Only published quizzes should be visible to learners."
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <AdminSectionHeader
          description="Manage quiz shells and publish state here. Timed exam simulator questions are added from Exam Simulator Admin, where you can keep them exam-only instead of sending them to learner quizzes."
          eyebrow="Assessment"
          title="Quiz Shells"
        />
        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
          href={APP_ROUTES.adminQuizzes}
        >
          Create New
        </Link>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.45fr_0.95fr]">
        <AdminDataTable
          columns={[
            {
              header: "Quiz",
              cell: (record) => (
                <div className="space-y-1">
                  <p className="font-semibold text-ink">{record.title}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate">{record.slug}</p>
                  <p className="max-w-md text-sm text-slate">{record.contextLabel}</p>
                </div>
              )
            },
            {
              header: "Questions",
              cell: (record) => (
                <div className="space-y-1">
                  <p className="font-semibold text-ink">{record.questionCount}</p>
                  <p className="text-xs text-slate">
                    {record.quizVisibleQuestionCount} visible in quizzes
                  </p>
                </div>
              ),
              className: "w-32"
            },
            {
              header: "State",
              cell: (record) => (
                <div className="space-y-3">
                  <AdminStatusBadge status={record.isPublished ? "published" : "draft"} />
                  <AdminInlineToggle
                    action={toggleQuizPublishAction}
                    label={record.isPublished ? "Move to Draft" : "Publish"}
                    nextValue={!record.isPublished}
                    recordId={record.id}
                  />
                </div>
              ),
              className: "w-44"
            },
            {
              header: "Exam Bank",
              cell: (record) => (
                <Link
                  className="font-semibold text-cyan hover:text-teal"
                  href={`${APP_ROUTES.adminExamSimulator}?quiz=${record.id}`}
                >
                  Open Bank
                </Link>
              ),
              className: "w-28"
            },
            {
              header: "Edit Shell",
              cell: (record) => (
                <Link className="font-semibold text-cyan hover:text-teal" href={`?edit=${record.id}`}>
                  Edit
                </Link>
              ),
              className: "w-20"
            }
          ]}
          emptyMessage="No quizzes exist yet."
          getKey={(record) => record.id}
          items={quizzes}
          title="Quiz Catalog"
        />

        <div className="space-y-6">
          <div className="rounded-3xl border border-dashed border-ink/10 bg-pearl px-5 py-4 text-sm text-slate">
            Create or update the quiz shell here, then use
            {" "}
            <Link className="font-semibold text-cyan hover:text-teal" href={APP_ROUTES.adminExamSimulator}>
              Exam Simulator Admin
            </Link>
            {" "}
            to add timed exam-bank questions.
          </div>

          <AdminEntityForm
            action={saveQuizAction}
            fields={quizFields}
            initialValues={
              editingRecord
                ? editingRecord
                : {
                    moduleId: "",
                    lessonId: "",
                    title: "",
                    slug: "",
                    description: "",
                    isPublished: false
                  }
            }
            key={editingRecord?.id ?? "new-quiz"}
            recordId={editingRecord?.id}
            submitLabel={editingRecord ? "Update Quiz Shell" : "Create Quiz Shell"}
            title={editingRecord ? "Edit Quiz Shell" : "Create Quiz Shell"}
          />
        </div>
      </div>
    </div>
  );
}
