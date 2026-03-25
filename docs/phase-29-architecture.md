# Phase 29 Architecture

Phase 29 extends the Phase 28 acknowledgement workflow with assignment, reminder timing, rerun outcomes, and post-rerun verification guidance for unhealthy automation.

## Schema

The Supabase migration is:

- [20260313_phase29_acknowledgement_followup.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260313_phase29_acknowledgement_followup.sql)

It adds acknowledgement follow-up metadata to `operation_automation_acknowledgements`:

- `assigned_admin_user_id`
- `assigned_at`
- `remind_at`
- `reminder_state`
- `last_reminded_at`
- `rerun_outcome`
- `last_rerun_at`
- `verification_state`
- `verification_summary`

It also expands:

- `notifications.type` for automation assignment and reminder notifications
- `operation_audit_events.event_type` for manual rerun outcome tracking

## App Layer

Phase 29 stays inside the operations feature:

- service and workflow logic: [operations-service.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/data/operations-service.ts)
- server actions: [operations-actions.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/actions/operations-actions.ts)
- rerun and verification helpers: [playbooks.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/lib/playbooks.ts)
- reminder processing endpoint: [route.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/api/internal/process-automation-acknowledgement-reminders/route.ts)

## UI

Rule and subscription drill-down pages now show:

- current assignee
- reminder timing state
- latest rerun outcome
- post-rerun verification guidance
- acknowledgement history with assignment and rerun context

The overview at `/admin/operations` now adds:

- assigned unhealthy automation count
- unassigned unhealthy automation count
- overdue acknowledgement reminders count
- fixed pending rerun awaiting verification count
- quick lists for rules and subscriptions needing follow-up

## Verification

Phase 29 was verified with:

- `npm run lint`
- `npm run test:unit`
- `npm run build`
- `npm run typecheck`
