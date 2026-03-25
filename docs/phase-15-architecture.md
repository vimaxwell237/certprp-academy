# Phase 15 Architecture

Phase 15 adds lightweight queue operations for outbound deliveries and scheduled reminder jobs.

## Scope

- admin-only operations routes at `/admin/operations`
- filtered queue visibility for deliveries and jobs
- replay, resend, ignore, and cancel controls for operators
- detail inspection views for delivery and job records
- deployment-ready scheduler guidance for the Phase 14 cron endpoints

## Data model

Phase 15 extends:

- `notification_deliveries`
  - status now supports `ignored`

No new table is required for this phase. Existing retry, claim, and processing metadata from Phase 14 is reused for operator controls.

## App feature layers

Phase 15 adds `src/features/operations`:

- `data/operations-service.ts`
  - admin queue listing
  - summary counts
  - detail loading
  - delivery retry and ignore controls
  - job replay and cancel controls
- `actions/operations-actions.ts`
  - admin-only server actions
- `lib/validation.ts`
  - replay and cancel guardrails
- `components/*`
  - operations status badges
  - filter tabs
  - summary cards
  - replay and cancel action groups

## Queue operations model

Deliveries:

- filter by `pending`, `failed`, `sent`, `ignored`
- retry failed or ignored deliveries
- force retry when the retry budget is exhausted
- ignore pending or failed deliveries to stop further automated sending

Scheduled jobs:

- filter by `pending`, `failed`, `processed`, `canceled`
- replay failed jobs
- force replay when the retry budget is exhausted
- cancel pending jobs before they run

## Integrity model

Phase 15 operator actions enforce:

- admin-only access
- replay only for valid statuses
- force replay only after retry exhaustion
- cancel only for pending jobs
- ignore only for pending or failed deliveries
- protection against replaying reminder work for expired or unconfirmed tutor sessions
- protection against acting on rows currently being processed by automation

## UI model

Phase 15 adds:

- `/admin/operations`
- `/admin/operations/deliveries`
- `/admin/operations/jobs`
- `/admin/operations/deliveries/[deliveryId]`
- `/admin/operations/jobs/[jobId]`

These pages provide:

- summary metric cards
- queue filter tabs
- status badges
- detail inspection views
- empty states and warning banners
- inline replay, force-replay, ignore, and cancel controls

## Scheduler operations guidance

Operational scheduler setup is documented in `docs/scheduler-automation.md`.

## Phase 16 recommendation

Phase 16 should stay operational and reliability-focused:

- replay/audit notes for operators
- admin filtering by user, template, and job type
- exportable queue incident snapshots
- hosting-specific scheduler examples if deployment targets narrow
