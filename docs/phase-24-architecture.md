# Phase 24: Automated Rules And Subscription Digests

Phase 24 extends the operations feature with automated escalation-rule execution, digest delivery for queue subscriptions, cooldown/rate-limit guardrails, and recent run visibility.

## Schema

- `operation_escalation_rules`
  - now stores `run_mode`, `last_run_at`, `next_run_at`, `cooldown_minutes`, and `max_matches_per_run`
- `operation_queue_subscriptions`
  - now stores `digest_cooldown_minutes`, `last_digest_at`, and `last_digest_hash`
- `operation_escalation_rule_runs`
  - rule-run history for manual and automated execution
- `operation_subscription_digest_runs`
  - digest-run history for queue subscriptions

## App Layer

- `src/features/operations/data/operations-service.ts`
  - automated rule processing
  - manual and automated digest generation
  - cooldown and max-match guardrails
  - run-history recording
  - in-app digest notification creation
- `src/features/operations/lib/automation.ts`
  - cooldown calculation
  - digest fingerprinting
  - queue-match explanation strings
  - max-match limiting
- `src/features/operations/actions/operations-actions.ts`
  - manual digest generation
  - richer rule and subscription configuration handling

## Automation

- `POST /api/internal/process-escalation-rules`
- `POST /api/internal/process-subscription-digests`

Both endpoints use the same `AUTOMATION_SECRET` pattern as the existing queue automation routes.

## UI

- operations coordination panel now shows:
  - rule mode
  - cooldown and max-match settings
  - last run / next eligible timestamps
  - recent rule runs
  - recent digest runs
  - manual digest action per subscription
- operations overview now surfaces:
  - active automated rules
  - recent rule runs
  - recent digest runs
  - rules in cooldown
  - subscriptions with active matches

## Notes

- unchanged subscription digests are suppressed during automation with `last_digest_hash`
- manual digest generation bypasses cooldown so operators can force a fresh digest when needed
- automated escalation rules still respect existing queue validity checks and skip already escalated incidents
