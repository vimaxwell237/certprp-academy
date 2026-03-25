-- Phase 13: Outbound delivery and reminder-job foundation

create extension if not exists pgcrypto;

alter table public.notifications
  add column if not exists related_entity_type text null
    check (
      related_entity_type is null
      or related_entity_type in ('tutor_session', 'tutor_session_followup')
    ),
  add column if not exists related_entity_id uuid null;

create index if not exists idx_notifications_related_entity
  on public.notifications(related_entity_type, related_entity_id);

drop function if exists public.insert_notification_record(uuid, text, text, text, text, text);

create or replace function public.insert_notification_record(
  target_user_id uuid,
  target_type text,
  target_title text,
  target_message text,
  target_link_url text,
  target_dedupe_key text default null,
  target_related_entity_type text default null,
  target_related_entity_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    link_url,
    dedupe_key,
    related_entity_type,
    related_entity_id,
    is_read
  )
  values (
    target_user_id,
    target_type,
    target_title,
    target_message,
    target_link_url,
    target_dedupe_key,
    target_related_entity_type,
    target_related_entity_id,
    false
  )
  on conflict (dedupe_key) do nothing;
end;
$$;

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid null references public.notifications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null
    check (channel in ('email', 'sms', 'whatsapp')),
  template_key text not null,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed')),
  external_message_id text null,
  error_message text null,
  sent_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.scheduled_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_type text not null,
  related_entity_type text not null,
  related_entity_id uuid not null,
  scheduled_for timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'processed', 'failed', 'canceled')),
  payload jsonb not null default '{}'::jsonb,
  dedupe_key text null,
  processed_at timestamptz null,
  error_message text null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_notification_deliveries_user_created_at
  on public.notification_deliveries(user_id, created_at desc);
create index if not exists idx_notification_deliveries_user_status
  on public.notification_deliveries(user_id, status);
create unique index if not exists idx_notification_deliveries_notification_channel_template
  on public.notification_deliveries(notification_id, channel, template_key)
  where notification_id is not null;
create index if not exists idx_scheduled_jobs_user_status_scheduled_for
  on public.scheduled_jobs(user_id, status, scheduled_for);
create index if not exists idx_scheduled_jobs_related_entity
  on public.scheduled_jobs(related_entity_type, related_entity_id);
create unique index if not exists idx_scheduled_jobs_dedupe_key
  on public.scheduled_jobs(dedupe_key)
  where dedupe_key is not null;

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
    status
  )
  values (
    new.id,
    new.user_id,
    'email',
    new.type,
    'pending'
  )
  on conflict (notification_id, channel, template_key) do nothing;

  return new;
end;
$$;

