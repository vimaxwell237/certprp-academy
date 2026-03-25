# Phase 26 Architecture

Phase 26 extends the existing queue-operations automation layer with execution-health drill-down, recent skip and failure trend summaries, snooze presets, and safer manual rerun guidance.

## Scope

- No new Supabase migration was required for Phase 26.
- The phase reuses Phase 25 automation metadata:
  - mute and snooze state
  - consecutive skip and failure counts
  - last success and failure timestamps
  - skip and failure reasons on rule and digest run history

## Application layer

- `src/features/operations/lib/health.ts`
  - centralized health classification
  - recent skip and failure reason aggregation
  - snooze preset timestamp generation
  - manual rerun guidance generation
- `src/features/operations/data/operations-service.ts`
  - derives rule and subscription health status
  - computes overview-level health counts and recent reason summaries
  - exposes unhealthy automation lists for the admin overview
- `src/features/operations/actions/operations-actions.ts`
  - resolves snooze presets into concrete timestamps before control updates
- `src/features/operations/components/operations-saved-views-panel.tsx`
  - adds health drill-down cards, reason summaries, rerun guidance, and snooze preset controls
- `src/features/operations/components/operations-watchers-panel.tsx`
  - surfaces subscription health on matching subscriptions in incident detail
- `src/app/admin/operations/page.tsx`
  - adds healthy, warning, and unhealthy automation summary cards
  - adds top skip and failure reason summaries
  - adds unhealthy automation shortcut lists

## Operational behavior

- Health state is derived, not persisted:
  - `muted`
  - `snoozed`
  - `healthy`
  - `warning`
  - `unhealthy`
- Manual rerun guidance is advisory:
  - it warns on mute and snooze state
  - it warns on repeated failures
  - it highlights repeated zero-match, cooldown, no-change, or cap-related patterns
- Snooze presets support fast operator actions:
  - 1 hour
  - 6 hours
  - 24 hours
  - 3 days
