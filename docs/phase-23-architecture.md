# Phase 23: Team Coordination And Escalation Rules

Phase 23 deepens the admin operations surface with reusable escalation rules, bulk queue-subscription management, and digest-style subscription/rule summaries.

## Schema

- `operation_escalation_rules`
  - per-admin queue-pattern escalation rules for `notification_delivery` and `scheduled_job`
  - stores `filters_json`, active state, escalation reason, and timestamps
- `operation_audit_events`
  - expanded with escalation-rule lifecycle and bulk subscription action events

## App Layer

- `src/features/operations/data/operations-service.ts`
  - queue-subscription bulk activate/deactivate/delete/duplicate
  - escalation-rule CRUD
  - manual escalation-rule apply
  - digest match counts for subscriptions and rules
  - overview summary enrichment with active escalation-rule counts
- `src/features/operations/actions/operations-actions.ts`
  - bulk subscription actions
  - escalation-rule create/update/delete/apply server actions
- `src/features/operations/lib/subscriptions.ts`
  - normalized filter serialization
  - shared queue-pattern matching
  - matched-incident digest summaries

## UI

- `src/features/operations/components/operations-saved-views-panel.tsx`
  - save current queue as subscription
  - manage selected subscriptions in bulk
  - create and maintain escalation rules from current filters
  - apply rules and reload matching queue slices
- `src/app/admin/operations/deliveries/page.tsx`
- `src/app/admin/operations/jobs/page.tsx`
  - pass queue-subscription and escalation-rule context into the coordination panel
- `src/app/admin/operations/page.tsx`
  - active escalation-rule summary card
  - delivery/job escalation-rule digest panels
  - subscription shortcuts with live match counts

## Notes

- escalation-rule application is manual first by design
- already escalated incidents are skipped safely during rule application
- bulk subscription actions preserve the current operations route via `returnTo`
