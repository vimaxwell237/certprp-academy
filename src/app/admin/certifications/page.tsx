import Link from "next/link";

import {
  saveCertificationAction,
  toggleCertificationPublishAction
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
  fetchAdminCertification,
  fetchAdminCertifications
} from "@/features/admin/data/admin-service";
import { APP_ROUTES } from "@/lib/auth/redirects";

const certificationFields: AdminEntityField[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    rows: 5
  },
  {
    name: "isPublished",
    label: "Publish",
    type: "checkbox",
    description: "Published certifications can surface learner-facing content."
  }
];

export default async function AdminCertificationsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const editId =
    typeof resolvedSearchParams.edit === "string" ? resolvedSearchParams.edit : undefined;
  const [certifications, editingRecord] = await Promise.all([
    fetchAdminCertifications(),
    editId ? fetchAdminCertification(editId) : Promise.resolve(null)
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <AdminSectionHeader
          description="Control certification visibility and keep the top-level catalog ready for future tracks beyond CCNA."
          eyebrow="Catalog"
          title="Certifications"
        />
        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
          href={APP_ROUTES.adminCertifications}
        >
          Create New
        </Link>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.45fr_0.95fr]">
        <AdminDataTable
          columns={[
            {
              header: "Certification",
              cell: (record) => (
                <div className="space-y-1">
                  <p className="font-semibold text-ink">{record.name}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate">{record.slug}</p>
                  <p className="max-w-md text-sm text-slate">{record.description}</p>
                </div>
              )
            },
            {
              header: "Courses",
              cell: (record) => <span className="font-semibold text-ink">{record.courseCount}</span>,
              className: "w-28"
            },
            {
              header: "State",
              cell: (record) => (
                <div className="space-y-3">
                  <AdminStatusBadge status={record.isPublished ? "published" : "draft"} />
                  <AdminInlineToggle
                    action={toggleCertificationPublishAction}
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
          emptyMessage="No certifications have been created yet."
          getKey={(record) => record.id}
          items={certifications}
          title="Certification Catalog"
        />

        <AdminEntityForm
          action={saveCertificationAction}
          fields={certificationFields}
          initialValues={
            editingRecord
              ? editingRecord
              : {
                  name: "",
                  slug: "",
                  description: "",
                  isPublished: false
                }
          }
          key={editingRecord?.id ?? "new-certification"}
          recordId={editingRecord?.id}
          submitLabel={editingRecord ? "Update Certification" : "Create Certification"}
          title={editingRecord ? "Edit Certification" : "Create Certification"}
        />
      </div>
    </div>
  );
}
