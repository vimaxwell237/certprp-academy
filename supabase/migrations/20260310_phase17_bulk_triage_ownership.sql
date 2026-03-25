-- Phase 17: Bulk triage workflows and operator ownership

alter table public.notification_deliveries
  add column if not exists assigned_admin_user_id uuid references auth.users(id) on delete set null,
  add column if not exists assigned_at timestamptz,
  add column if not exists handoff_note text;

alter table public.scheduled_jobs
  add column if not exists assigned_admin_user_id uuid references auth.users(id) on delete set null,
  add column if not exists assigned_at timestamptz,
  add column if not exists handoff_note text;

create index if not exists idx_notification_deliveries_assigned_admin
  on public.notification_deliveries(assigned_admin_user_id, status, created_at desc);

create index if not exists idx_scheduled_jobs_assigned_admin
  on public.scheduled_jobs(assigned_admin_user_id, status, created_at desc);

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
      'status_changed',
      'note_added'
    )
  );
