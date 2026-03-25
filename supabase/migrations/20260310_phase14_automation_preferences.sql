-- Phase 14: Automation, retry/backoff, and notification preferences

create extension if not exists pgcrypto;

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null
    check (channel in ('in_app', 'email')),
  notification_type text not null
    check (
      notification_type in (
        'session_booked',
        'session_confirmed',
        'session_canceled',
        'session_reminder',
        'session_completed',
        'followup_added'
      )
    ),
  is_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, channel, notification_type)
);

create index if not exists idx_notification_preferences_user_channel
  on public.notification_preferences(user_id, channel);

alter table public.notification_deliveries
  add column if not exists retry_count integer not null default 0,
  add column if not exists max_retries integer not null default 3,
  add column if not exists last_attempted_at timestamptz null,
  add column if not exists next_attempt_at timestamptz not null default timezone('utc', now()),
  add column if not exists processing_token uuid null,
  add column if not exists processing_started_at timestamptz null;

alter table public.scheduled_jobs
  add column if not exists retry_count integer not null default 0,
  add column if not exists max_retries integer not null default 3,
  add column if not exists last_attempted_at timestamptz null,
  add column if not exists processing_token uuid null,
  add column if not exists processing_started_at timestamptz null;

create index if not exists idx_notification_deliveries_status_next_attempt
  on public.notification_deliveries(status, next_attempt_at);
create index if not exists idx_notification_deliveries_processing_started
  on public.notification_deliveries(processing_started_at);
create index if not exists idx_scheduled_jobs_processing_started
  on public.scheduled_jobs(processing_started_at);

update public.notification_deliveries
set next_attempt_at = coalesce(next_attempt_at, created_at)
where next_attempt_at is null;

create or replace function public.seed_default_notification_preferences(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  channels text[] := array['in_app', 'email'];
  notification_types text[] := array[
    'session_booked',
    'session_confirmed',
    'session_canceled',
    'session_reminder',
    'session_completed',
    'followup_added'
  ];
  current_channel text;
  current_notification_type text;
begin
  foreach current_channel in array channels loop
    foreach current_notification_type in array notification_types loop
      insert into public.notification_preferences (
        user_id,
        channel,
        notification_type,
        is_enabled
      )
      values (
        target_user_id,
        current_channel,
        current_notification_type,
        true
      )
      on conflict (user_id, channel, notification_type) do nothing;
    end loop;
  end loop;
end;
$$;

create or replace function public.handle_notification_preferences_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_default_notification_preferences(new.id);
  return new;
end;
$$;

create or replace function public.notification_channel_enabled(
  target_user_id uuid,
  target_channel text,
  target_notification_type text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select np.is_enabled
      from public.notification_preferences np
      where np.user_id = target_user_id
        and np.channel = target_channel
        and np.notification_type = target_notification_type
      limit 1
    ),
    true
  );
$$;

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

