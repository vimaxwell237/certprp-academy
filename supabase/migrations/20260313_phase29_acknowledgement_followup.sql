alter table public.operation_automation_acknowledgements
  add column if not exists assigned_admin_user_id uuid null references auth.users(id) on delete set null,
  add column if not exists assigned_at timestamptz null,
  add column if not exists remind_at timestamptz null,
  add column if not exists reminder_state text not null default 'none',
  add column if not exists last_reminded_at timestamptz null,
  add column if not exists rerun_outcome text null,
  add column if not exists last_rerun_at timestamptz null,
  add column if not exists verification_state text not null default 'not_ready',
  add column if not exists verification_summary text null;

alter table public.operation_automation_acknowledgements
  drop constraint if exists operation_automation_acknowledgements_reminder_state_check;

alter table public.operation_automation_acknowledgements
  add constraint operation_automation_acknowledgements_reminder_state_check
  check (reminder_state in ('none', 'scheduled', 'sent', 'dismissed'));

alter table public.operation_automation_acknowledgements
  drop constraint if exists operation_automation_acknowledgements_rerun_outcome_check;

alter table public.operation_automation_acknowledgements
  add constraint operation_automation_acknowledgements_rerun_outcome_check
  check (rerun_outcome is null or rerun_outcome in ('success', 'skipped', 'failed'));

alter table public.operation_automation_acknowledgements
  drop constraint if exists operation_automation_acknowledgements_verification_state_check;

alter table public.operation_automation_acknowledgements
  add constraint operation_automation_acknowledgements_verification_state_check
  check (verification_state in ('not_ready', 'needs_review', 'verified'));

create index if not exists idx_operation_automation_acknowledgements_assigned_admin_created_at
  on public.operation_automation_acknowledgements(assigned_admin_user_id, created_at desc);

create index if not exists idx_operation_automation_acknowledgements_remind_at
  on public.operation_automation_acknowledgements(reminder_state, remind_at);

alter table public.operation_audit_events
  drop constraint if exists operation_audit_events_event_type_check;

alter table public.operation_audit_events
  add constraint operation_audit_events_event_type_check
  check (
    event_type in (
      'retry_requested',
      'force_retry_requested',
      'ignored',
      'canceled',
      'replay_requested',
      'claimed',
      'released',
      'reassigned',
      'bulk_claimed',
      'bulk_released',
      'bulk_reassigned',
      'status_changed',
      'workflow_state_changed',
      'comment_added',
      'watch_started',
      'watch_removed',
      'watch_preferences_updated',
      'escalated',
      'deescalated',
      'subscription_created',
      'subscription_updated',
      'subscription_deleted',
      'subscription_toggled',
      'subscription_match_notified',
      'escalation_rule_created',
      'escalation_rule_updated',
      'escalation_rule_deleted',
      'escalation_rule_toggled',
      'escalation_rule_applied',
      'escalation_rule_run_recorded',
      'subscription_digest_generated',
      'automation_muted',
      'automation_unmuted',
      'automation_snoozed',
      'automation_resumed',
      'automation_acknowledgement_updated',
      'automation_rerun_recorded',
      'bulk_subscription_activated',
      'bulk_subscription_deactivated',
      'bulk_subscription_deleted',
      'bulk_subscription_duplicated',
      'note_added'
    )
  );

alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (
    type in (
      'session_booked',
      'session_confirmed',
      'session_canceled',
      'session_reminder',
      'session_completed',
      'followup_added',
      'operator_mentioned',
      'operation_watch_update',
      'operation_subscription_match',
      'automation_acknowledgement_assignment',
      'automation_acknowledgement_reminder'
    )
  );
