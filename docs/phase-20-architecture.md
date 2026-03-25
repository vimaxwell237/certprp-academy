# Phase 20 Architecture

Phase 20 improves queue-operations execution and collaboration signal without turning the admin surface into a separate incident platform.

## Scope

- incident watchers for deliveries and jobs
- watcher-driven in-app notifications for ownership, workflow, and comment activity
- view-wide execution from the current filtered or saved-view slice
- safer bulk execution confirmation and result summaries
- clearer watched-incident visibility on operations overview and detail pages
- more readable append-only comment history

## Schema

Phase 20 is implemented in:

- [20260311_phase20_watch_state_execution.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260311_phase20_watch_state_execution.sql)

Key additions:

- `operation_watchers`
- `operation_watch_update` notification type
- `watch_started` and `watch_removed` audit event support
- a stricter `enqueue_notification_delivery_record()` trigger so operator-only notifications stay in-app

## App layer

Core logic remains in the operations feature:

- service layer: [operations-service.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/data/operations-service.ts)
- server actions: [operations-actions.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/actions/operations-actions.ts)
- collaboration helpers: [collaboration.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/lib/collaboration.ts)
- validation helpers: [validation.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/lib/validation.ts)

New or upgraded UI:

- watchers panel: [operations-watchers-panel.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/components/operations-watchers-panel.tsx)
- saved views panel: [operations-saved-views-panel.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/components/operations-saved-views-panel.tsx)
- comments panel: [operations-comments-panel.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/components/operations-comments-panel.tsx)
- operations overview: [page.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/page.tsx)
- deliveries list: [page.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/deliveries/page.tsx)
- jobs list: [page.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/jobs/page.tsx)
- delivery detail: [page.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/deliveries/[deliveryId]/page.tsx)
- job detail: [page.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/jobs/[jobId]/page.tsx)

## Behavior

- admins can watch or unwatch deliveries and jobs without claiming ownership
- watcher notifications are created for:
  - ownership changes
  - workflow changes
  - general comments on watched incidents
  - resolved or reopened incidents via workflow updates
- mention notifications still use the dedicated mention flow, and watched-comment notifications skip explicitly mentioned admins to avoid duplicate noise
- current filtered views can execute queue actions across the matched incident set, with confirmation and guardrails for broader slices
