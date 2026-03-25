-- Phase 20: watch-state and higher-signal incident execution

create table if not exists public.operation_watchers (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('notification_delivery', 'scheduled_job')),
  entity_id uuid not null,
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_operation_watchers_unique
  on public.operation_watchers(entity_type, entity_id, admin_user_id);

create index if not exists idx_operation_watchers_entity_created_at
  on public.operation_watchers(entity_type, entity_id, created_at desc);

create index if not exists idx_operation_watchers_admin_created_at
  on public.operation_watchers(admin_user_id, created_at desc);

alter table public.operation_watchers enable row level security;

drop policy if exists "operation_watchers_select_admin" on public.operation_watchers;
create policy "operation_watchers_select_admin"
on public.operation_watchers
for select
to authenticated
using (public.is_admin());

drop policy if exists "operation_watchers_insert_own_admin" on public.operation_watchers;
create policy "operation_watchers_insert_own_admin"
on public.operation_watchers
for insert
to authenticated
with check (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "operation_watchers_delete_own_admin" on public.operation_watchers;
create policy "operation_watchers_delete_own_admin"
on public.operation_watchers
for delete
to authenticated
using (public.is_admin() and admin_user_id = auth.uid());

grant select, insert, delete on public.operation_watchers to authenticated;

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
      'operation_watch_update'
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
      'note_added'
    )
  );

create or replace function public.enqueue_notification_delivery_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_email text;
begin
  if new.user_id is null then
    return new;
  end if;

  if new.type not in (
    'session_booked',
    'session_confirmed',
    'session_canceled',
    'session_reminder',
    'session_completed',
    'followup_added'
  ) then
    return new;
  end if;

  if not public.notification_channel_enabled(new.user_id, 'email', new.type) then
    return new;
  end if;

  select email
  into target_email
  from auth.users
  where id = new.user_id;

  if target_email is null or length(trim(target_email)) = 0 then
    return new;
  end if;

  insert into public.notification_deliveries (
    notification_id,
    user_id,
    channel,
    template_key,
    status,
    retry_count,
    max_retries,
    next_attempt_at
  )
  values (
    new.id,
    new.user_id,
    'email',
    new.type,
    'pending',
    0,
    3,
    timezone('utc', now())
  )
  on conflict (notification_id, channel, template_key) do nothing;

  return new;
end;
$$;
