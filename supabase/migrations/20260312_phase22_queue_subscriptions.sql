-- Phase 22: queue subscriptions, escalation state, and team-follow signals

create table if not exists public.operation_queue_subscriptions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null
    check (entity_type in ('notification_delivery', 'scheduled_job')),
  name text not null check (length(trim(name)) > 0),
  filters_json jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_operation_queue_subscriptions_unique_name
  on public.operation_queue_subscriptions(admin_user_id, entity_type, lower(name));

create index if not exists idx_operation_queue_subscriptions_admin_entity_updated_at
  on public.operation_queue_subscriptions(admin_user_id, entity_type, updated_at desc);

drop trigger if exists trg_operation_queue_subscriptions_updated_at on public.operation_queue_subscriptions;
create trigger trg_operation_queue_subscriptions_updated_at
before update on public.operation_queue_subscriptions
for each row
execute function public.set_updated_at_timestamp();

alter table public.operation_queue_subscriptions enable row level security;

drop policy if exists "operation_queue_subscriptions_select_own_admin" on public.operation_queue_subscriptions;
create policy "operation_queue_subscriptions_select_own_admin"
on public.operation_queue_subscriptions
for select
to authenticated
using (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "operation_queue_subscriptions_insert_own_admin" on public.operation_queue_subscriptions;
create policy "operation_queue_subscriptions_insert_own_admin"
on public.operation_queue_subscriptions
for insert
to authenticated
with check (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "operation_queue_subscriptions_update_own_admin" on public.operation_queue_subscriptions;
create policy "operation_queue_subscriptions_update_own_admin"
on public.operation_queue_subscriptions
for update
to authenticated
using (public.is_admin() and admin_user_id = auth.uid())
with check (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "operation_queue_subscriptions_delete_own_admin" on public.operation_queue_subscriptions;
create policy "operation_queue_subscriptions_delete_own_admin"
on public.operation_queue_subscriptions
for delete
to authenticated
using (public.is_admin() and admin_user_id = auth.uid());

grant select, insert, update, delete on public.operation_queue_subscriptions to authenticated;

alter table public.notification_deliveries
  add column if not exists is_escalated boolean not null default false,
  add column if not exists escalated_at timestamptz null,
  add column if not exists escalated_by_admin_user_id uuid null references auth.users(id) on delete set null,
  add column if not exists escalation_reason text null;

alter table public.scheduled_jobs
  add column if not exists is_escalated boolean not null default false,
  add column if not exists escalated_at timestamptz null,
  add column if not exists escalated_by_admin_user_id uuid null references auth.users(id) on delete set null,
  add column if not exists escalation_reason text null;

create index if not exists idx_notification_deliveries_escalated
  on public.notification_deliveries(is_escalated, assigned_admin_user_id, created_at desc);

create index if not exists idx_scheduled_jobs_escalated
  on public.scheduled_jobs(is_escalated, assigned_admin_user_id, created_at desc);

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
      'operation_subscription_match'
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
