import Link from "next/link";

import {
  saveCourseAction,
  toggleCoursePublishAction
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
  fetchAdminCertificationOptions,
  fetchAdminCourse,
  fetchAdminCourses
} from "@/features/admin/data/admin-service";
import { APP_ROUTES } from "@/lib/auth/redirects";

export default async function AdminCoursesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const editId =
    typeof resolvedSearchParams.edit === "string" ? resolvedSearchParams.edit : undefined;
  const [courses, certifications, editingRecord] = await Promise.all([
    fetchAdminCourses(),
    fetchAdminCertificationOptions(),
    editId ? fetchAdminCourse(editId) : Promise.resolve(null)
  ]);

  const courseFields: AdminEntityField[] = [
    {
      name: "certificationId",
      label: "Certification",
      type: "select",
      options: certifications,
      required: true
    },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", rows: 5 },
    {
      name: "level",
      label: "Level",
      type: "select",
      options: [
        { value: "entry", label: "Entry" },
        { value: "associate", label: "Associate" },
        { value: "professional", label: "Professional" }
      ]
    },
    {
      name: "isPublished",
      label: "Publish",
      type: "checkbox",
      description: "Only published courses should appear in learner navigation."
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <AdminSectionHeader
          description="Manage certification-to-course mapping, course metadata, and learner-facing publish state."
          eyebrow="Catalog"
          title="Courses"
        />
        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
          href={APP_ROUTES.adminCourses}
        >
          Create New
        </Link>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.45fr_0.95fr]">
        <AdminDataTable
          columns={[
            {
              header: "Course",
              cell: (record) => (
                <div className="space-y-1">
                  <p className="font-semibold text-ink">{record.title}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate">
                    {record.certificationName} · {record.level}
                  </p>
                  <p className="max-w-md text-sm text-slate">{record.description}</p>
                </div>
              )
            },
            {
              header: "Structure",
              cell: (record) => (
                <div className="space-y-1">
                  <p className="font-semibold text-ink">{record.moduleCount} modules</p>
                  <p className="text-sm text-slate">{record.lessonCount} lessons</p>
                </div>
              ),
              className: "w-36"
            },
            {
              header: "State",
              cell: (record) => (
                <div className="space-y-3">
                  <AdminStatusBadge status={record.isPublished ? "published" : "draft"} />
                  <AdminInlineToggle
                    action={toggleCoursePublishAction}
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
          emptyMessage="No courses exist yet."
          getKey={(record) => record.id}
          items={courses}
          title="Course Catalog"
        />

        <AdminEntityForm
          action={saveCourseAction}
          fields={courseFields}
          initialValues={
            editingRecord
              ? editingRecord
              : {
                  certificationId: certifications[0]?.value ?? "",
                  title: "",
                  slug: "",
                  description: "",
                  level: "associate",
                  isPublished: false
                }
          }
          key={editingRecord?.id ?? "new-course"}
          recordId={editingRecord?.id}
          submitLabel={editingRecord ? "Update Course" : "Create Course"}
          title={editingRecord ? "Edit Course" : "Create Course"}
        />
      </div>
    </div>
  );
}
