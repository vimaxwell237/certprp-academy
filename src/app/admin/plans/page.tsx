import Link from "next/link";

import {
  savePlanAction,
  togglePlanActiveAction
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
  fetchAdminPlan,
  fetchAdminPlans
} from "@/features/admin/data/admin-service";
import { APP_ROUTES } from "@/lib/auth/redirects";

export default async function AdminPlansPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const editId =
    typeof resolvedSearchParams.edit === "string" ? resolvedSearchParams.edit : undefined;
  const [plans, editingRecord] = await Promise.all([
    fetchAdminPlans(),
    editId ? fetchAdminPlan(editId) : Promise.resolve(null)
  ]);

  const planFields: AdminEntityField[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", rows: 6 },
    {
      name: "priceAmount",
      label: "Price (USD cents)",
      type: "number",
      min: 0,
      step: 1,
      required: true
    },
    {
      name: "billingInterval",
      label: "Billing Interval",
      type: "select",
      options: [
        { value: "none", label: "None" },
        { value: "month", label: "Monthly" },
        { value: "year", label: "Yearly" }
      ]
    },
    {
      name: "isActive",
      label: "Active",
      type: "checkbox",
      description: "Only active plans should show on pricing and billing pages."
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <AdminSectionHeader
          description="Manage plan copy, price points, and billing visibility without changing the underlying billing foundation."
          eyebrow="Commerce"
          title="Plans"
        />
        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
          href={APP_ROUTES.adminPlans}
        >
          Create New
        </Link>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.45fr_0.95fr]">
        <AdminDataTable
          columns={[
            {
              header: "Plan",
              cell: (record) => (
                <div className="space-y-1">
                  <p className="font-semibold text-ink">{record.name}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate">{record.slug}</p>
                  <p className="max-w-md text-sm text-slate">{record.description}</p>
                </div>
              )
            },
            {
              header: "Billing",
              cell: (record) => (
                <div className="space-y-1">
                  <p className="font-semibold text-ink">${(record.priceAmount / 100).toFixed(2)}</p>
                  <p className="text-sm capitalize text-slate">{record.billingInterval}</p>
                </div>
              ),
              className: "w-28"
            },
            {
              header: "State",
              cell: (record) => (
                <div className="space-y-3">
                  <AdminStatusBadge status={record.isActive ? "active" : "inactive"} />
                  <AdminInlineToggle
                    action={togglePlanActiveAction}
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
          emptyMessage="No plans exist yet."
          getKey={(record) => record.id}
          items={plans}
          title="Plan Catalog"
        />

        <AdminEntityForm
          action={savePlanAction}
          fields={planFields}
          initialValues={
            editingRecord
              ? editingRecord
              : {
                  name: "",
                  slug: "",
                  description: "",
                  priceAmount: 0,
                  billingInterval: "month",
                  isActive: true
                }
          }
          key={editingRecord?.id ?? "new-plan"}
          recordId={editingRecord?.id}
          submitLabel={editingRecord ? "Update Plan" : "Create Plan"}
          title={editingRecord ? "Edit Plan" : "Create Plan"}
        />
      </div>
    </div>
  );
}
