import Link from "next/link";

import {
  saveModuleAction,
  toggleModulePublishAction
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
  fetchAdminCourseOptions,
  fetchAdminModule,
  fetchAdminModules
} from "@/features/admin/data/admin-service";
import { APP_ROUTES } from "@/lib/auth/redirects";

export default async function AdminModulesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const editId =
    typeof resolvedSearchParams.edit === "string" ? resolvedSearchParams.edit : undefined;
  const [modules, courses, editingRecord] = await Promise.all([
    fetchAdminModules(),
    fetchAdminCourseOptions(),
    editId ? fetchAdminModule(editId) : Promise.resolve(null)
  ]);

  const moduleFields: AdminEntityField[] = [
    {
      name: "courseId",
      label: "Course",
      type: "select",
      options: courses,
      required: true
    },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", rows: 5 },
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
      description: "Modules should remain draft until their learner flow is ready."
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <AdminSectionHeader
          description="Arrange course structure, module sequencing, and staged visibility for learner navigation."
          eyebrow="Learning Structure"
          title="Modules"
        />
        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
          href={APP_ROUTES.adminModules}
        >
          Create New
        </Link>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.45fr_0.95fr]">
        <AdminDataTable
          columns={[
            {
              header: "Module",
              cell: (record) => (
                <div className="space-y-1">
                  <p className="font-semibold text-ink">{record.title}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate">
                    {record.courseTitle} · order {record.orderIndex}
                  </p>
                  <p className="max-w-md text-sm text-slate">{record.description}</p>
                </div>
              )
            },
            {
              header: "Lessons",
              cell: (record) => <span className="font-semibold text-ink">{record.lessonCount}</span>,
              className: "w-24"
            },
            {
              header: "State",
              cell: (record) => (
                <div className="space-y-3">
                  <AdminStatusBadge status={record.isPublished ? "published" : "draft"} />
                  <AdminInlineToggle
                    action={toggleModulePublishAction}
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
          emptyMessage="No modules exist yet."
          getKey={(record) => record.id}
          items={modules}
          title="Module Catalog"
        />

        <AdminEntityForm
          action={saveModuleAction}
          fields={moduleFields}
          initialValues={
            editingRecord
              ? editingRecord
              : {
                  courseId: courses[0]?.value ?? "",
                  title: "",
                  slug: "",
                  description: "",
                  orderIndex: 1,
                  isPublished: false
                }
          }
          key={editingRecord?.id ?? "new-module"}
          recordId={editingRecord?.id}
          submitLabel={editingRecord ? "Update Module" : "Create Module"}
          title={editingRecord ? "Edit Module" : "Create Module"}
        />
      </div>
    </div>
  );
}
