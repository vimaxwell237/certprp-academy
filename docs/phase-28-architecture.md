# Phase 28 Architecture

Phase 28 adds operator acknowledgement state and deterministic remediation playbooks for unhealthy automation across escalation rules and queue subscriptions.

## Schema

The Supabase migration is:

- [20260313_phase28_automation_acknowledgements.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260313_phase28_automation_acknowledgements.sql)

It adds:

- `operation_automation_acknowledgements`
- admin-only RLS for acknowledgement history
- expanded audit constraints so acknowledgement workflow updates are traceable on automation entities

## App Layer

The implementation stays inside the operations feature:

- data and workflow state: [operations-service.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/data/operations-service.ts)
- server actions: [operations-actions.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/actions/operations-actions.ts)
- remediation helpers: [playbooks.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/lib/playbooks.ts)
- acknowledgement transitions: [validation.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/src/features/operations/lib/validation.ts)

The new deterministic playbook layer translates recent health patterns into lightweight operator guidance, including:

- repeated cooldown skips
- repeated zero-match or no-change runs
- repeated same failure reasons
- muted or snoozed automation
- max-match caps
- stale filter patterns
- repeated automation failures

## UI

Phase 28 upgrades the automation drill-down experience rather than creating a new admin surface.

Rule and subscription drill-down pages now show:

- current acknowledgement state
- acknowledgement history
- remediation playbook cards
- rerun readiness guidance
- clearer fix-then-rerun workflow context

The main overview at `/admin/operations` now includes:

- unacknowledged unhealthy automation count
- acknowledged but unresolved count
- fixed pending rerun count
- recently resolved automation count
- direct shortcuts to unhealthy rules and subscriptions that still need acknowledgement

## Verification

Phase 28 was verified with:

- `npm run lint`
- `npm run test:unit`
- `npm run build`
- `npm run typecheck`

Unit coverage for the new logic is in:

- [operations-playbooks.test.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/tests/unit/operations-playbooks.test.ts)
- [operations-validation.test.ts](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/tests/unit/operations-validation.test.ts)
