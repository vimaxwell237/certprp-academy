import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminSectionHeader } from "@/features/admin/components/admin-section-header";
import { OperationsFilterTabs } from "@/features/operations/components/operations-filter-tabs";
import { OperationsJobFilterForm } from "@/features/operations/components/operations-job-filter-form";
import { OperationsJobsTable } from "@/features/operations/components/operations-jobs-table";
import { OperationsSavedViewsPanel } from "@/features/operations/components/operations-saved-views-panel";
import {
  fetchDefaultOperationSavedView,
  fetchAdminOperators,
  fetchAdminOperationsSnapshot,
  listOperationEscalationRules,
  listOperationEscalationRuleRuns,
  listOperationQueueSubscriptions,
  listOperationSubscriptionDigestRuns,
  listAdminJobs,
  listOperationSavedViews
} from "@/features/operations/data/operations-service";
import { DEFAULT_JOB_FILTERS } from "@/features/operations/lib/collaboration";
import { FlashBanner } from "@/features/scheduling/components/flash-banner";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { requireAdminUser } from "@/lib/auth/roles";
import type { AdminJobFilters, OperationsJobFilter } from "@/types/operations";

const jobFilterOptions: Array<{
  label: string;
  value: OperationsJobFilter;
}> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
  { label: "Processed", value: "processed" },
  { label: "Canceled", value: "canceled" }
];

function resolveFilter(value: string | string[] | undefined): OperationsJobFilter {
  const candidate = Array.isArray(value) ? value[0] : value;

  return jobFilterOptions.some((option) => option.value === candidate)
    ? (candidate as OperationsJobFilter)
    : "all";
}

function readValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function resolveFilters(searchParams: Record<string, string | string[] | undefined>): AdminJobFilters {
  return {
    ...DEFAULT_JOB_FILTERS,
    status: resolveFilter(searchParams.filter),
    userId: readValue(searchParams.userId).trim(),
    jobType: (readValue(searchParams.jobType) || "all") as AdminJobFilters["jobType"],
    relatedEntityType: readValue(searchParams.relatedEntityType).trim(),
    needsAttention: readValue(searchParams.needsAttention) === "true",
    ownership: (readValue(searchParams.ownership) || "all") as AdminJobFilters["ownership"],
    workflowState: (readValue(searchParams.workflowState) ||
      "all") as AdminJobFilters["workflowState"],
    recentlyHandedOff: readValue(searchParams.recentlyHandedOff) === "true",
    watchedOnly: readValue(searchParams.watchedOnly) === "true",
    escalatedOnly: readValue(searchParams.escalatedOnly) === "true",
    sort: (readValue(searchParams.sort) || "newest") as AdminJobFilters["sort"]
  };
}