create or replace function public.claim_due_scheduled_jobs(
  target_user_id uuid default auth.uid(),
  target_limit integer default 25,
  stale_after_minutes integer default 10
)
returns table (
  id uuid,
  user_id uuid,
  job_type text,
  related_entity_type text,
  related_entity_id uuid,
  scheduled_for timestamptz,
  status text,
  payload jsonb,
  dedupe_key text,
  retry_count integer,
  max_retries integer,
  last_attempted_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    if target_user_id is null then
      target_user_id := auth.uid();
    elsif target_user_id <> auth.uid() then
      raise exception 'Authenticated users can only claim their own scheduled jobs.';
    end if;
  end if;

  return query
  with candidate as (
    select scheduled_jobs.id
    from public.scheduled_jobs
    where scheduled_jobs.status = 'pending'
      and scheduled_jobs.scheduled_for <= timezone('utc', now())
      and (
        target_user_id is null
        or scheduled_jobs.user_id = target_user_id
      )
      and (
        scheduled_jobs.processing_started_at is null
        or scheduled_jobs.processing_started_at <= timezone('utc', now()) - make_interval(mins => stale_after_minutes)
      )
    order by scheduled_jobs.scheduled_for asc, scheduled_jobs.created_at asc
    for update skip locked
    limit greatest(target_limit, 1)
  ),
  claimed as (
    update public.scheduled_jobs
    set processing_token = gen_random_uuid(),
      processing_started_at = timezone('utc', now()),
      last_attempted_at = timezone('utc', now())
    where public.scheduled_jobs.id in (select candidate.id from candidate)
    returning
      public.scheduled_jobs.id,
      public.scheduled_jobs.user_id,
      public.scheduled_jobs.job_type,
      public.scheduled_jobs.related_entity_type,
      public.scheduled_jobs.related_entity_id,
      public.scheduled_jobs.scheduled_for,
      public.scheduled_jobs.status,
      public.scheduled_jobs.payload,
      public.scheduled_jobs.dedupe_key,
      public.scheduled_jobs.retry_count,
      public.scheduled_jobs.max_retries,
      public.scheduled_jobs.last_attempted_at
  )
  select *
  from claimed;
end;
$$;

create or replace function public.claim_due_notification_deliveries(
  target_user_id uuid default auth.uid(),
  target_limit integer default 25,
  stale_after_minutes integer default 10
)
returns table (
  id uuid,
  notification_id uuid,
  user_id uuid,
  channel text,
  template_key text,
  status text,
  external_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz,
  retry_count integer,
  max_retries integer,
  last_attempted_at timestamptz,
  next_attempt_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    if target_user_id is null then
      target_user_id := auth.uid();
    elsif target_user_id <> auth.uid() then
      raise exception 'Authenticated users can only claim their own notification deliveries.';
    end if;
  end if;

  return query
  with candidate as (
    select notification_deliveries.id
    from public.notification_deliveries
    where notification_deliveries.status = 'pending'
      and notification_deliveries.channel = 'email'
      and coalesce(notification_deliveries.next_attempt_at, notification_deliveries.created_at) <= timezone('utc', now())
      and (
        target_user_id is null
        or notification_deliveries.user_id = target_user_id
      )
      and (
        notification_deliveries.processing_started_at is null
        or notification_deliveries.processing_started_at <= timezone('utc', now()) - make_interval(mins => stale_after_minutes)
      )
    order by coalesce(notification_deliveries.next_attempt_at, notification_deliveries.created_at) asc,
      notification_deliveries.created_at asc
    for update skip locked
    limit greatest(target_limit, 1)
  ),
  claimed as (
    update public.notification_deliveries
    set processing_token = gen_random_uuid(),
      processing_started_at = timezone('utc', now()),
      last_attempted_at = timezone('utc', now())
    where public.notification_deliveries.id in (select candidate.id from candidate)
    returning
      public.notification_deliveries.id,
      public.notification_deliveries.notification_id,
      public.notification_deliveries.user_id,
      public.notification_deliveries.channel,
      public.notification_deliveries.template_key,
      public.notification_deliveries.status,
      public.notification_deliveries.external_message_id,
      public.notification_deliveries.error_message,
      public.notification_deliveries.sent_at,
      public.notification_deliveries.created_at,
      public.notification_deliveries.retry_count,
      public.notification_deliveries.max_retries,
      public.notification_deliveries.last_attempted_at,
      public.notification_deliveries.next_attempt_at
  )
  select *
  from claimed;
end;
$$;

drop trigger if exists trg_notification_preferences_updated_at on public.notification_preferences;
create trigger trg_notification_preferences_updated_at
before update on public.notification_preferences
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_notification_preferences_new_user on auth.users;
create trigger trg_notification_preferences_new_user
after insert on auth.users
for each row
execute function public.handle_notification_preferences_for_new_user();

do $$
declare
  existing_user_id uuid;
begin
  for existing_user_id in
    select id
    from auth.users
  loop
    perform public.seed_default_notification_preferences(existing_user_id);
  end loop;
end;
$$;

alter table public.notification_preferences enable row level security;

drop policy if exists "notification_preferences_select_own" on public.notification_preferences;
create policy "notification_preferences_select_own"
on public.notification_preferences
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notification_preferences_insert_own" on public.notification_preferences;
create policy "notification_preferences_insert_own"
on public.notification_preferences
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "notification_preferences_update_own" on public.notification_preferences;
create policy "notification_preferences_update_own"
on public.notification_preferences
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, insert, update on public.notification_preferences to authenticated;
grant execute on function public.notification_channel_enabled(uuid, text, text) to authenticated;
grant execute on function public.claim_due_scheduled_jobs(uuid, integer, integer) to authenticated;
grant execute on function public.claim_due_notification_deliveries(uuid, integer, integer) to authenticated;
revoke execute on function public.seed_default_notification_preferences(uuid) from authenticated;
