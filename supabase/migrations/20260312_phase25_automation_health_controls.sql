-- Phase 25: automation control polish and execution health

alter table public.operation_escalation_rules
  add column if not exists is_muted boolean not null default false,
  add column if not exists snoozed_until timestamptz null,
  add column if not exists muted_or_snoozed_reason text null,
  add column if not exists consecutive_skip_count integer not null default 0
    check (consecutive_skip_count >= 0),
  add column if not exists consecutive_failure_count integer not null default 0
    check (consecutive_failure_count >= 0),
  add column if not exists last_success_at timestamptz null,
  add column if not exists last_failure_at timestamptz null,
  add column if not exists last_skip_reason text null;

alter table public.operation_queue_subscriptions
  add column if not exists is_muted boolean not null default false,
  add column if not exists snoozed_until timestamptz null,
  add column if not exists muted_or_snoozed_reason text null,
  add column if not exists consecutive_skip_count integer not null default 0
    check (consecutive_skip_count >= 0),
  add column if not exists consecutive_failure_count integer not null default 0
    check (consecutive_failure_count >= 0),
  add column if not exists last_success_at timestamptz null,
  add column if not exists last_failure_at timestamptz null,
  add column if not exists last_skip_reason text null;

alter table public.operation_escalation_rule_runs
  add column if not exists run_status text not null default 'success'
    check (run_status in ('success', 'skipped', 'failed')),
  add column if not exists skip_reason text null,
  add column if not exists failure_reason text null,
  add column if not exists duration_ms integer null
    check (duration_ms >= 0);

alter table public.operation_subscription_digest_runs
  add column if not exists triggered_by text not null default 'manual'
    check (triggered_by in ('manual', 'automation')),
  add column if not exists triggered_by_admin_user_id uuid null references auth.users(id) on delete set null,
  add column if not exists run_status text not null default 'success'
    check (run_status in ('success', 'skipped', 'failed')),
  add column if not exists skip_reason text null,
  add column if not exists failure_reason text null,
  add column if not exists duration_ms integer null
    check (duration_ms >= 0);

create index if not exists idx_operation_escalation_rules_is_muted
  on public.operation_escalation_rules(created_by_admin_user_id, is_muted, updated_at desc);

create index if not exists idx_operation_queue_subscriptions_is_muted
  on public.operation_queue_subscriptions(admin_user_id, is_muted, updated_at desc);

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
      'subscription_digest_generated',
      'escalation_rule_created',
      'escalation_rule_updated',
      'escalation_rule_deleted',
      'escalation_rule_toggled',
      'escalation_rule_applied',
      'escalation_rule_run_recorded',
      'automation_muted',
      'automation_unmuted',
      'automation_snoozed',
      'automation_resumed',
      'bulk_subscription_activated',
      'bulk_subscription_deactivated',
      'bulk_subscription_deleted',
      'bulk_subscription_duplicated',
      'note_added'
    )
  );
