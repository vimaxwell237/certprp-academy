# CertPrep Academy Phase 7 Architecture

## Scope
Phase 7 adds the tutor support foundation:
- tutor/support schema and starter tutor profiles in Supabase
- authenticated support routes for learner requests and tutor response threads
- contextual support entry points from lessons, quiz results, exam results, labs, and CLI practice
- dashboard support metrics for learners and lightweight tutor queue metrics

## Data Model
Core support tables:
- `tutor_profiles`
- `support_requests`
- `support_messages`

Design notes:
- tutor profiles attach tutor capability to an existing authenticated user
- support requests can link to lesson, quiz attempt, exam attempt, lab, or CLI challenge context
- initial issue descriptions and replies are both stored in `support_messages`
- tutors can claim open requests by replying or changing status
- learner and tutor access is enforced with RLS rather than route-only checks

## Application Layers
1. Route layer:
- `/support`
- `/support/new`
- `/support/[requestId]`
- `/tutors`

2. Data layer:
- `src/features/support/data/support-service.ts`

3. Action layer:
- `src/features/support/actions/support-actions.ts`

4. UI layer:
- tutor cards
- support request cards
- thread view
- request creation form
- status and priority badges
- contextual tutor-help CTA cards

## Tutor Flow
- learners create support requests and optionally assign a tutor
- active tutors can see assigned threads and unassigned open/in-progress requests
- the first tutor reply can claim an unassigned request
- tutors can update request status to `open`, `in_progress`, `resolved`, or `closed`

## Dashboard Integration
Dashboard now includes:
- open support requests
- resolved support requests
- latest support activity
- tutor queue metrics when the signed-in user has an active tutor profile

## SQL Assets
- Migration: `supabase/migrations/20260308_phase7_tutor_support_foundation.sql`
- Seed: `supabase/seeds/20260308_tutor_profiles_seed.sql`

Apply in Supabase SQL Editor after Phase 2 through Phase 6 SQL:
1. Run the Phase 7 migration SQL.
2. Run the Phase 7 seed SQL.
3. Confirm `tutor_profiles`, `support_requests`, and `support_messages` exist.
4. Confirm at least one tutor profile is seeded from existing auth users.
