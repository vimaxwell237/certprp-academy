# Phase 14 Architecture

Phase 14 upgrades the outbound notification foundation with scheduler-safe automation, retry/backoff handling, and user notification preferences.

## Scope

- notification preferences persisted in Supabase
- retry metadata for reminder jobs and email deliveries
- claim-based automation processors that are safe for concurrent cron runs
- secure internal endpoints for scheduled job execution
- user-facing notification settings at `/settings/notifications`
- preference-aware email delivery and stronger tutor operational visibility

## Data model

Phase 14 introduces:

- `notification_preferences`
  - one row per user, channel, and notification type
  - stores whether the event is enabled for that channel

Phase 14 extends:

- `notification_deliveries`
  - `retry_count`
  - `max_retries`
  - `last_attempted_at`
  - `next_attempt_at`
  - `processing_token`
  - `processing_started_at`
- `scheduled_jobs`
  - `retry_count`
  - `max_retries`
  - `last_attempted_at`
  - `processing_token`
  - `processing_started_at`

## Integrity model

The database now enforces and supports:

- default preference rows for new and existing users
- per-user email preference checks before delivery rows are created
- scheduler-friendly job claiming through `claim_due_scheduled_jobs`
- scheduler-friendly delivery claiming through `claim_due_notification_deliveries`
- stale claim recovery via `processing_started_at`
- retry-safe processing without relying on public endpoints or page visits

In-app notifications remain modeled in preferences, but the current product behavior keeps them effectively always on in the UI while email is user-configurable.

## App feature layers

Phase 14 extends `src/features/delivery`:

- `data/delivery-service.ts`
  - claim/process scheduled jobs
  - claim/process pending deliveries
  - retry/backoff transitions
  - current-user fallback processing
  - service-role automation entry points
- `data/preferences-service.ts`
  - fetch and update notification preferences
- `actions/preferences-actions.ts`
  - save email-notification settings
- `lib/retry.ts`
  - retry delay planning
- `lib/automation-auth.ts`
  - internal endpoint secret verification
- `lib/preferences.ts`
  - shared notification preference definitions

## Automation model

Phase 14 no longer depends only on user page visits.

Secure internal routes are now available for cron or scheduler integration:

- `/api/internal/process-scheduled-jobs`
- `/api/internal/process-notification-deliveries`

They require `AUTOMATION_SECRET` and expect either:

- `Authorization: Bearer <secret>`
- or `x-automation-secret: <secret>`

Global automation processing uses the Supabase service-role key so it can claim and process queue rows across all users.

Required environment variables for production automation:

- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTOMATION_SECRET`

Optional delivery variables:

- `RESEND_API_KEY`
- `NOTIFICATION_FROM_EMAIL` or `EMAIL_FROM_ADDRESS`
- `APP_BASE_URL` or `NEXT_PUBLIC_APP_URL`

## Retry model

Retry backoff is intentionally simple and deterministic:

- retry 1: 5 minutes
- retry 2: 15 minutes
- retry 3: 60 minutes

After `max_retries` is exhausted, the row is marked permanently failed with the final error message preserved.

Permanent non-retryable cases include:

- email disabled by user preference
- missing linked notification data
- missing recipient email

Cancelable reminder cases include:

- canceled sessions
- completed sessions
- sessions that are no longer confirmed

## UI model

Phase 14 adds:

- `/settings/notifications`
- email toggles for each supported session event
- notification cards with retry/failure details
- reminder cards with retry indicators
- dashboard visibility for failed deliveries alongside pending reminder/delivery counts

## Phase 15 recommendation

Phase 15 should deepen operational reliability rather than expand channels:

- scheduler deployment recipes for Vercel or equivalent hosting
- admin-level queue health visibility
- delivery replay tools for failed notifications
- preference presets by learner/tutor role if product complexity increases
