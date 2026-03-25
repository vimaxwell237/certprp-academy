# Phase 21 Architecture

Phase 21 deepens the queue-operations follow model so admins can tune watcher notifications and run follow-oriented queue actions from both selections and saved views.

## Scope

- richer watch preferences on incidents
- muted watcher support
- bulk watch and unwatch for selected incidents
- current-view watch, unwatch, assign, and release execution
- watcher-aware saved-view execution shortcuts
- watched queue summary improvements on operations overview

## Schema

Phase 21 is implemented in:

- [20260312_phase21_watcher_preferences.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260312_phase21_watcher_preferences.sql)

Key additions:

- extended `operation_watchers` with:
  - `is_muted`
  - `notify_on_comment`
  - `notify_on_owner_change`
  - `notify_on_workflow_change`
  - `notify_on_resolve`
  - `updated_at`
- update policy for admins to manage their own watch preferences
- `watch_preferences_updated` audit support

## App layer

Core logic stays in the operations feature:

- service layer: [operations-service.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/data/operations-service.ts)
- server actions: [operations-actions.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/actions/operations-actions.ts)
- watcher helpers: [watch-preferences.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/lib/watch-preferences.ts)

Updated UI:

- watcher preferences panel: [operations-watchers-panel.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/components/operations-watchers-panel.tsx)
- saved-view execution panel: [operations-saved-views-panel.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/components/operations-saved-views-panel.tsx)
- deliveries queue: [operations-deliveries-table.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/components/operations-deliveries-table.tsx)
- jobs queue: [operations-jobs-table.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/components/operations-jobs-table.tsx)
- operations overview: [page.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/page.tsx)

## Behavior

- watch and unwatch still work as the base follow primitive
- admins can mute a watch or selectively disable comment, owner-change, workflow-change, or resolve notifications
- watcher notifications now respect these preferences while direct mention notifications remain explicit
- operators can watch, unwatch, assign, or release entire filtered/saved-view slices with the existing confirmation guardrails
