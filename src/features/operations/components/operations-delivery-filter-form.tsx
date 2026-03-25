import Link from "next/link";

import { APP_ROUTES } from "@/lib/auth/redirects";
import type { AdminDeliveryFilters } from "@/types/operations";

const templateOptions = [
  "session_booked",
  "session_confirmed",
  "session_canceled",
  "session_reminder",
  "session_completed",
  "followup_added"
] as const;

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "highest_retry_count", label: "Highest Retry Count" },
  { value: "recently_failed", label: "Recently Failed" }
] as const;

export function OperationsDeliveryFilterForm({
  filters
}: {
  filters: AdminDeliveryFilters;
}) {
  return (
    <form
      className="grid gap-4 rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft lg:grid-cols-7"
      method="get"
    >
      <input name="filter" type="hidden" value={filters.status} />

      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
          User ID
        </span>
        <input
          className="w-full rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          defaultValue={filters.userId}
          name="userId"
          placeholder="Filter by user UUID"
          type="text"
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
          Template
        </span>
        <select
          className="w-full rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          defaultValue={filters.templateKey}
          name="templateKey"
        >
          <option value="all">All templates</option>
          {templateOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
          Channel
        </span>
        <select
          className="w-full rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          defaultValue={filters.channel}
          name="channel"
        >
          <option value="all">All channels</option>
          <option value="email">Email</option>
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
          Ownership
        </span>
        <select
          className="w-full rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          defaultValue={filters.ownership}
          name="ownership"
        >
          <option value="all">All incidents</option>
          <option value="assigned_to_me">Assigned to me</option>
          <option value="unassigned">Unassigned</option>
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
          Workflow
        </span>
        <select
          className="w-full rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          defaultValue={filters.workflowState}
          name="workflowState"
        >
          <option value="all">All workflow states</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="waiting">Waiting</option>
          <option value="resolved">Resolved</option>
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
          Related Entity
        </span>
        <input
          className="w-full rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          defaultValue={filters.relatedEntityType}
          name="relatedEntityType"
          placeholder="ex: tutor_session"
          type="text"
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
          Sort
        </span>
        <select
          className="w-full rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          defaultValue={filters.sort}
          name="sort"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-2 lg:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
          Triage
        </span>
        <div className="space-y-2">
          <label className="flex h-[42px] items-center gap-3 rounded-2xl border border-ink/10 px-4">
            <input
              className="h-4 w-4 rounded border border-ink/20 text-cyan focus:ring-cyan"
              defaultChecked={filters.needsAttention}
              name="needsAttention"
              type="checkbox"
              value="true"
            />
            <span className="text-sm text-ink">Needs attention only</span>
          </label>
          <label className="flex h-[42px] items-center gap-3 rounded-2xl border border-ink/10 px-4">
            <input
              className="h-4 w-4 rounded border border-ink/20 text-cyan focus:ring-cyan"
              defaultChecked={filters.recentlyHandedOff}
              name="recentlyHandedOff"
              type="checkbox"
              value="true"
            />
            <span className="text-sm text-ink">Recently handed off</span>
          </label>
          <label className="flex h-[42px] items-center gap-3 rounded-2xl border border-ink/10 px-4">
            <input
              className="h-4 w-4 rounded border border-ink/20 text-cyan focus:ring-cyan"
              defaultChecked={filters.watchedOnly}
              name="watchedOnly"
              type="checkbox"
              value="true"
            />
            <span className="text-sm text-ink">Only incidents I watch</span>
          </label>
          <label className="flex h-[42px] items-center gap-3 rounded-2xl border border-ink/10 px-4">
            <input
              className="h-4 w-4 rounded border border-ink/20 text-cyan focus:ring-cyan"
              defaultChecked={filters.escalatedOnly}
              name="escalatedOnly"
              type="checkbox"
              value="true"
            />
            <span className="text-sm text-ink">Escalated only</span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 lg:col-span-7">
        <button
          className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
          type="submit"
        >
          Apply Filters
        </button>
        <Link
          className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
          href={APP_ROUTES.adminOperationsDeliveries}
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
