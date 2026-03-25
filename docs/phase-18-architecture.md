# Phase 18 Architecture

Phase 18 extends the existing queue-operations surface with operator coordination instead of introducing a separate incident system.

## Scope

- workflow state for `notification_deliveries` and `scheduled_jobs`
- assignment history for claim, release, and reassignment flows
- bulk claim, release, and assign/reassign actions
- conflict-safe ownership handling
- coordination views for assigned, unassigned, needs-attention, and recently-handed-off work

## Schema

Phase 18 is implemented in:

- [20260311_phase18_operator_coordination.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260311_phase18_operator_coordination.sql)

Key additions:

- `workflow_state` and `workflow_state_updated_at` on `notification_deliveries`
- `workflow_state` and `workflow_state_updated_at` on `scheduled_jobs`
- `operation_assignment_history`
- expanded `operation_audit_events.event_type` support for bulk ownership and workflow updates

## App layer

Core logic stays inside the operations feature:

- service layer: [operations-service.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/data/operations-service.ts)
- server actions: [operations-actions.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/actions/operations-actions.ts)
- validation: [validation.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/lib/validation.ts)

New UI surface:

- workflow badge: [operations-workflow-badge.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/components/operations-workflow-badge.tsx)
- assignment history: [operations-assignment-history.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/components/operations-assignment-history.tsx)

Updated UI surface:

- operations overview: [page.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/page.tsx)
- deliveries list: [page.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/deliveries/page.tsx)
- jobs list: [page.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/jobs/page.tsx)
- delivery detail: [page.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/deliveries/[deliveryId]/page.tsx)
- job detail: [page.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/jobs/[jobId]/page.tsx)

## Coordination behavior

- `claim` is conflict-safe and blocks if another admin already owns the incident
- `release` and detail-page reassign actions verify expected ownership so stale UI does not silently overwrite changes
- bulk assign/reassign is explicit ownership overwrite and records both assignment history and audit metadata
- workflow changes are validated and audited

## Verification targets

- `/admin/operations`
- `/admin/operations/deliveries`
- `/admin/operations/jobs`
- `/admin/operations/deliveries/[deliveryId]`
- `/admin/operations/jobs/[jobId]`