function buildReturnTo(filters: AdminJobFilters, savedViewId?: string | null) {
  const params = new URLSearchParams();

  if (filters.status !== "all") {
    params.set("filter", filters.status);
  }

  if (filters.userId) {
    params.set("userId", filters.userId);
  }

  if (filters.jobType !== "all") {
    params.set("jobType", filters.jobType);
  }

  if (filters.ownership !== "all") {
    params.set("ownership", filters.ownership);
  }

  if (filters.workflowState !== "all") {
    params.set("workflowState", filters.workflowState);
  }

  if (filters.relatedEntityType) {
    params.set("relatedEntityType", filters.relatedEntityType);
  }

  if (filters.needsAttention) {
    params.set("needsAttention", "true");
  }

  if (filters.recentlyHandedOff) {
    params.set("recentlyHandedOff", "true");
  }

  if (filters.watchedOnly) {
    params.set("watchedOnly", "true");
  }

  if (filters.escalatedOnly) {
    params.set("escalatedOnly", "true");
  }

  if (filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  if (savedViewId) {
    params.set("savedView", savedViewId);
  }

  const query = params.toString();

  return query ? `${APP_ROUTES.adminOperationsJobs}?${query}` : APP_ROUTES.adminOperationsJobs;
}

export default async function AdminOperationsJobsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const adminUser = await requireAdminUser();
  const resolvedSearchParams = await searchParams;
  const activeSavedViewId = readValue(resolvedSearchParams.savedView) || null;

  if (Object.keys(resolvedSearchParams).length === 0) {
    const defaultView = await fetchDefaultOperationSavedView(adminUser.id, "scheduled_job");

    if (defaultView) {
      redirect(buildReturnTo(defaultView.filters as AdminJobFilters, defaultView.id));
    }
  }

  const filters = resolveFilters(resolvedSearchParams);
  const success =
    (Array.isArray(resolvedSearchParams.success)
      ? resolvedSearchParams.success[0]
      : resolvedSearchParams.success) ?? "";
  const error =
    (Array.isArray(resolvedSearchParams.error)
      ? resolvedSearchParams.error[0]
      : resolvedSearchParams.error) ?? "";
  const warning =
    (Array.isArray(resolvedSearchParams.warning)
      ? resolvedSearchParams.warning[0]
      : resolvedSearchParams.warning) ?? "";

  const [
    snapshot,
    jobs,
    operators,
    savedViews,
    subscriptions,
    escalationRules,
    recentRuleRuns,
    recentDigestRuns
  ] = await Promise.all([
    fetchAdminOperationsSnapshot(adminUser.id),
    listAdminJobs(filters, 25, adminUser.id),
    fetchAdminOperators(adminUser.id),
    listOperationSavedViews(adminUser.id, "scheduled_job"),
    listOperationQueueSubscriptions(adminUser.id, "scheduled_job"),
    listOperationEscalationRules(adminUser.id, "scheduled_job"),
    listOperationEscalationRuleRuns(adminUser.id, "scheduled_job", 10),
    listOperationSubscriptionDigestRuns(adminUser.id, "scheduled_job", 10)
  ]);
  const returnTo = buildReturnTo(filters, activeSavedViewId);
  const viewHrefMap = Object.fromEntries(
    savedViews.map((view) => [view.id, buildReturnTo(view.filters as AdminJobFilters, view.id)])
  );
  const subscriptionHrefMap = Object.fromEntries(
    subscriptions.map((subscription) => [
      subscription.id,
      buildReturnTo(subscription.filters as AdminJobFilters, null)
    ])
  );
  const escalationRuleHrefMap = Object.fromEntries(
    escalationRules.map((rule) => [rule.id, buildReturnTo(rule.filters as AdminJobFilters, null)])
  );

  return (
    <div className="space-y-8">
      {success ? <FlashBanner message={success} tone="success" /> : null}
      {error ? <FlashBanner message={error} tone="error" /> : null}
      {warning ? <FlashBanner message={warning} tone="warning" /> : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <AdminSectionHeader
          description="Inspect reminder scheduling state, replay failed jobs, and cancel stale pending work before it fires."
          eyebrow="Queue Ops"
          title="Scheduled Jobs"
        />
        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
          href={APP_ROUTES.adminOperations}
        >
          Back to Overview
        </Link>
      </div>

      {snapshot.warning ? <FlashBanner message={snapshot.warning} tone="error" /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate">
            Pending
          </p>
          <p className="mt-3 font-display text-4xl font-bold text-ink">
            {snapshot.summary.jobs.pending}
          </p>
        </div>
        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-5 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
            Failed
          </p>
          <p className="mt-3 font-display text-4xl font-bold text-rose-900">
            {snapshot.summary.jobs.failed}
          </p>
        </div>
        <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Processed
          </p>
          <p className="mt-3 font-display text-4xl font-bold text-cyan-900">
            {snapshot.summary.jobs.processed}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-100 p-5 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">
            Canceled
          </p>
          <p className="mt-3 font-display text-4xl font-bold text-slate-900">
            {snapshot.summary.jobs.canceled}
          </p>
        </div>
        <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Assigned To Me
          </p>
          <p className="mt-3 font-display text-4xl font-bold text-cyan-900">
            {snapshot.summary.jobs.assignedToMe}
          </p>
        </div>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
            Unassigned Attention
          </p>
          <p className="mt-3 font-display text-4xl font-bold text-amber-900">
            {snapshot.summary.jobs.unassignedNeedingAttention}
          </p>
        </div>
      </div>

      <OperationsFilterTabs
        currentValue={filters.status}
        items={jobFilterOptions.map((option) => ({
          href:
            option.value === "all"
              ? buildReturnTo({ ...filters, status: "all" }, activeSavedViewId)
              : buildReturnTo({ ...filters, status: option.value }, activeSavedViewId),
          label: option.label,
          value: option.value
        }))}
      />

      <OperationsFilterTabs
        currentValue={
          filters.recentlyHandedOff
            ? "recently_handed_off"
            : filters.escalatedOnly
              ? "escalated"
            : filters.watchedOnly
              ? "watching"
            : filters.needsAttention
              ? "needs_attention"
              : filters.ownership
        }
        items={[
          { href: buildReturnTo({ ...filters, ownership: "all", needsAttention: false, recentlyHandedOff: false, watchedOnly: false, escalatedOnly: false }, activeSavedViewId), label: "All", value: "all" },
          {
            href: buildReturnTo({
              ...filters,
              ownership: "assigned_to_me",
              needsAttention: false,
              recentlyHandedOff: false,
              watchedOnly: false,
              escalatedOnly: false
            }, activeSavedViewId),
            label: "My Queue",
            value: "assigned_to_me"
          },
          {
            href: buildReturnTo({
              ...filters,
              ownership: "unassigned",
              needsAttention: false,
              recentlyHandedOff: false,
              watchedOnly: false,
              escalatedOnly: false
            }, activeSavedViewId),
            label: "Unassigned",
            value: "unassigned"
          },
          {
            href: buildReturnTo({
              ...filters,
              ownership: "all",
              needsAttention: true,
              recentlyHandedOff: false,
              watchedOnly: false,
              escalatedOnly: false
            }, activeSavedViewId),
            label: "Needs Attention",
            value: "needs_attention"
          },
          {
            href: buildReturnTo({
              ...filters,
              ownership: "all",
              needsAttention: false,
              recentlyHandedOff: false,
              watchedOnly: true,
              escalatedOnly: false
            }, activeSavedViewId),
            label: "Watching",
            value: "watching"
          },
          {
            href: buildReturnTo({
              ...filters,
              ownership: "all",
              needsAttention: false,
              recentlyHandedOff: false,
              watchedOnly: false,
              escalatedOnly: true
            }, activeSavedViewId),
            label: "Escalated",
            value: "escalated"
          },
          {
            href: buildReturnTo({
              ...filters,
              ownership: "all",
              needsAttention: false,
              recentlyHandedOff: true,
              watchedOnly: false,
              escalatedOnly: false
            }, activeSavedViewId),
            label: "Recently Handed Off",
            value: "recently_handed_off"
          }
        ]}
      />

      <OperationsJobFilterForm filters={filters} />

      <OperationsSavedViewsPanel
        currentFiltersJson={JSON.stringify(filters)}
        currentSavedViewId={activeSavedViewId}
        entityType="scheduled_job"
        operators={operators}
        returnTo={returnTo}
        subscriptions={subscriptions}
        subscriptionHrefMap={subscriptionHrefMap}
        escalationRules={escalationRules}
        escalationRuleHrefMap={escalationRuleHrefMap}
        recentRuleRuns={recentRuleRuns}
        recentDigestRuns={recentDigestRuns}
        viewHrefMap={viewHrefMap}
        views={savedViews}
      />

      <OperationsJobsTable
        currentAdminUserId={adminUser.id}
        jobs={jobs}
        operators={operators}
        returnTo={returnTo}
      />
    </div>
  );
}
