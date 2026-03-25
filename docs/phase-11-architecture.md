# Phase 11 Architecture

Phase 11 adds live tutor scheduling and session management for CertPrep Academy.

## Scope

- Tutor availability publishing with overlap prevention
- Learner slot browsing and booking requests
- Tutor and learner session management pages
- Tutor-session lifecycle tracking with `requested`, `confirmed`, `completed`, and `canceled`
- Billing-aware booking access using the existing Tutor Plan gate
- Support-thread deep links into booking
- Dashboard scheduling widgets for learners and tutors

## Supabase scheduling model

Phase 11 introduces two core tables:

- `tutor_availability_slots`
  - stores future tutor-owned availability windows
  - active slots are learner-bookable
  - active slots cannot overlap for the same tutor
- `tutor_sessions`
  - stores learner bookings against tutors
  - optionally links back to an originating support request
  - tracks meeting link, notes, and lifecycle state

The migration also adds:

- `public.current_active_tutor_profile_id()`
- `public.is_tutor()`
- tutor-profile role sync triggers so active tutor profiles keep `user_roles` aligned without giving tutors admin access

## Integrity model

Scheduling integrity is enforced in both the database and the app layer:

- database constraints
  - active slot overlap is blocked with a GiST exclusion constraint
  - slot and session time ranges must be valid
  - one active booking can occupy a slot at a time
- database triggers
  - booked slots cannot be deactivated casually
  - sessions must match the selected slot times
  - invalid status transitions are rejected
  - learners can only cancel their own sessions
  - tutors can update status, notes, and meeting links but cannot reassign sessions
- app validation
  - form parsing normalizes category, status, meeting links, and UTC timestamps
  - stale or missing records return practical error messages back to the page

## App feature layer

Scheduling logic is isolated under `src/features/scheduling`:

- `data/scheduling-service.ts`
  - tutor profile resolution
  - availability listing and creation
  - learner booking
  - tutor and learner session listing
  - dashboard metrics
- `actions/scheduling-actions.ts`
  - booking
  - slot create/deactivate
  - tutor session updates
  - learner cancellation
- `lib/*`
  - booking links
  - status/category display helpers
  - validation
- `components/*`
  - booking form
  - slot cards
  - session cards
  - status badges
  - tutor availability form

Page files stay thin and call the feature layer instead of embedding raw Supabase operations.

## Route model

Learner-facing routes:

- `/book-session`
- `/sessions`

Tutor-facing routes:

- `/tutor/schedule`
- `/tutor/sessions`

Route protection is split by responsibility:

- middleware still enforces authentication at the URL boundary
- learner booking pages also enforce the existing `tutor_support_access` billing gate
- tutor pages require the `tutor` app role and an active tutor profile

## Dashboard and support integration

Phase 11 extends the existing learner dashboard with:

- upcoming session count
- past session count
- next live-help session card

For tutors, the dashboard now also surfaces:

- pending session requests
- upcoming confirmed sessions
- completed session count

Support and tutor directory surfaces now link into booking with prefilled tutor, subject, category, and support-request context where available.

## Phase 12 recommendation

Phase 12 should deepen operational quality around tutor workflows instead of widening scope again:

- automated notifications for booking lifecycle events
- richer tutor workload views and queue prioritization
- exam/scheduling recommendation handoffs
- safer session notes and follow-up tracking
