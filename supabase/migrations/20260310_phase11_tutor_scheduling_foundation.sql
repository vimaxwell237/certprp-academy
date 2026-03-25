-- Phase 11: Tutor scheduling and live session management foundation

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create or replace function public.current_active_tutor_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.tutor_profiles
  where user_id = auth.uid()
    and is_active = true
  limit 1;
$$;

create or replace function public.is_tutor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'tutor'
    and public.current_active_tutor_profile_id() is not null;
$$;

create or replace function public.sync_user_role_for_tutor_profile(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  has_active_tutor_profile boolean;
begin
  select exists (
    select 1
    from public.tutor_profiles
    where user_id = target_user_id
      and is_active = true
  )
  into has_active_tutor_profile;

  insert into public.user_roles (user_id, role)
  values (
    target_user_id,
    case when has_active_tutor_profile then 'tutor' else 'learner' end
  )
  on conflict (user_id) do update
  set role = case
      when public.user_roles.role = 'admin' then 'admin'
      when has_active_tutor_profile then 'tutor'
      else 'learner'
    end,
    updated_at = timezone('utc', now());
end;
$$;

create or replace function public.handle_tutor_profile_role_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_user_role_for_tutor_profile(old.user_id);
    return old;
  end if;

  perform public.sync_user_role_for_tutor_profile(new.user_id);

  if tg_op = 'UPDATE' and old.user_id is distinct from new.user_id then
    perform public.sync_user_role_for_tutor_profile(old.user_id);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_tutor_profile_role_sync on public.tutor_profiles;
create trigger trg_tutor_profile_role_sync
after insert or update or delete on public.tutor_profiles
for each row
execute function public.handle_tutor_profile_role_sync();

do $$
declare
  tutor_user_id uuid;
begin
  for tutor_user_id in
    select distinct user_id
    from public.tutor_profiles
  loop
    perform public.sync_user_role_for_tutor_profile(tutor_user_id);
  end loop;
end;
$$;

create table if not exists public.tutor_availability_slots (
  id uuid primary key default gen_random_uuid(),
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ends_at > starts_at)
);

create table if not exists public.tutor_sessions (
  id uuid primary key default gen_random_uuid(),
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  learner_user_id uuid not null references auth.users(id) on delete cascade,
  availability_slot_id uuid null references public.tutor_availability_slots(id) on delete set null,
  support_request_id uuid null references public.support_requests(id) on delete set null,
  subject text not null check (length(trim(subject)) > 0),
  category text not null default 'general'
    check (
      category in (
        'general',
        'lesson_clarification',
        'quiz_help',
        'exam_help',
        'lab_help',
        'cli_help'
      )
    ),
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'completed', 'canceled')),
  meeting_link text null,
  notes text null,
  scheduled_starts_at timestamptz not null,
  scheduled_ends_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (scheduled_ends_at > scheduled_starts_at)
);

create index if not exists idx_tutor_availability_slots_profile_starts
  on public.tutor_availability_slots(tutor_profile_id, starts_at);
create index if not exists idx_tutor_availability_slots_active_starts
  on public.tutor_availability_slots(is_active, starts_at);
create index if not exists idx_tutor_sessions_tutor_status_start
  on public.tutor_sessions(tutor_profile_id, status, scheduled_starts_at);
create index if not exists idx_tutor_sessions_learner_status_start
  on public.tutor_sessions(learner_user_id, status, scheduled_starts_at);
create index if not exists idx_tutor_sessions_support_request_id
  on public.tutor_sessions(support_request_id);
create unique index if not exists idx_tutor_sessions_slot_booking_unique
  on public.tutor_sessions(availability_slot_id)
  where availability_slot_id is not null
    and status in ('requested', 'confirmed', 'completed');

