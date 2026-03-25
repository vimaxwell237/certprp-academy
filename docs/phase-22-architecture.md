# Phase 22: Queue Subscriptions And Team Coordination

Phase 22 extends the admin operations surface with queue-pattern subscriptions, escalation state, bulk watcher-preference updates, and stronger team-follow signals.

## Schema

- `operation_queue_subscriptions`
  - per-admin saved queue subscriptions for `notification_delivery` and `scheduled_job`
  - stores `filters_json`, active state, timestamps, and name
- `notification_deliveries`
  - adds `is_escalated`, `escalated_at`, `escalated_by_admin_user_id`, `escalation_reason`
- `scheduled_jobs`
  - adds the same escalation fields as deliveries
- `notifications`
  - adds in-app `operation_subscription_match`
- `operation_audit_events`
  - adds escalation and subscription lifecycle event types

## App Layer

- `src/features/operations/data/operations-service.ts`
  - queue-subscription CRUD
  - escalation toggles
  - current-view watch-preference execution
  - subscription-match notification generation
  - team-follow and escalation enrichment for delivery/job records
- `src/features/operations/actions/operations-actions.ts`
  - server actions for subscription create/update/delete
  - escalation updates
  - bulk watch-preference updates
  - current-view watch-preference execution
- `src/features/operations/lib/subscriptions.ts`
  - shared filter normalization and subscription matching logic

## UI

- operations lists now show:
  - escalation badges
  - team-follow badges
  - bulk watch-preference controls
- saved-view panel now supports:
  - subscribe current filter
  - current-view watch-preference updates
  - subscription list management
- detail pages now include:
  - escalation controls
  - matching-subscription context
  - stronger watcher/team signals
- operations overview now includes:
  - active subscription counts
  - escalated counts
  - watched-by-team counts
  - subscribed queue shortcuts

## Notes

- subscription notifications are in-app only
- outbound email delivery still ignores operator-only notification types
- subscription-match notifications are deduped with notification `dedupe_key`
