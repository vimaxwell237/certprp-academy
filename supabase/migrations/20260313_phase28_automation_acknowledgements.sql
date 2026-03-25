create table if not exists public.operation_automation_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('operation_escalation_rule', 'operation_queue_subscription')),
  entity_id uuid not null,
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null
    check (
      status in (
        'unacknowledged',
        'acknowledged',
        'investigating',
        'fixed_pending_rerun',
        'resolved'
      )
    ),
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_operation_automation_acknowledgements_entity_created_at
  on public.operation_automation_acknowledgements(entity_type, entity_id, created_at desc);

create index if not exists idx_operation_automation_acknowledgements_admin_created_at
  on public.operation_automation_acknowledgements(admin_user_id, created_at desc);

alter table public.operation_automation_acknowledgements enable row level security;

drop policy if exists "operation_automation_acknowledgements_select_admin"
  on public.operation_automation_acknowledgements;
create policy "operation_automation_acknowledgements_select_admin"
on public.operation_automation_acknowledgements
for select
to authenticated
using (public.is_admin());

drop policy if exists "operation_automation_acknowledgements_insert_admin"
  on public.operation_automation_acknowledgements;
create policy "operation_automation_acknowledgements_insert_admin"
on public.operation_automation_acknowledgements
for insert
to authenticated
with check (public.is_admin());

grant select, insert on public.operation_automation_acknowledgements to authenticated;

alter table public.operation_audit_events
  drop constraint if exists operation_audit_events_entity_type_check;

alter table public.operation_audit_events
  add constraint operation_audit_events_entity_type_check
  check (
    entity_type in (
      'notification_delivery',
      'scheduled_job',
      'operation_escalation_rule',
      'operation_queue_subscription'
    )
  );

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
      'bulk_subscription_activated',
      'bulk_subscription_deactivated',
      'bulk_subscription_deleted',
      'bulk_subscription_duplicated',
      'note_added'
    )
  );
