# Phase 27 Architecture

Phase 27 adds dedicated operator-facing execution-health drill-down for individual escalation rules and queue subscriptions.

## Schema

- No new Supabase migration was required for Phase 27.
- The phase reuses existing automation metadata and run-history tables:
  - `operation_escalation_rules`
  - `operation_queue_subscriptions`
  - `operation_escalation_rule_runs`
  - `operation_subscription_digest_runs`

## Application layer

- `src/features/operations/lib/health.ts`
  - trend-window summaries for:
    - last 24 hours
    - last 7 days
    - last 30 runs
  - category-specific rerun guidance based on repeated cooldown, zero-match, no-change, failure, and cap patterns
- `src/features/operations/data/operations-service.ts`
  - `fetchOperationEscalationRuleDetail`
  - `fetchOperationQueueSubscriptionDetail`
  - recent run loading and trend-window aggregation
- `src/features/operations/components/operations-automation-drilldown.tsx`
  - shared drill-down UI for rules and subscriptions
  - health summary cards
  - trend windows
  - recent run activity
  - rerun guidance
- `src/app/admin/operations/rules/[ruleId]/page.tsx`
  - dedicated escalation-rule drill-down route
- `src/app/admin/operations/subscriptions/[subscriptionId]/page.tsx`
  - dedicated queue-subscription drill-down route

## UX outcomes

- Operators can drill into one rule or subscription from overview and queue panels.
- Each drill-down shows:
  - current health and automation state
  - mute and snooze state
  - recent run history
  - recent skip and failure trends
  - concise rerun guidance
- `/admin/operations` now links directly into the most problematic rule and subscription drill-down views.
