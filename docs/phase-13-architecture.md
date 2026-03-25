# Phase 13 Architecture

Phase 13 adds outbound email delivery and reminder-job plumbing for tutor session lifecycle notifications.

## Scope

- outbound notification delivery records in Supabase
- scheduled reminder jobs for confirmed tutor sessions
- provider-agnostic email sending layer with a safe dev fallback
- branded session email templates for booking, confirmation, cancellation, reminders, completion, and follow-up events
- delivery and reminder visibility inside notifications, learner/tutor session views, and the dashboard
- tutor workload helpers for today, pending confirmations, follow-up backlog, and overdue follow-ups

## Data model

Phase 13 introduces:

- `notification_deliveries`
  - one outbound delivery attempt per notification and channel
  - tracks template key, status, provider message id, error state, and send timestamp
- `scheduled_jobs`
  - recipient-scoped reminder jobs
  - tracks job type, related entity, scheduled execution time, payload, dedupe key, and processing outcome

The phase also extends `notifications` with:

- `related_entity_type`
- `related_entity_id`

Those fields let delivery processing rebuild rich session context without scraping notification text.

## Integrity model

The database now enforces:

- one delivery row per notification/channel/template combination
- deduped reminder jobs through `dedupe_key`
- reminder scheduling only for valid future confirmed sessions
- automatic cancelation of pending reminder jobs when sessions are no longer eligible
- recipient-scoped RLS for delivery and reminder records

Database triggers now handle:

- enqueueing email deliveries whenever a notification row is inserted
- scheduling or canceling reminder jobs whenever tutor session state changes

## App feature layers

Outbound delivery lives under `src/features/delivery`:

- `data/delivery-service.ts`
  - due reminder processing
  - pending email delivery processing
  - session reminder state lookup
  - dashboard delivery snapshot
- `lib/provider.ts`
  - email provider abstraction
  - Resend adapter when `RESEND_API_KEY` is present
  - dev/log adapter fallback when no provider is configured
- `lib/email-templates.ts`
  - branded session email template builders
- `lib/reminder-planning.ts`
  - pure reminder-window planning helpers

The existing notifications and scheduling services consume this layer rather than duplicating reminder or delivery logic.

## Execution model

There is no background worker yet. Phase 13 uses an app-driven execution path:

1. Session and follow-up triggers create notifications, deliveries, and reminder jobs in Supabase.
2. Authenticated page loads call the delivery pipeline for the current user.
3. Due reminder jobs create in-app reminder notifications.
4. Pending email deliveries are rendered into templates and sent through the configured provider.

This keeps the system ready for a later cron or job-runner upgrade without requiring a service-role worker today.

## UI model

Phase 13 adds:

- email delivery badges inside `/notifications`
- reminder state indicators inside learner and tutor session cards
- queued reminder and latest delivery visibility on the learner dashboard
- tutor workload panels for pending requests, today’s sessions, follow-up backlog, and overdue follow-ups

## Environment

Optional environment variables for real outbound email:

- `RESEND_API_KEY`
- `NOTIFICATION_FROM_EMAIL` or `EMAIL_FROM_ADDRESS`
- `APP_BASE_URL` or `NEXT_PUBLIC_APP_URL`

Without a provider key, delivery falls back to a dev logger that marks sends as successful without leaving the app.

## Phase 14 recommendation

Phase 14 should move from app-driven delivery execution to scheduled automation:

- cron-driven reminder processing
- email retry and failure backoff
- tutor and learner reminder preferences
- richer operational visibility for delivery failures
