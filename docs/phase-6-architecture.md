# CertPrep Academy Phase 6 Architecture

## Scope
Phase 6 adds the guided CLI Practice Terminal foundation:
- CLI challenge schema and starter CCNA challenge data in Supabase
- authenticated CLI routes and attempt persistence
- terminal-style guided practice with step validation, hints, and retry flow
- related CLI surfaces in the course and lesson flow
- dashboard CLI metrics and latest activity

## Data Model
Core CLI tables:
- `cli_challenges`
- `cli_steps`
- `cli_attempts`
- `cli_attempt_step_results`

Design notes:
- CLI challenges belong to a module and can optionally point to a lesson
- steps are modeled separately so challenges can grow in depth later
- command validation currently supports `exact`, `normalized`, and `pattern`
- attempts persist the learner's current step and completion state
- step result rows retain every submitted command so retry flow and review remain stable

## Application Layers
1. Route layer:
- `/cli-practice`
- `/cli-practice/[challengeSlug]`

2. Data layer:
- `src/features/cli/data/cli-service.ts`

3. Action layer:
- `src/features/cli/actions/cli-practice-actions.ts`

4. UI layer:
- challenge cards
- related CLI panel for lesson and module flow
- terminal-style guided practice panel
- step history and feedback states

## Validation Model
- `exact`: command must match the stored syntax exactly
- `normalized`: whitespace and capitalization differences are ignored
- `pattern`: regex-style validation for accepted command variants

The terminal experience is intentionally guided. It validates command syntax against predefined training expectations and does not attempt to emulate a full Cisco IOS shell.

## Dashboard Integration
Dashboard now includes:
- total CLI challenges available
- CLI challenges started
- CLI challenges completed
- latest CLI activity

## SQL Assets
- Migration: `supabase/migrations/20260308_phase6_cli_practice_foundation.sql`
- Seed: `supabase/seeds/20260308_ccna_cli_challenges_seed.sql`

Apply in Supabase SQL Editor after Phase 2 through Phase 5 SQL:
1. Run the Phase 6 migration SQL.
2. Run the Phase 6 seed SQL.
3. Confirm `cli_challenges`, `cli_steps`, `cli_attempts`, and `cli_attempt_step_results` exist.
4. Confirm starter CLI challenges are present for all six CCNA modules.
