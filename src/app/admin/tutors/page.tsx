import Link from "next/link";

import {
  saveTutorAction,
  toggleTutorActiveAction
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
  fetchAdminTutor,
  fetchAdminTutors
} from "@/features/admin/data/admin-service";
import { APP_ROUTES } from "@/lib/auth/redirects";

export default async function AdminTutorsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const editId =
    typeof resolvedSearchParams.edit === "string" ? resolvedSearchParams.edit : undefined;
  const [tutors, editingRecord] = await Promise.all([
    fetchAdminTutors(),
    editId ? fetchAdminTutor(editId) : Promise.resolve(null)
  ]);

  const tutorFields: AdminEntityField[] = [
    {
      name: "userId",
      label: "Tutor User ID",
      type: "text",
      required: true,
      description: "Use the auth user UUID for the tutor account."
    },
    { name: "displayName", label: "Display Name", type: "text", required: true },
    { name: "bio", label: "Bio", type: "textarea", rows: 6 },
    {
      name: "expertise",
      label: "Expertise",
      type: "textarea",
      rows: 4,
      description: "Comma-separated topics, for example: routing, OSPF, Packet Tracer"
    },
    {
      name: "isActive",
      label: "Active",
      type: "checkbox",
      description: "Active tutors appear in the learner-facing tutor directory."
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <AdminSectionHeader
          description="Manage tutor profiles, expertise metadata, and operational activation status."
          eyebrow="People"
          title="Tutors"
        />
        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
          href={APP_ROUTES.adminTutors}
        >
          Create New
        </Link>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.45fr_0.95fr]">
        <AdminDataTable
          columns={[
            {
              header: "Tutor",
              cell: (record) => (
                <div className="space-y-1">
                  <p className="font-semibold text-ink">{record.displayName}</p>
                  <p className="font-mono text-xs text-slate">{record.userId}</p>
                  <p className="max-w-md text-sm text-slate">{record.bio}</p>
                </div>
              )
            },
            {
              header: "Expertise",
              cell: (record) => (
                <p className="max-w-xs text-sm text-slate">
                  {record.expertise.length > 0 ? record.expertise.join(", ") : "No expertise tags"}
                </p>
              )
            },
            {
              header: "State",
              cell: (record) => (
                <div className="space-y-3">
                  <AdminStatusBadge status={record.isActive ? "active" : "inactive"} />
                  <AdminInlineToggle
                    action={toggleTutorActiveAction}
                    label={record.isActive ? "Deactivate" : "Activate"}
                    nextValue={!record.isActive}
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
          emptyMessage="No tutor profiles exist yet."
          getKey={(record) => record.id}
          items={tutors}
          title="Tutor Directory"
        />

        <AdminEntityForm
          action={saveTutorAction}
          fields={tutorFields}
          initialValues={
            editingRecord
              ? {
                  ...editingRecord,
                  expertise: editingRecord.expertise.join(", ")
                }
              : {
                  userId: "",
                  displayName: "",
                  bio: "",
                  expertise: "",
                  isActive: true
                }
          }
          key={editingRecord?.id ?? "new-tutor"}
          recordId={editingRecord?.id}
          submitLabel={editingRecord ? "Update Tutor" : "Create Tutor"}
          title={editingRecord ? "Edit Tutor" : "Create Tutor"}
        />
      </div>
    </div>
  );
}
