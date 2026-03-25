# Phase 9 Architecture

Phase 9 adds the remediation, recommendation, and study-planning foundation for CertPrep Academy.

## Scope

- Persistent learner recommendations in Supabase
- One active study plan per learner with ordered plan items
- Deterministic recommendation rules driven by:
  - lesson completion
  - quiz history
  - exam-domain breakdowns
  - unfinished labs
  - unfinished CLI challenges
  - repeated support usage
- New `/recommendations` and `/study-plan` routes
- Dashboard weak-area, top-recommendation, and study-plan widgets
- Premium gating for structured study plans, while basic recommendations remain available on Free

## Feature layer

Guidance logic is centralized under `src/features/guidance`:

- `data/guidance-service.ts`
  Reads learner history, generates deterministic recommendations, persists recommendations and study plans, and exposes dashboard guidance snapshots.
- `actions/guidance-actions.ts`
  Handles recommendation generation, recommendation dismissal, study-plan generation, and plan-item completion.
- `components/*`
  Recommendation cards, severity badges, and study-plan UI.

## Recommendation rules

The first-pass rule engine is intentionally deterministic:

- weak quiz averages by module
- weak exam domains from stored exam-answer snapshots
- started but unfinished labs
- started but unfinished CLI challenges
- repeated support activity in the same topic
- low/no activity fallback
- concrete next lesson action

## Billing integration

- Recommendations are available on Free
- Study-plan generation/view is Premium or Tutor Plan
- Tutor-escalation recommendations only point into tutor support when the learner already has valid tutor-support access

## Supabase

Phase 9 SQL file:

- `supabase/migrations/20260309_phase9_guidance_foundation.sql`

Tables:

- `study_plans`
- `study_plan_items`
- `learner_recommendations`
