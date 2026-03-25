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
          description="Manage basic quiz metadata and keep quizzes in draft until their linked content is published."
          eyebrow="Assessment"
          title="Quizzes"
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
                <span className="font-semibold text-ink">{record.questionCount}</span>
              ),
              className: "w-24"
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
              header: "Edit",
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
          submitLabel={editingRecord ? "Update Quiz" : "Create Quiz"}
          title={editingRecord ? "Edit Quiz" : "Create Quiz"}
        />
      </div>
    </div>
  );
}
