import Link from "next/link";

import {
  saveLabAction,
  toggleLabPublishAction
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
  fetchAdminLab,
  fetchAdminLabs,
  fetchAdminLessonOptions,
  fetchAdminModuleOptions
} from "@/features/admin/data/admin-service";
import { APP_ROUTES } from "@/lib/auth/redirects";

export default async function AdminLabsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const editId =
    typeof resolvedSearchParams.edit === "string" ? resolvedSearchParams.edit : undefined;
  const [labs, modules, lessons, editingRecord] = await Promise.all([
    fetchAdminLabs(),
    fetchAdminModuleOptions(),
    fetchAdminLessonOptions(),
    editId ? fetchAdminLab(editId) : Promise.resolve(null)
  ]);

  const labFields: AdminEntityField[] = [
    {
      name: "moduleId",
      label: "Module",
      type: "select",
      options: modules,
      required: true
    },
    {
      name: "lessonId",
      label: "Lesson",
      type: "select",
      options: lessons,
      description: "Optional. Use when the lab is tied to a specific lesson."
    },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true },
    { name: "summary", label: "Summary", type: "textarea", rows: 4 },
    { name: "instructions", label: "Instructions", type: "textarea", rows: 8 },
    {
      name: "difficulty",
      label: "Difficulty",
      type: "select",
      options: [
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" },
        { value: "advanced", label: "Advanced" }
      ]
    },
    {
      name: "estimatedMinutes",
      label: "Estimated Minutes",
      type: "number",
      min: 1,
      step: 1,
      required: true
    },
    {
      name: "isPublished",
      label: "Publish",
      type: "checkbox",
      description: "Keep labs in draft until their module or lesson is ready."
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <AdminSectionHeader
          description="Manage lab summaries, instructions, difficulty, and staged learner release."
          eyebrow="Hands-On"
          title="Labs"
        />
        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
          href={APP_ROUTES.adminLabs}
        >
          Create New
        </Link>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.45fr_0.95fr]">
        <AdminDataTable
          columns={[
            {
              header: "Lab",
              cell: (record) => (
                <div className="space-y-1">
                  <p className="font-semibold text-ink">{record.title}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate">
                    {record.contextLabel}
                  </p>
                  <p className="max-w-md text-sm text-slate">{record.summary}</p>
                </div>
              )
            },
            {
              header: "Difficulty",
              cell: (record) => (
                <div className="space-y-1">
                  <p className="font-semibold capitalize text-ink">{record.difficulty}</p>
                  <p className="text-sm text-slate">{record.estimatedMinutes} min</p>
                </div>
              ),
              className: "w-28"
            },
            {
              header: "State",
              cell: (record) => (
                <div className="space-y-3">
                  <AdminStatusBadge status={record.isPublished ? "published" : "draft"} />
                  <AdminInlineToggle
                    action={toggleLabPublishAction}
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
          emptyMessage="No labs exist yet."
          getKey={(record) => record.id}
          items={labs}
          title="Lab Catalog"
        />

        <AdminEntityForm
          action={saveLabAction}
          fields={labFields}
          initialValues={
            editingRecord
              ? editingRecord
              : {
                  moduleId: modules[0]?.value ?? "",
                  lessonId: "",
                  title: "",
                  slug: "",
                  summary: "",
                  instructions: "",
                  difficulty: "intermediate",
                  estimatedMinutes: 30,
                  isPublished: false
                }
          }
          key={editingRecord?.id ?? "new-lab"}
          recordId={editingRecord?.id}
          submitLabel={editingRecord ? "Update Lab" : "Create Lab"}
          title={editingRecord ? "Edit Lab" : "Create Lab"}
        />
      </div>
    </div>
  );
}
