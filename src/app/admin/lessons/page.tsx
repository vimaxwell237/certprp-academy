import Link from "next/link";

import {
  saveLessonAction,
  toggleLessonPublishAction
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
  fetchAdminLesson,
  fetchAdminLessons,
  fetchAdminModuleOptions
} from "@/features/admin/data/admin-service";
import { APP_ROUTES } from "@/lib/auth/redirects";

export default async function AdminLessonsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const editId =
    typeof resolvedSearchParams.edit === "string" ? resolvedSearchParams.edit : undefined;
  const [lessons, modules, editingRecord] = await Promise.all([
    fetchAdminLessons(),
    fetchAdminModuleOptions(),
    editId ? fetchAdminLesson(editId) : Promise.resolve(null)
  ]);

  const lessonFields: AdminEntityField[] = [
    {
      name: "moduleId",
      label: "Module",
      type: "select",
      options: modules,
      required: true
    },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true },
    { name: "summary", label: "Summary", type: "textarea", rows: 4 },
    { name: "content", label: "Content", type: "textarea", rows: 10 },
    {
      name: "estimatedMinutes",
      label: "Estimated Minutes",
      type: "number",
      min: 1,
      step: 1,
      required: true
    },
    {
      name: "videoUrl",
      label: "Video URL",
      type: "url",
      placeholder: "https://..."
    },
    {
      name: "orderIndex",
      label: "Order Index",
      type: "number",
      min: 1,
      step: 1,
      required: true
    },
    {
      name: "isPublished",
      label: "Publish",
      type: "checkbox",
      description: "Published lessons can be opened by learners through the course flow."
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <AdminSectionHeader
          description="Manage lesson sequencing, summaries, full body content, and video references in one place."
          eyebrow="Learning Structure"
          title="Lessons"
        />
        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
          href={APP_ROUTES.adminLessons}
        >
          Create New
        </Link>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.45fr_0.95fr]">
        <AdminDataTable
          columns={[
            {
              header: "Lesson",
              cell: (record) => (
                <div className="space-y-1">
                  <p className="font-semibold text-ink">{record.title}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate">
                    {record.courseTitle} / {record.moduleTitle} · order {record.orderIndex}
                  </p>
                  <p className="max-w-md text-sm text-slate">{record.summary}</p>
                </div>
              )
            },
            {
              header: "Time",
              cell: (record) => (
                <span className="font-semibold text-ink">{record.estimatedMinutes} min</span>
              ),
              className: "w-24"
            },
            {
              header: "State",
              cell: (record) => (
                <div className="space-y-3">
                  <AdminStatusBadge status={record.isPublished ? "published" : "draft"} />
                  <AdminInlineToggle
                    action={toggleLessonPublishAction}
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
          emptyMessage="No lessons exist yet."
          getKey={(record) => record.id}
          items={lessons}
          title="Lesson Catalog"
        />

        <AdminEntityForm
          action={saveLessonAction}
          fields={lessonFields}
          initialValues={
            editingRecord
              ? editingRecord
              : {
                  moduleId: modules[0]?.value ?? "",
                  title: "",
                  slug: "",
                  summary: "",
                  content: "",
                  estimatedMinutes: 15,
                  videoUrl: "",
                  orderIndex: 1,
                  isPublished: false
                }
          }
          key={editingRecord?.id ?? "new-lesson"}
          recordId={editingRecord?.id}
          submitLabel={editingRecord ? "Update Lesson" : "Create Lesson"}
          title={editingRecord ? "Edit Lesson" : "Create Lesson"}
        />
      </div>
    </div>
  );
}