create or replace function public.upsert_scheduled_job(
  target_user_id uuid,
  target_job_type text,
  target_related_entity_type text,
  target_related_entity_id uuid,
  target_scheduled_for timestamptz,
  target_payload jsonb default '{}'::jsonb,
  target_dedupe_key text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.scheduled_jobs (
    user_id,
    job_type,
    related_entity_type,
    related_entity_id,
    scheduled_for,
    status,
    payload,
    dedupe_key
  )
  values (
    target_user_id,
    target_job_type,
    target_related_entity_type,
    target_related_entity_id,
    target_scheduled_for,
    'pending',
    coalesce(target_payload, '{}'::jsonb),
    target_dedupe_key
  )
  on conflict (dedupe_key) do update
  set scheduled_for = excluded.scheduled_for,
    status = 'pending',
    payload = excluded.payload,
    processed_at = null,
    error_message = null
  where public.scheduled_jobs.status <> 'processed';
end;
$$;

create or replace function public.cancel_pending_jobs_for_entity(
  target_user_id uuid,
  target_related_entity_type text,
  target_related_entity_id uuid,
  target_job_prefix text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.scheduled_jobs
  set status = 'canceled',
    processed_at = timezone('utc', now()),
    error_message = 'Session is no longer eligible for this reminder.'
  where user_id = target_user_id
    and related_entity_type = target_related_entity_type
    and related_entity_id = target_related_entity_id
    and status = 'pending'
    and (
      target_job_prefix is null
      or job_type like target_job_prefix || '%'
    );
end;
$$;

create or replace function public.schedule_tutor_session_reminders(target_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  session_record public.tutor_sessions%rowtype;
  tutor_user_id uuid;
  reminder_24h_at timestamptz;
  reminder_soon_at timestamptz;
  now_utc timestamptz := timezone('utc', now());
begin
  select *
  into session_record
  from public.tutor_sessions
  where id = target_session_id;

  if not found then
    return;
  end if;

  select user_id
  into tutor_user_id
  from public.tutor_profiles
  where id = session_record.tutor_profile_id;

  if session_record.status <> 'confirmed'
    or session_record.scheduled_starts_at <= now_utc
    or session_record.scheduled_ends_at <= now_utc then
    if tutor_user_id is not null then
      perform public.cancel_pending_jobs_for_entity(
        tutor_user_id,
        'tutor_session',
        session_record.id,
        'session_reminder_'
      );
    end if;

    perform public.cancel_pending_jobs_for_entity(
      session_record.learner_user_id,
      'tutor_session',
      session_record.id,
      'session_reminder_'
    );
    return;
  end if;

  reminder_24h_at := session_record.scheduled_starts_at - interval '24 hours';

  if reminder_24h_at > now_utc then
    perform public.upsert_scheduled_job(
      session_record.learner_user_id,
      'session_reminder_24h',
      'tutor_session',
      session_record.id,
      reminder_24h_at,
      jsonb_build_object('reminder_kind', '24h'),
      format('session-reminder-24h:%s:%s', session_record.id, session_record.learner_user_id)
    );

    if tutor_user_id is not null then
      perform public.upsert_scheduled_job(
        tutor_user_id,
        'session_reminder_24h',
        'tutor_session',
        session_record.id,
        reminder_24h_at,
        jsonb_build_object('reminder_kind', '24h'),
        format('session-reminder-24h:%s:%s', session_record.id, tutor_user_id)
      );
    end if;
  else
    if tutor_user_id is not null then
      perform public.cancel_pending_jobs_for_entity(
        tutor_user_id,
        'tutor_session',
        session_record.id,
        'session_reminder_24h'
      );
    end if;

    perform public.cancel_pending_jobs_for_entity(
      session_record.learner_user_id,
      'tutor_session',
      session_record.id,
      'session_reminder_24h'
    );
  end if;

  reminder_soon_at := greatest(
    now_utc + interval '1 minute',
    session_record.scheduled_starts_at - interval '1 hour'
  );

  if session_record.scheduled_starts_at > now_utc + interval '15 minutes' then
    perform public.upsert_scheduled_job(
      session_record.learner_user_id,
      'session_reminder_soon',
      'tutor_session',
      session_record.id,
      reminder_soon_at,
      jsonb_build_object('reminder_kind', 'soon'),
      format('session-reminder-soon:%s:%s', session_record.id, session_record.learner_user_id)
    );

    if tutor_user_id is not null then
      perform public.upsert_scheduled_job(
        tutor_user_id,
        'session_reminder_soon',
        'tutor_session',
        session_record.id,
        reminder_soon_at,
        jsonb_build_object('reminder_kind', 'soon'),
        format('session-reminder-soon:%s:%s', session_record.id, tutor_user_id)
      );
    end if;
  else
    if tutor_user_id is not null then
      perform public.cancel_pending_jobs_for_entity(
        tutor_user_id,
        'tutor_session',
        session_record.id,
        'session_reminder_soon'
      );
    end if;

    perform public.cancel_pending_jobs_for_entity(
      session_record.learner_user_id,
      'tutor_session',
      session_record.id,
      'session_reminder_soon'
    );
  end if;
end;
$$;

create or replace function public.handle_tutor_session_reminder_jobs()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  session_id uuid := coalesce(new.id, old.id);
begin
  if tg_op = 'INSERT' then
    perform public.schedule_tutor_session_reminders(session_id);
    return new;
  end if;

  if old.status is distinct from new.status
    or old.scheduled_starts_at is distinct from new.scheduled_starts_at
    or old.scheduled_ends_at is distinct from new.scheduled_ends_at then
    perform public.schedule_tutor_session_reminders(session_id);
  end if;

  return new;
end;
$$;

create or replace function public.handle_tutor_session_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  tutor_user_id uuid;
  session_label text;
  learner_canceled boolean;
begin
  select user_id
  into tutor_user_id
  from public.tutor_profiles
  where id = coalesce(new.tutor_profile_id, old.tutor_profile_id);

  session_label := coalesce(new.subject, old.subject, 'Tutor session');

  if tg_op = 'INSERT' then
    if tutor_user_id is not null then
      perform public.insert_notification_record(
        tutor_user_id,
        'session_booked',
        'New tutor session request',
        format('A learner booked "%s". Review the request in your tutor session queue.', session_label),
        '/tutor/sessions',
        format('session-booked:%s:%s', new.id, tutor_user_id),
        'tutor_session',
        new.id
      );
    end if;

    return new;
  end if;

  learner_canceled := auth.uid() = old.learner_user_id;

  if old.status is distinct from new.status then
    if new.status = 'confirmed' then
      perform public.insert_notification_record(
        new.learner_user_id,
        'session_confirmed',
        'Tutor session confirmed',
        format('Your session "%s" was confirmed by the tutor.', session_label),
        '/sessions',
        format('session-confirmed:%s:%s', new.id, new.learner_user_id),
        'tutor_session',
        new.id
      );
    elsif new.status = 'canceled' then
      if learner_canceled then
        if tutor_user_id is not null then
          perform public.insert_notification_record(
            tutor_user_id,
            'session_canceled',
            'Learner canceled a session',
            format('The learner canceled "%s".', session_label),
            '/tutor/sessions',
            format('session-canceled-learner:%s:%s', new.id, tutor_user_id),
            'tutor_session',
            new.id
          );
        end if;
      else
        perform public.insert_notification_record(
          new.learner_user_id,
          'session_canceled',
          'Tutor session canceled',
          format('Your tutor canceled "%s".', session_label),
          '/sessions',
          format('session-canceled-tutor:%s:%s', new.id, new.learner_user_id),
          'tutor_session',
          new.id
        );
      end if;
    elsif new.status = 'completed' then
      perform public.insert_notification_record(
        new.learner_user_id,
        'session_completed',
        'Tutor session completed',
        format('Your session "%s" has been marked completed.', session_label),
        '/sessions',
        format('session-completed:%s:%s', new.id, new.learner_user_id),
        'tutor_session',
        new.id
      );
    end if;
  end if;

  if old.meeting_link is distinct from new.meeting_link
    and new.meeting_link is not null
    and length(trim(new.meeting_link)) > 0 then
    perform public.insert_notification_record(
      new.learner_user_id,
      'session_confirmed',
      'Meeting link available',
      format('A meeting link was added for "%s".', session_label),
      '/sessions',
      format('meeting-link-added:%s:%s', new.id, new.learner_user_id),
      'tutor_session',
      new.id
    );
  end if;

  return new;
end;
$$;

create or replace function public.handle_tutor_session_followup_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  session_subject text;
begin
  select subject
  into session_subject
  from public.tutor_sessions
  where id = new.tutor_session_id;

  perform public.insert_notification_record(
    new.learner_user_id,
    'followup_added',
    'Tutor follow-up available',
    format('A tutor follow-up was added for "%s".', coalesce(session_subject, 'your session')),
    '/sessions',
    format('followup-added:%s:%s', new.tutor_session_id, new.learner_user_id),
    'tutor_session',
    new.tutor_session_id
  );

  return new;
end;
$$;

drop trigger if exists trg_notification_delivery_enqueue on public.notifications;
create trigger trg_notification_delivery_enqueue
after insert on public.notifications
for each row
execute function public.enqueue_notification_delivery_record();

drop trigger if exists trg_tutor_session_reminder_jobs on public.tutor_sessions;
create trigger trg_tutor_session_reminder_jobs
after insert or update on public.tutor_sessions
for each row
execute function public.handle_tutor_session_reminder_jobs();

alter table public.notification_deliveries enable row level security;
alter table public.scheduled_jobs enable row level security;

drop policy if exists "notification_deliveries_select_own" on public.notification_deliveries;
create policy "notification_deliveries_select_own"
on public.notification_deliveries
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notification_deliveries_update_own" on public.notification_deliveries;
create policy "notification_deliveries_update_own"
on public.notification_deliveries
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "scheduled_jobs_select_own" on public.scheduled_jobs;
create policy "scheduled_jobs_select_own"
on public.scheduled_jobs
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "scheduled_jobs_update_own" on public.scheduled_jobs;
create policy "scheduled_jobs_update_own"
on public.scheduled_jobs
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, update on public.notification_deliveries to authenticated;
grant select, update on public.scheduled_jobs to authenticated;
revoke execute on function public.insert_notification_record(uuid, text, text, text, text, text, text, uuid) from authenticated;
revoke execute on function public.upsert_scheduled_job(uuid, text, text, uuid, timestamptz, jsonb, text) from authenticated;
revoke execute on function public.cancel_pending_jobs_for_entity(uuid, text, uuid, text) from authenticated;
revoke execute on function public.schedule_tutor_session_reminders(uuid) from authenticated;
