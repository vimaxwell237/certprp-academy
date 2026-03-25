# Phase 17 Architecture

Phase 17 extends queue operations with operator ownership and bulk triage workflows.

## Scope

- ownership fields on deliveries and jobs
- claim, release, and reassign flows for incidents
- row selection with select-all and bulk queue actions
- audit trail support for ownership changes and bulk-origin actions
- assigned/unassigned list filters and overview counts

## Data model

Phase 17 extends:

- `notification_deliveries`
  - `assigned_admin_user_id`
  - `assigned_at`
  - `handoff_note`
- `scheduled_jobs`
  - `assigned_admin_user_id`
  - `assigned_at`
  - `handoff_note`

Phase 17 also expands `operation_audit_events.event_type` so ownership changes are auditable:

- `claimed`
- `released`
- `reassigned`

## App feature layers

Phase 17 extends `src/features/operations`:

- `data/operations-service.ts`
  - ownership mutation helpers
  - bulk retry, replay, ignore, and cancel helpers
  - assigned/unassigned filtering
  - operator lookup for reassignment
- `actions/operations-actions.ts`
  - bulk queue server actions
  - claim, release, and assign actions
- `components/*`
  - selectable delivery and job tables
  - owner badges
  - ownership panel for detail pages

## Workflow model

Operators can now:

- claim unowned incidents
- release owned incidents
- reassign incidents with a handoff note
- bulk retry failed deliveries
- bulk force-retry exhausted deliveries
- bulk ignore deliveries
- bulk replay failed jobs
- bulk cancel pending jobs

Bulk actions still run through the same server-side validation as single-item actions, so invalid reminder/session states remain blocked.

## UI model

Phase 17 upgrades:

- `/admin/operations`
- `/admin/operations/deliveries`
- `/admin/operations/jobs`
- delivery and job detail pages

with:

- row checkboxes
- select-all on page
- bulk action toolbars
- ownership badges
- assigned/unassigned filters
- my-assigned overview widgets
- ownership handoff controls on detail pages

## Phase 18 recommendation

Phase 18 should continue operator productivity work:

- bulk reassignment
- saved queue views
- incident SLA timers
- bulk-export of filtered queue results
