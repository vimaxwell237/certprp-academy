-- Phase 12: In-app notifications and tutor session follow-ups

create extension if not exists pgcrypto;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null
    check (
      type in (
        'session_booked',
        'session_confirmed',
        'session_canceled',
        'session_reminder',
        'session_completed',
        'followup_added'
      )
    ),
  title text not null check (length(trim(title)) > 0),
  message text not null check (length(trim(message)) > 0),
  link_url text null,
  dedupe_key text null,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tutor_session_followups (
  id uuid primary key default gen_random_uuid(),
  tutor_session_id uuid not null unique references public.tutor_sessions(id) on delete cascade,
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  learner_user_id uuid not null references auth.users(id) on delete cascade,
  summary text not null check (length(trim(summary)) > 0),
  recommendations text null,
  homework text null,
  next_steps text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_notifications_user_created_at
  on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_user_is_read
  on public.notifications(user_id, is_read);
create unique index if not exists idx_notifications_dedupe_key
  on public.notifications(dedupe_key)
  where dedupe_key is not null;
create index if not exists idx_tutor_session_followups_tutor_profile_id
  on public.tutor_session_followups(tutor_profile_id);
create index if not exists idx_tutor_session_followups_learner_user_id
  on public.tutor_session_followups(learner_user_id);

create or replace function public.insert_notification_record(
  target_user_id uuid,
  target_type text,
  target_title text,
  target_message text,
  target_link_url text,
  target_dedupe_key text default null
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
    is_read
  )
  values (
    target_user_id,
    target_type,
    target_title,
    target_message,
    target_link_url,
    target_dedupe_key,
    false
  )
  on conflict (dedupe_key) do nothing;
end;
$$;

create or replace function public.validate_tutor_session_followup_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  session_record public.tutor_sessions%rowtype;
begin
  select *
  into session_record
  from public.tutor_sessions
  where id = new.tutor_session_id;

  if not found then
    raise exception 'Tutor session follow-up must reference a valid session.';
  end if;

  if session_record.status <> 'completed' then
    raise exception 'Follow-ups can only be saved for completed tutor sessions.';
  end if;

  if session_record.tutor_profile_id <> new.tutor_profile_id then
    raise exception 'Follow-up tutor ownership does not match the session.';
  end if;

  if session_record.learner_user_id <> new.learner_user_id then
    raise exception 'Follow-up learner ownership does not match the session.';
  end if;

  if new.summary is null or length(trim(new.summary)) = 0 then
    raise exception 'Follow-up summary is required.';
  end if;

  if tg_op = 'UPDATE' then
    if old.tutor_session_id is distinct from new.tutor_session_id
      or old.tutor_profile_id is distinct from new.tutor_profile_id
      or old.learner_user_id is distinct from new.learner_user_id then
      raise exception 'Follow-ups cannot be reassigned to a different tutor session.';
    end if;
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
        format('session-booked:%s:%s', new.id, tutor_user_id)
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
        format('session-confirmed:%s:%s', new.id, new.learner_user_id)
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
            format('session-canceled-learner:%s:%s', new.id, tutor_user_id)
          );
        end if;
      else
        perform public.insert_notification_record(
          new.learner_user_id,
          'session_canceled',
          'Tutor session canceled',
          format('Your tutor canceled "%s".', session_label),
          '/sessions',
          format('session-canceled-tutor:%s:%s', new.id, new.learner_user_id)
        );
      end if;
    elsif new.status = 'completed' then
      perform public.insert_notification_record(
        new.learner_user_id,
        'session_completed',
        'Tutor session completed',
        format('Your session "%s" has been marked completed.', session_label),
        '/sessions',
        format('session-completed:%s:%s', new.id, new.learner_user_id)
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
      format('meeting-link-added:%s:%s', new.id, new.learner_user_id)
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
    format('followup-added:%s:%s', new.tutor_session_id, new.learner_user_id)
  );

  return new;
end;
$$;

drop trigger if exists trg_tutor_session_followups_updated_at on public.tutor_session_followups;
create trigger trg_tutor_session_followups_updated_at
before update on public.tutor_session_followups
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_validate_tutor_session_followup_write on public.tutor_session_followups;
create trigger trg_validate_tutor_session_followup_write
before insert or update on public.tutor_session_followups
for each row
execute function public.validate_tutor_session_followup_write();

drop trigger if exists trg_tutor_session_notifications on public.tutor_sessions;
create trigger trg_tutor_session_notifications
after insert or update on public.tutor_sessions
for each row
execute function public.handle_tutor_session_notifications();

drop trigger if exists trg_tutor_session_followup_notifications on public.tutor_session_followups;
create trigger trg_tutor_session_followup_notifications
after insert on public.tutor_session_followups
for each row
execute function public.handle_tutor_session_followup_notifications();

alter table public.notifications enable row level security;
alter table public.tutor_session_followups enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notifications_insert_own" on public.notifications;
create policy "notifications_insert_own"
on public.notifications
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "tutor_session_followups_select_accessible" on public.tutor_session_followups;
create policy "tutor_session_followups_select_accessible"
on public.tutor_session_followups
for select
to authenticated
using (
  learner_user_id = auth.uid()
  or tutor_profile_id = public.current_active_tutor_profile_id()
);

drop policy if exists "tutor_session_followups_insert_tutor_owned" on public.tutor_session_followups;
create policy "tutor_session_followups_insert_tutor_owned"
on public.tutor_session_followups
for insert
to authenticated
with check (tutor_profile_id = public.current_active_tutor_profile_id());

drop policy if exists "tutor_session_followups_update_tutor_owned" on public.tutor_session_followups;
create policy "tutor_session_followups_update_tutor_owned"
on public.tutor_session_followups
for update
to authenticated
using (tutor_profile_id = public.current_active_tutor_profile_id())
with check (tutor_profile_id = public.current_active_tutor_profile_id());

grant select, insert, update on public.notifications to authenticated;
grant select, insert, update on public.tutor_session_followups to authenticated;
revoke execute on function public.insert_notification_record(uuid, text, text, text, text, text) from authenticated;
