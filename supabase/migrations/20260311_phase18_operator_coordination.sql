-- Phase 18: operator coordination and workflow polish

alter table public.notification_deliveries
  add column if not exists workflow_state text not null default 'open'
    check (workflow_state in ('open', 'investigating', 'waiting', 'resolved')),
  add column if not exists workflow_state_updated_at timestamptz not null default timezone('utc', now());

alter table public.scheduled_jobs
  add column if not exists workflow_state text not null default 'open'
    check (workflow_state in ('open', 'investigating', 'waiting', 'resolved')),
  add column if not exists workflow_state_updated_at timestamptz not null default timezone('utc', now());

create index if not exists idx_notification_deliveries_workflow_state
  on public.notification_deliveries(workflow_state, assigned_admin_user_id, created_at desc);

create index if not exists idx_scheduled_jobs_workflow_state
  on public.scheduled_jobs(workflow_state, assigned_admin_user_id, created_at desc);

create table if not exists public.operation_assignment_history (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('notification_delivery', 'scheduled_job')),
  entity_id uuid not null,
  previous_admin_user_id uuid references auth.users(id) on delete set null,
  new_admin_user_id uuid references auth.users(id) on delete set null,
  changed_by_admin_user_id uuid not null references auth.users(id) on delete restrict,
  handoff_note text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_operation_assignment_history_entity_created_at
  on public.operation_assignment_history(entity_type, entity_id, created_at desc);

create index if not exists idx_operation_assignment_history_changed_by_created_at
  on public.operation_assignment_history(changed_by_admin_user_id, created_at desc);

alter table public.operation_assignment_history enable row level security;

drop policy if exists "operation_assignment_history_select_admin" on public.operation_assignment_history;
create policy "operation_assignment_history_select_admin"
on public.operation_assignment_history
for select
to authenticated
using (public.is_admin());

drop policy if exists "operation_assignment_history_insert_admin" on public.operation_assignment_history;
create policy "operation_assignment_history_insert_admin"
on public.operation_assignment_history
for insert
to authenticated
with check (public.is_admin());

grant select, insert on public.operation_assignment_history to authenticated;

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
      'note_added'
    )
  );
