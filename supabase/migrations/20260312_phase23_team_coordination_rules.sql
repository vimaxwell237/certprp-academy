-- Phase 23: bulk subscription management and escalation rules

create table if not exists public.operation_escalation_rules (
  id uuid primary key default gen_random_uuid(),
  created_by_admin_user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null
    check (entity_type in ('notification_delivery', 'scheduled_job')),
  name text not null check (length(trim(name)) > 0),
  filters_json jsonb not null default '{}'::jsonb,
  escalation_reason text not null check (length(trim(escalation_reason)) > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_operation_escalation_rules_unique_name
  on public.operation_escalation_rules(created_by_admin_user_id, entity_type, lower(name));

create index if not exists idx_operation_escalation_rules_admin_entity_updated_at
  on public.operation_escalation_rules(created_by_admin_user_id, entity_type, updated_at desc);

drop trigger if exists trg_operation_escalation_rules_updated_at on public.operation_escalation_rules;
create trigger trg_operation_escalation_rules_updated_at
before update on public.operation_escalation_rules
for each row
execute function public.set_updated_at_timestamp();

alter table public.operation_escalation_rules enable row level security;

drop policy if exists "operation_escalation_rules_select_own_admin" on public.operation_escalation_rules;
create policy "operation_escalation_rules_select_own_admin"
on public.operation_escalation_rules
for select
to authenticated
using (public.is_admin() and created_by_admin_user_id = auth.uid());

drop policy if exists "operation_escalation_rules_insert_own_admin" on public.operation_escalation_rules;
create policy "operation_escalation_rules_insert_own_admin"
on public.operation_escalation_rules
for insert
to authenticated
with check (public.is_admin() and created_by_admin_user_id = auth.uid());

drop policy if exists "operation_escalation_rules_update_own_admin" on public.operation_escalation_rules;
create policy "operation_escalation_rules_update_own_admin"
on public.operation_escalation_rules
for update
to authenticated
using (public.is_admin() and created_by_admin_user_id = auth.uid())
with check (public.is_admin() and created_by_admin_user_id = auth.uid());

drop policy if exists "operation_escalation_rules_delete_own_admin" on public.operation_escalation_rules;
create policy "operation_escalation_rules_delete_own_admin"
on public.operation_escalation_rules
for delete
to authenticated
using (public.is_admin() and created_by_admin_user_id = auth.uid());

grant select, insert, update, delete on public.operation_escalation_rules to authenticated;

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
      'bulk_subscription_activated',
      'bulk_subscription_deactivated',
      'bulk_subscription_deleted',
      'bulk_subscription_duplicated',
      'note_added'
    )
  );
