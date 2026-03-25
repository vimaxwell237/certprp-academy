# Phase 19 Architecture

Phase 19 improves operator workflow ergonomics inside the existing queue-operations surface.

## Scope

- saved views for deliveries and jobs
- bulk workflow-state updates
- collaboration comments with lightweight `@mention` support
- mention notifications using the existing in-app notifications table
- overview shortcuts for default views and operator queues

## Schema

Phase 19 is implemented in:

- [20260311_phase19_workflow_ergonomics.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260311_phase19_workflow_ergonomics.sql)

Key additions:

- `operation_saved_views`
- `operation_comments`
- `operator_mentioned` notification type
- `comment_added` audit event support

## App layer

Core logic remains in the operations feature:

- service layer: [operations-service.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/data/operations-service.ts)
- server actions: [operations-actions.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/actions/operations-actions.ts)
- collaboration helpers: [collaboration.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/lib/collaboration.ts)

New UI surface:

- saved views panel: [operations-saved-views-panel.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/components/operations-saved-views-panel.tsx)
- comments panel: [operations-comments-panel.tsx](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/components/operations-comments-panel.tsx)

Updated operations pages:

- [overview](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/page.tsx)
- [deliveries](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/deliveries/page.tsx)
- [jobs](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/jobs/page.tsx)
- [delivery detail](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/deliveries/[deliveryId]/page.tsx)
- [job detail](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/app/admin/operations/jobs/[jobId]/page.tsx)

## Collaboration behavior

- saved views are per-admin and per-entity-type
- one default view is allowed per admin/entity type
- comments are append-only collaboration records, separate from notes and audit
- mentions use simple `@handle` parsing from admin labels and create in-app notifications for mentioned admins
