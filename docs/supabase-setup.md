# Supabase Setup

This project now includes a current all-in-one SQL setup file plus incremental migrations for newer phases.

## Recommended file

Run [20260308_certprep_full_setup.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/setup/20260308_certprep_full_setup.sql).

## Production email setup

For account confirmations, password reset emails, and app notification delivery, use the dedicated guide:

- [email-setup.md](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/docs/email-setup.md)

That guide separates:

- inbound mailbox hosting for `info@certprep.it.com`
- Supabase Auth custom SMTP for sign-up confirmations
- app-side notification delivery configuration and scheduler setup

That file applies, in order:

1. Phase 2 learning schema
2. Phase 2 CCNA course seed data
3. Phase 3 quiz schema
4. Phase 3 CCNA quiz seed data
5. Phase 4 exam simulator schema
6. Phase 4 CCNA exam config seed data
7. Phase 5 labs schema and storage preparation
8. Phase 5 CCNA lab seed data
9. Phase 6 CLI practice schema
10. Phase 6 CCNA CLI challenge seed data
11. Phase 7 tutor support schema
12. Phase 7 tutor profile seed data
13. Phase 8 billing schema
14. Phase 8 billing plan seed data
15. Phase 9 guidance schema
16. Phase 10 admin authorization and content operations schema
17. Phase 11 tutor scheduling and session management schema
18. Phase 12 notifications and tutor follow-up schema
19. Phase 13 outbound delivery and reminder-job schema
20. Phase 14 automation, retry, and notification preference schema
21. Phase 15 queue operations schema refinement
22. Phase 16 queue incident management schema
23. Phase 17 bulk triage and ownership schema
24. Phase 18 operator coordination schema
25. Phase 19 workflow ergonomics schema
26. Phase 20 watch-state execution schema
27. Phase 21 watcher preferences schema
28. Phase 22 queue subscriptions and escalation state schema
29. Phase 23 team coordination and escalation-rule schema
30. Phase 24 automated rule and subscription-digest schema
31. Phase 25 automation control and execution-health schema
32. Phase 26 execution-health drill-down app layer
33. Phase 27 dedicated automation drill-down routes
34. Phase 28 automation acknowledgement schema
35. Phase 29 acknowledgement assignment and reminder schema
36. Phase 30 acknowledgement lifecycle-depth schema

## How to apply it in Supabase

1. Open your Supabase project dashboard.
2. Go to `SQL Editor`.
3. Click `New query`.
4. Open [20260308_certprep_full_setup.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/setup/20260308_certprep_full_setup.sql) in this repo.
5. Copy the full contents of that file.
6. Paste it into the Supabase query editor.
7. Click `Run`.

## What should exist after it runs

Tables:

- `user_roles`
- `certifications`
- `courses`
- `modules`
- `lessons`
- `user_progress`
- `quizzes`
- `quiz_questions`
- `question_options`
- `quiz_attempts`
- `quiz_attempt_answers`
- `exam_configs`
- `exam_attempts`
- `exam_attempt_answers`
- `labs`
- `lab_files`
- `lab_progress`
- `cli_challenges`
- `cli_steps`
- `cli_attempts`
- `cli_attempt_step_results`
- `tutor_profiles`
- `support_requests`
- `support_messages`
- `tutor_availability_slots`
- `tutor_sessions`
- `notifications`
- `tutor_session_followups`
- `notification_deliveries`
- `scheduled_jobs`
- `notification_preferences`
- `operation_notes`
- `operation_audit_events`
- `operation_assignment_history`
- `operation_saved_views`
- `operation_comments`
- `operation_watchers`
- `operation_queue_subscriptions`
- `operation_escalation_rules`
- `operation_escalation_rule_runs`
- `operation_subscription_digest_runs`
- `operation_automation_acknowledgements`
- `plans`
- `user_subscriptions`
- `payment_events`
- `study_plans`
- `study_plan_items`
- `learner_recommendations`

Starter content:

- certification: `CCNA`
- course: `CCNA 200-301 Preparation`
- six CCNA modules
- starter lessons for each module
- one starter quiz per module
- three starter exam simulator modes
- one starter lab per CCNA module
- one starter CLI challenge per CCNA module
- starter tutor profiles from existing auth users
- billing plans: `Free`, `Premium`, `Tutor Plan`

## Phase 10 admin bootstrap