alter table public.tutor_availability_slots
  add constraint tutor_availability_slots_no_overlap
  exclude using gist (
    tutor_profile_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (is_active);

create or replace function public.validate_tutor_availability_slot()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.ends_at <= new.starts_at then
    raise exception 'Availability end time must be after the start time.';
  end if;

  if new.starts_at < timezone('utc', now()) then
    raise exception 'Availability slots must be scheduled in the future.';
  end if;

  if tg_op = 'UPDATE'
    and old.is_active = true
    and new.is_active = false
    and exists (
      select 1
      from public.tutor_sessions ts
      where ts.availability_slot_id = old.id
        and ts.status in ('requested', 'confirmed')
    ) then
    raise exception 'Booked availability slots cannot be deactivated until the session is canceled or completed.';
  end if;

  return new;
end;
$$;

create or replace function public.validate_tutor_session_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  slot_record public.tutor_availability_slots%rowtype;
  actor_tutor_profile_id uuid;
begin
  actor_tutor_profile_id := public.current_active_tutor_profile_id();

  if new.subject is null or length(trim(new.subject)) = 0 then
    raise exception 'Session subject is required.';
  end if;

  if new.scheduled_ends_at <= new.scheduled_starts_at then
    raise exception 'Session end time must be after the start time.';
  end if;

  if new.availability_slot_id is not null then
    select *
    into slot_record
    from public.tutor_availability_slots
    where id = new.availability_slot_id;

    if not found then
      raise exception 'The selected availability slot does not exist.';
    end if;

    if slot_record.tutor_profile_id <> new.tutor_profile_id then
      raise exception 'The selected availability slot belongs to a different tutor.';
    end if;

    if slot_record.starts_at <> new.scheduled_starts_at
      or slot_record.ends_at <> new.scheduled_ends_at then
      raise exception 'Session times must match the selected availability slot.';
    end if;

    if tg_op = 'INSERT' and slot_record.is_active = false then
      raise exception 'Inactive availability slots cannot be booked.';
    end if;
  end if;

  if new.status = 'completed' and new.scheduled_ends_at > timezone('utc', now()) then
    raise exception 'Sessions can only be marked completed after the scheduled end time.';
  end if;

  if tg_op = 'INSERT' then
    if new.availability_slot_id is null then
      raise exception 'Learner bookings must reference an availability slot.';
    end if;

    if auth.uid() is null or auth.uid() <> new.learner_user_id then
      raise exception 'Only the booking learner can create a tutor session.';
    end if;

    if new.status <> 'requested' then
      raise exception 'New tutor sessions must start in requested status.';
    end if;

    return new;
  end if;

  if old.status is distinct from new.status then
    case old.status
      when 'requested' then
        if new.status not in ('confirmed', 'canceled') then
          raise exception 'Requested sessions can only move to confirmed or canceled.';
        end if;
      when 'confirmed' then
        if new.status not in ('completed', 'canceled') then
          raise exception 'Confirmed sessions can only move to completed or canceled.';
        end if;
      when 'completed' then
        if new.status <> 'completed' then
          raise exception 'Completed sessions cannot change status again.';
        end if;
      when 'canceled' then
        if new.status <> 'canceled' then
          raise exception 'Canceled sessions cannot change status again.';
        end if;
    end case;
  end if;

  if auth.uid() = old.learner_user_id and actor_tutor_profile_id is null then
    if old.tutor_profile_id is distinct from new.tutor_profile_id
      or old.learner_user_id is distinct from new.learner_user_id
      or old.availability_slot_id is distinct from new.availability_slot_id
      or old.support_request_id is distinct from new.support_request_id
      or old.subject is distinct from new.subject
      or old.category is distinct from new.category
      or old.meeting_link is distinct from new.meeting_link
      or old.notes is distinct from new.notes
      or old.scheduled_starts_at is distinct from new.scheduled_starts_at
      or old.scheduled_ends_at is distinct from new.scheduled_ends_at then
      raise exception 'Learners can only cancel their own tutor sessions.';
    end if;

    if old.status = 'canceled' or new.status <> 'canceled' then
      raise exception 'Learners can only move a session into canceled status.';
    end if;

    return new;
  end if;

  if actor_tutor_profile_id = old.tutor_profile_id then
    if old.tutor_profile_id is distinct from new.tutor_profile_id
      or old.learner_user_id is distinct from new.learner_user_id
      or old.availability_slot_id is distinct from new.availability_slot_id
      or old.support_request_id is distinct from new.support_request_id
      or old.subject is distinct from new.subject
      or old.category is distinct from new.category
      or old.scheduled_starts_at is distinct from new.scheduled_starts_at
      or old.scheduled_ends_at is distinct from new.scheduled_ends_at then
      raise exception 'Tutors cannot reassign or reschedule booked sessions.';
    end if;

    return new;
  end if;

  raise exception 'Unauthorized tutor session update.';
end;
$$;

drop trigger if exists trg_tutor_availability_slots_updated_at on public.tutor_availability_slots;
create trigger trg_tutor_availability_slots_updated_at
before update on public.tutor_availability_slots
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_tutor_sessions_updated_at on public.tutor_sessions;
create trigger trg_tutor_sessions_updated_at
before update on public.tutor_sessions
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_validate_tutor_availability_slot on public.tutor_availability_slots;
create trigger trg_validate_tutor_availability_slot
before insert or update on public.tutor_availability_slots
for each row
execute function public.validate_tutor_availability_slot();

drop trigger if exists trg_validate_tutor_session_write on public.tutor_sessions;
create trigger trg_validate_tutor_session_write
before insert or update on public.tutor_sessions
for each row
execute function public.validate_tutor_session_write();

alter table public.tutor_availability_slots enable row level security;
alter table public.tutor_sessions enable row level security;

drop policy if exists "tutor_availability_slots_select_accessible" on public.tutor_availability_slots;
create policy "tutor_availability_slots_select_accessible"
on public.tutor_availability_slots
for select
to authenticated
using (
  (
    is_active = true
    and ends_at >= timezone('utc', now())
    and exists (
      select 1
      from public.tutor_profiles tp
      where tp.id = tutor_availability_slots.tutor_profile_id
        and tp.is_active = true
    )
  )
  or tutor_profile_id = public.current_active_tutor_profile_id()
);

drop policy if exists "tutor_availability_slots_insert_own" on public.tutor_availability_slots;
create policy "tutor_availability_slots_insert_own"
on public.tutor_availability_slots
for insert
to authenticated
with check (tutor_profile_id = public.current_active_tutor_profile_id());

drop policy if exists "tutor_availability_slots_update_own" on public.tutor_availability_slots;
create policy "tutor_availability_slots_update_own"
on public.tutor_availability_slots
for update
to authenticated
using (tutor_profile_id = public.current_active_tutor_profile_id())
with check (tutor_profile_id = public.current_active_tutor_profile_id());

drop policy if exists "tutor_availability_slots_delete_own" on public.tutor_availability_slots;
create policy "tutor_availability_slots_delete_own"
on public.tutor_availability_slots
for delete
to authenticated
using (tutor_profile_id = public.current_active_tutor_profile_id());

drop policy if exists "tutor_sessions_select_accessible" on public.tutor_sessions;
create policy "tutor_sessions_select_accessible"
on public.tutor_sessions
for select
to authenticated
using (
  learner_user_id = auth.uid()
  or tutor_profile_id = public.current_active_tutor_profile_id()
);

drop policy if exists "tutor_sessions_insert_learner_booking" on public.tutor_sessions;
create policy "tutor_sessions_insert_learner_booking"
on public.tutor_sessions
for insert
to authenticated
with check (
  learner_user_id = auth.uid()
  and exists (
    select 1
    from public.tutor_profiles tp
    where tp.id = tutor_sessions.tutor_profile_id
      and tp.is_active = true
  )
  and (
    availability_slot_id is null
    or exists (
      select 1
      from public.tutor_availability_slots tas
      where tas.id = tutor_sessions.availability_slot_id
        and tas.tutor_profile_id = tutor_sessions.tutor_profile_id
        and tas.is_active = true
        and tas.starts_at = tutor_sessions.scheduled_starts_at
        and tas.ends_at = tutor_sessions.scheduled_ends_at
        and not exists (
          select 1
          from public.tutor_sessions existing_session
          where existing_session.availability_slot_id = tas.id
            and existing_session.status in ('requested', 'confirmed', 'completed')
        )
    )
  )
  and (
    support_request_id is null
    or exists (
      select 1
      from public.support_requests sr
      where sr.id = tutor_sessions.support_request_id
        and sr.learner_user_id = auth.uid()
    )
  )
);

drop policy if exists "tutor_sessions_update_learner_owned" on public.tutor_sessions;
create policy "tutor_sessions_update_learner_owned"
on public.tutor_sessions
for update
to authenticated
using (learner_user_id = auth.uid())
with check (learner_user_id = auth.uid());

drop policy if exists "tutor_sessions_update_tutor_owned" on public.tutor_sessions;
create policy "tutor_sessions_update_tutor_owned"
on public.tutor_sessions
for update
to authenticated
using (tutor_profile_id = public.current_active_tutor_profile_id())
with check (tutor_profile_id = public.current_active_tutor_profile_id());

grant execute on function public.current_active_tutor_profile_id() to authenticated;
grant execute on function public.is_tutor() to authenticated;
revoke execute on function public.sync_user_role_for_tutor_profile(uuid) from authenticated;
grant select, insert, update, delete on public.tutor_availability_slots to authenticated;
grant select, insert, update on public.tutor_sessions to authenticated;
