# Scheduler Automation Guide

This project exposes two internal automation endpoints for delivery and reminder processing:

- `POST /api/internal/process-scheduled-jobs`
- `POST /api/internal/process-notification-deliveries`
- `POST /api/internal/process-escalation-rules`
- `POST /api/internal/process-subscription-digests`
- `POST /api/internal/process-automation-acknowledgement-reminders`

These routes are designed for cron or scheduler integration and should not be publicly callable without the shared secret.

Phases 25 through 30 add mute, snooze, skip-reason, execution-health, acknowledgement follow-up, overdue reminder, and verification-needed handling. Expect some runs to return skipped results when rules are muted, snoozed, inside cooldown, unchanged, or explicitly dismissed from follow-up.

## Required environment variables

- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTOMATION_SECRET`

Optional email variables:

- `RESEND_API_KEY`
- `NOTIFICATION_FROM_EMAIL` or `EMAIL_FROM_ADDRESS`
- `APP_BASE_URL` or `NEXT_PUBLIC_APP_URL`

## Authentication

Use either:

- `Authorization: Bearer <AUTOMATION_SECRET>`
- or `x-automation-secret: <AUTOMATION_SECRET>`

## Recommended schedule

Suggested baseline frequencies:

- `POST /api/internal/process-scheduled-jobs`
- every 5 minutes
- `POST /api/internal/process-notification-deliveries`
- every 5 minutes
- `POST /api/internal/process-escalation-rules`
- every 10-15 minutes
- `POST /api/internal/process-subscription-digests`
- every 15-30 minutes
- `POST /api/internal/process-automation-acknowledgement-reminders`
- every 15-30 minutes

If traffic grows, reduce both to every 1 minute. Keep both endpoints on the same or tighter cadence than the reminder precision you want to promise.

## Example requests

`curl` with bearer auth:

```bash
curl -X POST https://your-domain.com/api/internal/process-scheduled-jobs \
  -H "Authorization: Bearer $AUTOMATION_SECRET"
```

```bash
curl -X POST https://your-domain.com/api/internal/process-notification-deliveries \
  -H "Authorization: Bearer $AUTOMATION_SECRET"

curl -X POST https://your-domain.com/api/internal/process-escalation-rules \
  -H "Authorization: Bearer $AUTOMATION_SECRET"

curl -X POST https://your-domain.com/api/internal/process-subscription-digests \
  -H "Authorization: Bearer $AUTOMATION_SECRET"

curl -X POST https://your-domain.com/api/internal/process-automation-acknowledgement-reminders \
  -H "Authorization: Bearer $AUTOMATION_SECRET"
```

`curl` with header auth:

```bash
curl -X POST https://your-domain.com/api/internal/process-scheduled-jobs \
  -H "x-automation-secret: $AUTOMATION_SECRET"

curl -X POST https://your-domain.com/api/internal/process-escalation-rules \
  -H "x-automation-secret: $AUTOMATION_SECRET"

curl -X POST https://your-domain.com/api/internal/process-subscription-digests \
  -H "x-automation-secret: $AUTOMATION_SECRET"

curl -X POST https://your-domain.com/api/internal/process-automation-acknowledgement-reminders \
  -H "x-automation-secret: $AUTOMATION_SECRET"
```

## Scheduler payload guidance

These endpoints do not require a JSON payload for normal operation.

If your hosting scheduler insists on a body, send `{}` with:

- `Content-Type: application/json`

## Hosting notes

Vercel Cron:

- create one cron entry per endpoint
- use the production deployment hostname
- add the `Authorization` header through a wrapper endpoint or a scheduler that supports custom headers

GitHub Actions or other external scheduler:

- run a scheduled workflow
- call the two endpoints with `curl`
- inject `AUTOMATION_SECRET` through encrypted secrets

Server-side cron:

- call the production endpoints, not localhost
- keep retries at the scheduler layer conservative because the application already performs retry/backoff internally

## Operational cautions

- Do not expose `AUTOMATION_SECRET` client-side.
- Do not call the endpoints from public UI actions.
- Keep clocks accurate on the hosting platform so reminder timing stays predictable.
- Monitor failed queue rows in `/admin/operations`, `/admin/operations/deliveries`, and `/admin/operations/jobs`.
- Review muted, snoozed, skipped, and unhealthy automation in `/admin/operations` before forcing manual reruns.
- Review overdue assigned automation and verification-pending items in `/admin/operations` after acknowledgement reminder runs.
- If a delivery or job is repeatedly failing, inspect and replay it from the admin operations UI instead of hammering the endpoint manually.
- Canceled or expired tutor sessions should not be manually replayed unless the underlying scheduling data is fixed first.
