create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.tutor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  bio text not null default '',
  expertise text[] not null default '{}'::text[],
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  learner_user_id uuid not null references auth.users(id) on delete cascade,
  tutor_profile_id uuid null references public.tutor_profiles(id) on delete set null,
  subject text not null,
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
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  lesson_id uuid null references public.lessons(id) on delete set null,
  quiz_attempt_id uuid null references public.quiz_attempts(id) on delete set null,
  exam_attempt_id uuid null references public.exam_attempts(id) on delete set null,
  lab_id uuid null references public.labs(id) on delete set null,
  cli_challenge_id uuid null references public.cli_challenges(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  support_request_id uuid not null references public.support_requests(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  message_body text not null check (length(trim(message_body)) > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_tutor_profiles_user_id on public.tutor_profiles(user_id);
create index if not exists idx_tutor_profiles_is_active on public.tutor_profiles(is_active);
create index if not exists idx_support_requests_learner_user_id on public.support_requests(learner_user_id);
create index if not exists idx_support_requests_tutor_profile_id on public.support_requests(tutor_profile_id);
create index if not exists idx_support_requests_status on public.support_requests(status);
create index if not exists idx_support_requests_priority on public.support_requests(priority);
create index if not exists idx_support_requests_updated_at on public.support_requests(updated_at desc);
create index if not exists idx_support_requests_lesson_id on public.support_requests(lesson_id);
create index if not exists idx_support_requests_quiz_attempt_id on public.support_requests(quiz_attempt_id);
create index if not exists idx_support_requests_exam_attempt_id on public.support_requests(exam_attempt_id);
create index if not exists idx_support_requests_lab_id on public.support_requests(lab_id);
create index if not exists idx_support_requests_cli_challenge_id on public.support_requests(cli_challenge_id);
create index if not exists idx_support_messages_request_id on public.support_messages(support_request_id);
create index if not exists idx_support_messages_sender_user_id on public.support_messages(sender_user_id);
create index if not exists idx_support_messages_created_at on public.support_messages(created_at);

drop trigger if exists trg_support_requests_updated_at on public.support_requests;
create trigger trg_support_requests_updated_at
before update on public.support_requests
for each row
execute function public.set_updated_at_timestamp();

alter table public.tutor_profiles enable row level security;
alter table public.support_requests enable row level security;
alter table public.support_messages enable row level security;

drop policy if exists "tutor_profiles_select_active_authenticated" on public.tutor_profiles;
create policy "tutor_profiles_select_active_authenticated"
on public.tutor_profiles
for select
to authenticated
using (is_active = true);

drop policy if exists "tutor_profiles_update_own" on public.tutor_profiles;
create policy "tutor_profiles_update_own"
on public.tutor_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "support_requests_select_accessible" on public.support_requests;
create policy "support_requests_select_accessible"
on public.support_requests
for select
to authenticated
using (
  auth.uid() = learner_user_id
  or exists (
    select 1
    from public.tutor_profiles tp
    where tp.user_id = auth.uid()
      and tp.is_active = true
      and (
        tp.id = support_requests.tutor_profile_id
        or (
          support_requests.tutor_profile_id is null
          and support_requests.status in ('open', 'in_progress')
        )
      )
  )
);

drop policy if exists "support_requests_insert_own" on public.support_requests;
create policy "support_requests_insert_own"
on public.support_requests
for insert
to authenticated
with check (auth.uid() = learner_user_id);

drop policy if exists "support_requests_update_tutor_accessible" on public.support_requests;
create policy "support_requests_update_tutor_accessible"
on public.support_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.tutor_profiles tp
    where tp.user_id = auth.uid()
      and tp.is_active = true
      and (
        tp.id = support_requests.tutor_profile_id
        or (
          support_requests.tutor_profile_id is null
          and support_requests.status in ('open', 'in_progress')
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.tutor_profiles tp
    where tp.user_id = auth.uid()
      and tp.is_active = true
      and (
        support_requests.tutor_profile_id is null
        or support_requests.tutor_profile_id = tp.id
      )
  )
);

drop policy if exists "support_messages_select_accessible" on public.support_messages;
create policy "support_messages_select_accessible"
on public.support_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.support_requests sr
    where sr.id = support_messages.support_request_id
      and (
        sr.learner_user_id = auth.uid()
        or exists (
          select 1
          from public.tutor_profiles tp
          where tp.user_id = auth.uid()
            and tp.is_active = true
            and (
              tp.id = sr.tutor_profile_id
              or (
                sr.tutor_profile_id is null
                and sr.status in ('open', 'in_progress')
              )
            )
        )
      )
  )
);

drop policy if exists "support_messages_insert_accessible" on public.support_messages;
create policy "support_messages_insert_accessible"
on public.support_messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and exists (
    select 1
    from public.support_requests sr
    where sr.id = support_messages.support_request_id
      and (
        sr.learner_user_id = auth.uid()
        or exists (
          select 1
          from public.tutor_profiles tp
          where tp.user_id = auth.uid()
            and tp.is_active = true
            and (
              tp.id = sr.tutor_profile_id
              or (
                sr.tutor_profile_id is null
                and sr.status in ('open', 'in_progress')
              )
            )
        )
      )
  )
);

grant select, update on public.tutor_profiles to authenticated;
grant select, insert, update on public.support_requests to authenticated;
grant select, insert on public.support_messages to authenticated;
