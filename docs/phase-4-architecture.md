# CertPrep Academy Phase 4 Architecture

## Scope
Phase 4 adds the timed exam simulator foundation:
- published exam modes backed by Supabase
- persisted timed attempts with answer snapshots
- autosaved answer selection, flagging, and navigation state
- manual submit and timeout submit flows
- exam results with review and domain/module breakdown
- dashboard exam metrics and recent history

## Data Model
Core exam tables:
- `exam_configs`
- `exam_attempts`
- `exam_attempt_answers`

Design notes:
- exam configs define time limit, question count, selection strategy, and scope
- Phase 4 reuses the published quiz question bank as the source pool for simulator questions
- each exam attempt stores a snapshot of question text, explanation, module context, and options
- answer snapshots keep review stable even if the source question bank changes later
- attempt status distinguishes `in_progress`, `submitted`, and `timed_out`

## Application Layers
1. Route layer:
- `/exam-simulator`
- `/exam-simulator/[examSlug]`
- `/exam-simulator/[examSlug]/attempt/[attemptId]`
- `/exam-simulator/[examSlug]/results/[attemptId]`

2. Data layer:
- `src/features/exams/data/exam-service.ts`

3. Action layer:
- `src/features/exams/actions/exam-attempt-actions.ts`

4. UI layer:
- exam mode cards
- exam history list
- timed attempt client
- results summary
- detailed review list

## Timed Attempt Flow
1. User opens an exam mode and starts a timed attempt.
2. The server selects randomized questions from the current CCNA bank.
3. The attempt and question snapshots are written to Supabase.
4. The client restores persisted state, shows the countdown, and saves answer/flag/navigation changes.
5. On manual submit or timeout, the server finalizes the attempt and stores score metrics.
6. The results page reads only the attempt snapshot tables for stable review.

## Dashboard Integration
Dashboard now includes:
- exams taken
- latest exam score
- best exam score
- average exam score
- last attempt date
- recent exam history

## SQL Assets
- Migration: `supabase/migrations/20260308_phase4_exam_simulator_foundation.sql`
- Seed: `supabase/seeds/20260308_ccna_exam_configs.sql`

Apply in Supabase SQL Editor after Phase 2 and Phase 3 SQL:
1. Run the Phase 4 migration SQL.
2. Run the Phase 4 seed SQL.
3. Confirm exam configs exist.
4. Start a simulator attempt while signed in.
