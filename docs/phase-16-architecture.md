# Phase 16 Architecture

Phase 16 extends queue operations with incident management, triage, notes, and audit history.

## Scope

- operator notes attached to deliveries and jobs
- audit history for replay, retry, cancel, ignore, and note actions
- needs-attention triage helpers for queue rows
- richer admin filtering and sorting for queue operations
- admin detail pages that combine record state, triage context, notes, and audit trail

## Data model

Phase 16 adds:

- `operation_notes`
  - append-only operator notes
  - scoped to either `notification_delivery` or `scheduled_job`
- `operation_audit_events`
  - append-only audit trail for operator actions
  - stores event type, summary, metadata, and triggering admin if available

Both tables are admin-only through RLS.

## App feature layers

Phase 16 extends `src/features/operations`:

- `data/operations-service.ts`
  - advanced queue filters
  - needs-attention enrichment
  - notes and audit retrieval
  - audit creation for operator actions
- `actions/operations-actions.ts`
  - add-note action
  - audit-aware retry, replay, cancel, and ignore actions
- `lib/triage.ts`
  - reusable queue triage heuristics
- `components/*`
  - filter forms
  - triage badges and panels
  - notes panel
  - audit timeline

## Triage model

Phase 16 marks queue rows for attention when they show patterns such as:

- repeated failures
- retry exhaustion
- stale pending state
- missing target data
- invalid tutor-session targets for reminder work

This state is surfaced in:

- overview summary cards
- delivery and job list views
- detail triage panels

## UI model

Phase 16 upgrades:

- `/admin/operations`
- `/admin/operations/deliveries`
- `/admin/operations/jobs`
- `/admin/operations/deliveries/[deliveryId]`
- `/admin/operations/jobs/[jobId]`

with:

- richer filters and sorting
- needs-attention badges
- recent operator actions
- top failure categories
- append-only notes
- audit trail timelines

## Phase 17 recommendation

Phase 17 should keep improving operational reliability:

- bulk triage actions for grouped failures
- operator assignment or ownership markers
- filtered exports for incident review
- delivery replay guardrails by failure category
