# Phase 25 Architecture

Phase 25 extends the existing operations automation layer rather than introducing a separate subsystem.

## Scope

- mute and snooze controls for `operation_escalation_rules`
- mute and snooze controls for `operation_queue_subscriptions`
- execution-health counters and timestamps for both record types
- richer rule-run and digest-run history with explicit success, skip, and failure outcomes
- admin controls in the existing operations rule/subscription panel
- overview widgets for muted, snoozed, unhealthy, skipped, and failed automation

## Schema

Migration: [20260312_phase25_automation_health_controls.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260312_phase25_automation_health_controls.sql)

Main additions:

- `operation_escalation_rules`
  - `is_muted`
  - `snoozed_until`
  - `muted_or_snoozed_reason`
  - `consecutive_skip_count`
  - `consecutive_failure_count`
  - `last_success_at`
  - `last_failure_at`
  - `last_skip_reason`
- `operation_queue_subscriptions`
  - same control and health fields as rules
- `operation_escalation_rule_runs`
  - `run_status`
  - `skip_reason`
  - `failure_reason`
  - `duration_ms`
- `operation_subscription_digest_runs`
  - `triggered_by`
  - `triggered_by_admin_user_id`
  - `run_status`
  - `skip_reason`
  - `failure_reason`
  - `duration_ms`

## Service layer

Primary files:

- [operations-service.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/data/operations-service.ts)
- [automation.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/lib/automation.ts)
- [operations-actions.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/actions/operations-actions.ts)

Key behavior:

- automation eligibility now checks mute, snooze, and cooldown before rule or digest execution
- skipped runs write run-history rows instead of disappearing silently
- execution-health metadata updates after success, skip, and failure outcomes
- manual runs can intentionally override mute or snooze from the admin UI
- automation endpoints continue to use the existing secure internal routes

## UI

Primary files:

- [operations-saved-views-panel.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/components/operations-saved-views-panel.tsx)
- [page.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/page.tsx)

Main additions:

- mute, snooze, and resume controls on queue subscriptions and escalation rules
- automation-state and health badges
- last success, failure, or skip context on rule and subscription cards
- run-history cards showing run status, skip reason, failure reason, and duration
- overview counts for muted rules, snoozed subscriptions, unhealthy automation, skipped runs, and failed runs
