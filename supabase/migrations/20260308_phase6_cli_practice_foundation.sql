create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.cli_challenges (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  lesson_id uuid null references public.lessons(id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text not null default '',
  scenario text not null default '',
  objectives text not null default '',
  difficulty text not null default 'intermediate'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  estimated_minutes integer not null check (estimated_minutes > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (module_id, title)
);

create table if not exists public.cli_steps (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.cli_challenges(id) on delete cascade,
  step_number integer not null check (step_number > 0),
  prompt text not null,
  expected_command_patterns jsonb not null default '[]'::jsonb,
  validation_type text not null default 'normalized'
    check (validation_type in ('exact', 'normalized', 'pattern')),
  hints text null,
  explanation text null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (challenge_id, step_number)
);

create table if not exists public.cli_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null references public.cli_challenges(id) on delete cascade,
  status text not null default 'in_progress'
    check (status in ('not_started', 'in_progress', 'completed')),
  current_step integer not null default 1 check (current_step > 0),
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cli_attempt_step_results (
  id uuid primary key default gen_random_uuid(),
  cli_attempt_id uuid not null references public.cli_attempts(id) on delete cascade,
  cli_step_id uuid not null references public.cli_steps(id) on delete cascade,
  entered_command text not null,
  is_correct boolean not null default false,
  feedback text not null default '',
  answered_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_cli_challenges_module_id on public.cli_challenges(module_id);
create index if not exists idx_cli_challenges_lesson_id on public.cli_challenges(lesson_id);
create index if not exists idx_cli_challenges_is_published on public.cli_challenges(is_published);
create index if not exists idx_cli_steps_challenge_id on public.cli_steps(challenge_id);
create index if not exists idx_cli_attempts_user_id on public.cli_attempts(user_id);
create index if not exists idx_cli_attempts_challenge_id on public.cli_attempts(challenge_id);
create index if not exists idx_cli_attempts_status on public.cli_attempts(status);
create index if not exists idx_cli_attempt_step_results_attempt_id on public.cli_attempt_step_results(cli_attempt_id);
create index if not exists idx_cli_attempt_step_results_step_id on public.cli_attempt_step_results(cli_step_id);

drop trigger if exists trg_cli_challenges_updated_at on public.cli_challenges;
create trigger trg_cli_challenges_updated_at
before update on public.cli_challenges
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_cli_attempts_updated_at on public.cli_attempts;
create trigger trg_cli_attempts_updated_at
before update on public.cli_attempts
for each row
execute function public.set_updated_at_timestamp();

alter table public.cli_challenges enable row level security;
alter table public.cli_steps enable row level security;
alter table public.cli_attempts enable row level security;
alter table public.cli_attempt_step_results enable row level security;

drop policy if exists "cli_challenges_select_published_authenticated" on public.cli_challenges;
create policy "cli_challenges_select_published_authenticated"
on public.cli_challenges
for select
to authenticated
using (is_published = true);

revoke select on public.cli_steps from authenticated;

drop policy if exists "cli_attempts_select_own" on public.cli_attempts;
create policy "cli_attempts_select_own"
on public.cli_attempts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "cli_attempts_insert_own" on public.cli_attempts;
create policy "cli_attempts_insert_own"
on public.cli_attempts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "cli_attempts_update_own" on public.cli_attempts;
create policy "cli_attempts_update_own"
on public.cli_attempts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "cli_attempt_step_results_select_own" on public.cli_attempt_step_results;
create policy "cli_attempt_step_results_select_own"
on public.cli_attempt_step_results
for select
to authenticated
using (
  exists (
    select 1
    from public.cli_attempts
    where cli_attempts.id = cli_attempt_id
      and cli_attempts.user_id = auth.uid()
  )
);

drop policy if exists "cli_attempt_step_results_insert_own" on public.cli_attempt_step_results;
create policy "cli_attempt_step_results_insert_own"
on public.cli_attempt_step_results
for insert
to authenticated
with check (
  exists (
    select 1
    from public.cli_attempts
    where cli_attempts.id = cli_attempt_id
      and cli_attempts.user_id = auth.uid()
  )
);
