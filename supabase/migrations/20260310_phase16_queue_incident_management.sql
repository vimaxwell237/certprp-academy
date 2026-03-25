-- Phase 16: Queue incident management, notes, and audit history

create table if not exists public.operation_notes (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('notification_delivery', 'scheduled_job')),
  entity_id uuid not null,
  admin_user_id uuid not null references auth.users(id) on delete restrict,
  note_body text not null
    check (char_length(trim(note_body)) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_operation_notes_entity_created_at
  on public.operation_notes(entity_type, entity_id, created_at desc);

create table if not exists public.operation_audit_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('notification_delivery', 'scheduled_job')),
  entity_id uuid not null,
  admin_user_id uuid references auth.users(id) on delete set null,
  event_type text not null
    check (
      event_type in (
        'retry_requested',
        'force_retry_requested',
        'ignored',
        'canceled',
        'replay_requested',
        'status_changed',
        'note_added'
      )
    ),
  event_summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_operation_audit_events_entity_created_at
  on public.operation_audit_events(entity_type, entity_id, created_at desc);

create index if not exists idx_operation_audit_events_admin_created_at
  on public.operation_audit_events(admin_user_id, created_at desc);

drop trigger if exists trg_operation_notes_updated_at on public.operation_notes;
create trigger trg_operation_notes_updated_at
before update on public.operation_notes
for each row
execute function public.set_updated_at_timestamp();

alter table public.operation_notes enable row level security;
alter table public.operation_audit_events enable row level security;

drop policy if exists "operation_notes_select_admin" on public.operation_notes;
create policy "operation_notes_select_admin"
on public.operation_notes
for select
to authenticated
using (public.is_admin());

drop policy if exists "operation_notes_insert_admin" on public.operation_notes;
create policy "operation_notes_insert_admin"
on public.operation_notes
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "operation_audit_events_select_admin" on public.operation_audit_events;
create policy "operation_audit_events_select_admin"
on public.operation_audit_events
for select
to authenticated
using (public.is_admin());

drop policy if exists "operation_audit_events_insert_admin" on public.operation_audit_events;
create policy "operation_audit_events_insert_admin"
on public.operation_audit_events
for insert
to authenticated
with check (public.is_admin());

grant select, insert on public.operation_notes to authenticated;
grant select, insert on public.operation_audit_events to authenticated;