After Phase 10 SQL is in place, promote at least one auth user to admin:

```sql
update public.user_roles
set role = 'admin'
where user_id = 'YOUR_AUTH_USER_UUID';
```

The Phase 10 migration is also available directly at [20260310_phase10_admin_content_ops.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260310_phase10_admin_content_ops.sql).
If you just need to promote the first admin, use [20260310_admin_role_template.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/seeds/20260310_admin_role_template.sql).

## Phase 11 scheduling bootstrap

If Phases 2 through 10 are already in place, you can run just the Phase 11 migration:

- [20260310_phase11_tutor_scheduling_foundation.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260310_phase11_tutor_scheduling_foundation.sql)

After it runs:

1. Make sure at least one active tutor profile exists.
2. Sign in with that tutor account and publish availability at `/tutor/schedule`.
3. Sign in as a learner with Tutor Plan access and verify booking at `/book-session`.

## Phase 12 notifications bootstrap

If Phases 2 through 11 are already in place, you can run just the Phase 12 migration:

- [20260310_phase12_notifications_followups.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260310_phase12_notifications_followups.sql)

After it runs:

1. Book or update a tutor session to generate in-app scheduling notifications.
2. Open `/notifications` while signed in to verify unread alerts.
3. Mark a completed tutor session complete, then save a follow-up from `/tutor/sessions`.
4. Verify the learner sees that follow-up on `/sessions`.

## Phase 13 outbound delivery bootstrap

If Phases 2 through 12 are already in place, you can run just the Phase 13 migration:

- [20260310_phase13_outbound_delivery_foundation.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260310_phase13_outbound_delivery_foundation.sql)

Optional email-delivery environment variables:

- `RESEND_API_KEY`
- `NOTIFICATION_FROM_EMAIL` or `EMAIL_FROM_ADDRESS`
- `APP_BASE_URL` or `NEXT_PUBLIC_APP_URL`

After it runs:

1. Confirm `notification_deliveries` and `scheduled_jobs` exist in Supabase.
2. Confirm a tutor session so reminder jobs are scheduled for the learner and tutor.
3. Open any authenticated page to let the app process due jobs and pending deliveries.
4. Verify `/notifications`, `/sessions`, `/tutor/sessions`, and `/dashboard` show delivery and reminder state.

## Phase 14 automation and preferences bootstrap

If Phases 2 through 13 are already in place, you can run just the Phase 14 migration:

- [20260310_phase14_automation_preferences.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260310_phase14_automation_preferences.sql)

Required environment variables for scheduled automation:

- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTOMATION_SECRET`

Optional email environment variables remain:

- `RESEND_API_KEY`
- `NOTIFICATION_FROM_EMAIL` or `EMAIL_FROM_ADDRESS`
- `APP_BASE_URL` or `NEXT_PUBLIC_APP_URL`

Suggested scheduler targets after deployment:

1. `POST /api/internal/process-scheduled-jobs`
2. `POST /api/internal/process-notification-deliveries`

Use either the `Authorization: Bearer <AUTOMATION_SECRET>` header or
`x-automation-secret: <AUTOMATION_SECRET>`.

After it runs:

1. Confirm `notification_preferences` exists.
2. Confirm users have seeded preference rows for both `in_app` and `email`.
3. Open `/settings/notifications` and change at least one email preference.
4. Trigger a session notification and verify disabled email preferences suppress outbound sends.
5. Call the internal automation endpoints with the secret and verify pending jobs/deliveries are processed.

## Phase 15 queue operations bootstrap

If Phases 2 through 14 are already in place, you can run just the Phase 15 migration:

- [20260310_phase15_queue_operations.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260310_phase15_queue_operations.sql)

Phase 15 does not add a new table. It expands delivery status support so operators can mark rows `ignored` from the admin operations UI.

After it runs:

1. Open `/admin/operations`.
2. Review `/admin/operations/deliveries` and `/admin/operations/jobs`.
3. Confirm failed rows can be replayed or resent.
4. Confirm pending jobs can be canceled.
5. Use [scheduler-automation.md](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/docs/scheduler-automation.md) to wire the cron endpoints on your hosting platform.

## Phase 16 queue incident-management bootstrap

If Phases 2 through 15 are already in place, you can run just the Phase 16 migration:

- [20260310_phase16_queue_incident_management.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260310_phase16_queue_incident_management.sql)

After it runs:

1. Confirm `operation_notes` and `operation_audit_events` exist.
2. Open `/admin/operations`.
3. Retry, replay, cancel, or ignore a queue row and confirm an audit entry appears on the detail page.
4. Add an internal note on a delivery or job detail page and confirm it appears in the notes panel.

## Phase 17 bulk triage and ownership bootstrap

If Phases 2 through 16 are already in place, you can run just the Phase 17 migration:

- [20260310_phase17_bulk_triage_ownership.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260310_phase17_bulk_triage_ownership.sql)

After it runs:

1. Confirm `notification_deliveries` and `scheduled_jobs` now include `assigned_admin_user_id`, `assigned_at`, and `handoff_note`.
2. Open `/admin/operations/deliveries` and `/admin/operations/jobs`.
3. Claim at least one item, then reassign it with a handoff note from the detail page.
4. Select multiple failed items and run a bulk action.
5. Confirm the detail audit trail shows ownership changes and bulk-origin action metadata.

## Phase 18 operator coordination bootstrap

If Phases 2 through 17 are already in place, you can run just the Phase 18 migration:

- [20260311_phase18_operator_coordination.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260311_phase18_operator_coordination.sql)

After it runs:

1. Confirm queue rows include `workflow_state`.
2. Claim, release, and reassign a delivery or job.
3. Verify assignment history appears on the detail page.
4. Filter by `My Queue`, `Unassigned`, and workflow state on the operations lists.

## Phase 19 workflow ergonomics bootstrap

If Phases 2 through 18 are already in place, you can run just the Phase 19 migration:

- [20260311_phase19_workflow_ergonomics.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260311_phase19_workflow_ergonomics.sql)

After it runs:

1. Save a delivery or job view from the operations list.
2. Set one saved view as default and verify it auto-loads.
3. Add an internal operator comment and test an `@mention`.

## Phase 20 watch-state execution bootstrap

If Phases 2 through 19 are already in place, you can run just the Phase 20 migration:

- [20260311_phase20_watch_state_execution.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260311_phase20_watch_state_execution.sql)

After it runs:

1. Watch at least one delivery and one job.
2. Verify watch state appears on the detail pages.
3. Use a saved view to run a view-wide watch or retry/replay action.

## Phase 21 watcher preferences bootstrap

If Phases 2 through 20 are already in place, you can run just the Phase 21 migration:

- [20260312_phase21_watcher_preferences.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260312_phase21_watcher_preferences.sql)

After it runs:

1. Update watch preferences from an incident detail page.
2. Mute a watch and confirm watcher notifications stop for preference-controlled events.
3. Use current-view watch preference updates from an operations list.

## Phase 22 queue subscriptions bootstrap

If Phases 2 through 21 are already in place, you can run just the Phase 22 migration:

- [20260312_phase22_queue_subscriptions.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260312_phase22_queue_subscriptions.sql)

After it runs:

1. Create a queue subscription from the operations list.
2. Confirm escalation state appears on deliveries and jobs.
3. Verify subscribed queues and escalated counts appear on `/admin/operations`.

## Phase 23 team coordination and escalation rules bootstrap

If Phases 2 through 22 are already in place, you can run just the Phase 23 migration:

- [20260312_phase23_team_coordination_rules.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260312_phase23_team_coordination_rules.sql)

After it runs:

1. Confirm `operation_escalation_rules` exists.
2. Open `/admin/operations/deliveries` or `/admin/operations/jobs`.
3. Create an escalation rule from the current queue filters.
4. Select multiple subscriptions and test bulk activate, pause, duplicate, or delete.
5. Apply a rule and confirm matching incidents are escalated without duplicating escalation state.

## Phase 24 automated rules and digests bootstrap

If Phases 2 through 23 are already in place, you can run just the Phase 24 migration:

- [20260312_phase24_automated_rules_digests.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260312_phase24_automated_rules_digests.sql)

After it runs:

1. Confirm `operation_escalation_rule_runs` and `operation_subscription_digest_runs` exist.
2. Configure at least one escalation rule with `run_mode = automated`.
3. Set a digest cooldown on at least one queue subscription.
4. Call `POST /api/internal/process-escalation-rules`.
5. Call `POST /api/internal/process-subscription-digests`.
6. Verify `/admin/operations`, `/admin/operations/deliveries`, and `/admin/operations/jobs` show recent runs and cooldown state.

## Phase 25 automation control and health bootstrap

If Phases 2 through 24 are already in place, you can run just the Phase 25 migration:

- [20260312_phase25_automation_health_controls.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260312_phase25_automation_health_controls.sql)

After it runs:

1. Confirm `operation_escalation_rules` and `operation_queue_subscriptions` now include mute, snooze, and execution-health fields.
2. Confirm `operation_escalation_rule_runs` and `operation_subscription_digest_runs` now include `run_status`, `skip_reason`, `failure_reason`, and `duration_ms`.
3. Open `/admin/operations/deliveries` or `/admin/operations/jobs`.
4. Mute one automation item and snooze another from the rule/subscription panel.
5. Call `POST /api/internal/process-escalation-rules` and `POST /api/internal/process-subscription-digests`.
6. Verify muted or snoozed items are skipped cleanly and that `/admin/operations` shows updated health counts.

## Phase 26 execution-health drill-down bootstrap

Phase 26 does not add a new migration. It builds on the Phase 25 schema and adds:

- health classification drill-down
- skip and failure trend summaries
- rerun guidance
- snooze presets

After deploying the app changes:

1. Open `/admin/operations`.
2. Confirm healthy, warning, and unhealthy automation counts render.
3. Open an unhealthy rule or subscription from the overview.
4. Verify trend windows, reason summaries, and rerun guidance render.

## Phase 27 automation drill-down routes bootstrap

Phase 27 does not add a new migration. It adds dedicated automation drill-down routes:

- `/admin/operations/rules/[ruleId]`
- `/admin/operations/subscriptions/[subscriptionId]`

After deploying the app changes:

1. Open `/admin/operations`.
2. Navigate to an unhealthy rule or subscription drill-down page.
3. Confirm recent history, health state, and trend windows render.

## Phase 28 automation acknowledgement bootstrap

If Phases 2 through 27 are already in place, you can run just the Phase 28 migration:

- [20260313_phase28_automation_acknowledgements.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260313_phase28_automation_acknowledgements.sql)

After it runs:

1. Confirm `operation_automation_acknowledgements` exists.
2. Open an unhealthy rule or subscription drill-down page.
3. Update the acknowledgement state to `acknowledged`, `investigating`, `fixed_pending_rerun`, or `resolved`.
4. Confirm the acknowledgement history appears on the detail page.
5. Confirm the audit trail records the acknowledgement workflow change.

## Phase 29 acknowledgement follow-up bootstrap

If Phases 2 through 28 are already in place, you can run just the Phase 29 migration:

- [20260313_phase29_acknowledgement_followup.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260313_phase29_acknowledgement_followup.sql)

After it runs:

1. Confirm `operation_automation_acknowledgements` now includes assignment, reminder, rerun, and verification fields.
2. Open an unhealthy rule or subscription drill-down page.
3. Assign an admin, set a reminder time, and save the acknowledgement state.
4. Trigger a manual rerun and confirm the latest rerun outcome plus verification guidance appear.
5. Call `POST /api/internal/process-automation-acknowledgement-reminders` with the automation secret and confirm due reminder notifications appear in-app.

## Phase 30 acknowledgement lifecycle-depth bootstrap

If Phases 2 through 29 are already in place, you can run just the Phase 30 migration:

- [20260313_phase30_acknowledgement_lifecycle_depth.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260313_phase30_acknowledgement_lifecycle_depth.sql)

After it runs:

1. Confirm `operation_automation_acknowledgements` now includes reminder dismissal, reminder snooze, and verification completion fields.
2. Open an unhealthy rule or subscription drill-down page.
3. Dismiss one reminder, snooze another, and reschedule a third reminder.
4. Trigger a manual rerun, then mark verification complete or failed from the drill-down page.
5. Call `POST /api/internal/process-automation-acknowledgement-reminders` and confirm overdue or verification-needed reminders appear in-app when appropriate.

## Verification

After the SQL finishes:

1. Open `Table Editor` in Supabase.
2. Confirm the tables above exist.
3. Confirm `courses` contains `CCNA 200-301 Preparation`.
4. Confirm `quizzes` contains module quiz rows.
5. Restart the app if it was already running.
6. Check these routes while signed in:
   - `/admin`
   - `/admin/operations`
   - `/admin/operations/deliveries`
   - `/admin/operations/jobs`
   - `/admin/operations/deliveries/[deliveryId]`
   - `/admin/operations/jobs/[jobId]`
   - `/admin/certifications`
   - `/admin/courses`
   - `/admin/modules`
   - `/admin/lessons`
   - `/admin/quizzes`
   - `/admin/labs`
   - `/admin/cli-challenges`
   - `/admin/tutors`
   - `/admin/plans`
   - `/dashboard`
   - `/courses`
   - `/labs`
   - `/quizzes`
   - `/exam-simulator`
   - `/cli-practice`
   - `/support`
   - `/tutors`
   - `/book-session`
   - `/sessions`
   - `/notifications`
   - `/settings/notifications`
   - `/tutor/schedule`
   - `/tutor/sessions`
   - `/pricing`
   - `/billing`
   - `/recommendations`
   - `/study-plan`

## If the SQL fails

Send the exact SQL error message. The setup file is built from these source files:

- [20260308_phase2_learning_foundation.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260308_phase2_learning_foundation.sql)
- [20260308_ccna_starter_content.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/seeds/20260308_ccna_starter_content.sql)
- [20260308_phase3_quiz_foundation.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260308_phase3_quiz_foundation.sql)
- [20260308_ccna_quiz_seed.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/seeds/20260308_ccna_quiz_seed.sql)
- [20260308_phase4_exam_simulator_foundation.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260308_phase4_exam_simulator_foundation.sql)
- [20260308_ccna_exam_configs.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/seeds/20260308_ccna_exam_configs.sql)
- [20260308_phase5_labs_foundation.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260308_phase5_labs_foundation.sql)
- [20260308_ccna_labs_seed.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/seeds/20260308_ccna_labs_seed.sql)
- [20260308_phase6_cli_practice_foundation.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260308_phase6_cli_practice_foundation.sql)
- [20260308_ccna_cli_challenges_seed.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/seeds/20260308_ccna_cli_challenges_seed.sql)
- [20260308_phase7_tutor_support_foundation.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260308_phase7_tutor_support_foundation.sql)
- [20260308_tutor_profiles_seed.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/seeds/20260308_tutor_profiles_seed.sql)
- [20260309_phase8_billing_foundation.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260309_phase8_billing_foundation.sql)
- [20260309_billing_plans_seed.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/seeds/20260309_billing_plans_seed.sql)
- [20260309_phase9_guidance_foundation.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260309_phase9_guidance_foundation.sql)
- [20260310_phase10_admin_content_ops.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260310_phase10_admin_content_ops.sql)
- [20260310_phase11_tutor_scheduling_foundation.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260310_phase11_tutor_scheduling_foundation.sql)
- [20260310_phase12_notifications_followups.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260310_phase12_notifications_followups.sql)
- [20260310_phase13_outbound_delivery_foundation.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260310_phase13_outbound_delivery_foundation.sql)
- [20260310_phase14_automation_preferences.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260310_phase14_automation_preferences.sql)
- [20260310_phase15_queue_operations.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260310_phase15_queue_operations.sql)
- [20260310_phase16_queue_incident_management.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260310_phase16_queue_incident_management.sql)
- [20260310_phase17_bulk_triage_ownership.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260310_phase17_bulk_triage_ownership.sql)
- [20260311_phase18_operator_coordination.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260311_phase18_operator_coordination.sql)
- [20260311_phase19_workflow_ergonomics.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260311_phase19_workflow_ergonomics.sql)
- [20260311_phase20_watch_state_execution.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260311_phase20_watch_state_execution.sql)
- [20260312_phase21_watcher_preferences.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260312_phase21_watcher_preferences.sql)
- [20260312_phase22_queue_subscriptions.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260312_phase22_queue_subscriptions.sql)
- [20260312_phase23_team_coordination_rules.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260312_phase23_team_coordination_rules.sql)
- [20260312_phase24_automated_rules_digests.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260312_phase24_automated_rules_digests.sql)
- [20260312_phase25_automation_health_controls.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260312_phase25_automation_health_controls.sql)
- [20260313_phase28_automation_acknowledgements.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260313_phase28_automation_acknowledgements.sql)
- [20260313_phase29_acknowledgement_followup.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260313_phase29_acknowledgement_followup.sql)
- [20260313_phase30_acknowledgement_lifecycle_depth.sql](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/supabase/migrations/20260313_phase30_acknowledgement_lifecycle_depth.sql)
