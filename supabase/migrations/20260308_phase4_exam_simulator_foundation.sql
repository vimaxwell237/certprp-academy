create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.exam_configs (
  id uuid primary key default gen_random_uuid(),
  certification_id uuid not null references public.certifications(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text not null default '',
  exam_mode text not null
    check (exam_mode in ('full_mock', 'quick_practice', 'random_mixed')),
  selection_strategy text not null default 'random'
    check (selection_strategy in ('random', 'balanced')),
  included_module_slugs text[] not null default '{}',
  time_limit_minutes integer not null check (time_limit_minutes > 0),
  question_count integer not null check (question_count > 0),
  passing_score integer not null default 70 check (passing_score >= 0 and passing_score <= 100),
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (certification_id, title)
);

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_config_id uuid not null references public.exam_configs(id) on delete cascade,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'submitted', 'timed_out')),
  started_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null,
  submitted_at timestamptz null,
  duration_seconds integer not null check (duration_seconds > 0),
  time_used_seconds integer null check (time_used_seconds >= 0),
  total_questions integer not null check (total_questions > 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  incorrect_answers integer not null default 0 check (incorrect_answers >= 0),
  unanswered_answers integer not null default 0 check (unanswered_answers >= 0),
  flagged_count integer not null default 0 check (flagged_count >= 0),
  score integer null check (score >= 0 and score <= 100),
  current_question_index integer not null default 1 check (current_question_index > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.exam_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  exam_attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete restrict,
  selected_option_id uuid null references public.question_options(id) on delete set null,
  question_order integer not null check (question_order > 0),
  module_slug_snapshot text null,
  module_title_snapshot text null,
  question_text_snapshot text not null,
  explanation_snapshot text not null default '',
  difficulty_snapshot text not null default 'medium'
    check (difficulty_snapshot in ('easy', 'medium', 'hard')),
  question_type_snapshot text not null default 'single_choice'
    check (question_type_snapshot in ('single_choice')),
  options_snapshot jsonb not null default '[]'::jsonb,
  correct_option_id uuid null,
  flagged boolean not null default false,
  is_correct boolean null,
  answered_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (exam_attempt_id, question_id),
  unique (exam_attempt_id, question_order)
);

create index if not exists idx_exam_configs_certification_id
  on public.exam_configs(certification_id);
create index if not exists idx_exam_configs_is_published
  on public.exam_configs(is_published);
create index if not exists idx_exam_attempts_user_id
  on public.exam_attempts(user_id);
create index if not exists idx_exam_attempts_exam_config_id
  on public.exam_attempts(exam_config_id);
create index if not exists idx_exam_attempts_status
  on public.exam_attempts(status);
create index if not exists idx_exam_attempt_answers_attempt_id
  on public.exam_attempt_answers(exam_attempt_id);
create index if not exists idx_exam_attempt_answers_question_id
  on public.exam_attempt_answers(question_id);
create index if not exists idx_exam_attempt_answers_flagged
  on public.exam_attempt_answers(flagged);

drop trigger if exists trg_exam_configs_updated_at on public.exam_configs;
create trigger trg_exam_configs_updated_at
before update on public.exam_configs
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_exam_attempts_updated_at on public.exam_attempts;
create trigger trg_exam_attempts_updated_at
before update on public.exam_attempts
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_exam_attempt_answers_updated_at on public.exam_attempt_answers;
create trigger trg_exam_attempt_answers_updated_at
before update on public.exam_attempt_answers
for each row
execute function public.set_updated_at_timestamp();

alter table public.exam_configs enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_attempt_answers enable row level security;

drop policy if exists "exam_configs_select_published_authenticated" on public.exam_configs;
create policy "exam_configs_select_published_authenticated"
on public.exam_configs
for select
to authenticated
using (is_published = true);

drop policy if exists "exam_attempts_select_own" on public.exam_attempts;
create policy "exam_attempts_select_own"
on public.exam_attempts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "exam_attempts_insert_own" on public.exam_attempts;
create policy "exam_attempts_insert_own"
on public.exam_attempts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "exam_attempts_update_own" on public.exam_attempts;
create policy "exam_attempts_update_own"
on public.exam_attempts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "exam_attempt_answers_select_own" on public.exam_attempt_answers;
create policy "exam_attempt_answers_select_own"
on public.exam_attempt_answers
for select
to authenticated
using (
  exists (
    select 1
    from public.exam_attempts ea
    where ea.id = exam_attempt_id
      and ea.user_id = auth.uid()
  )
);

drop policy if exists "exam_attempt_answers_insert_own" on public.exam_attempt_answers;
create policy "exam_attempt_answers_insert_own"
on public.exam_attempt_answers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.exam_attempts ea
    where ea.id = exam_attempt_id
      and ea.user_id = auth.uid()
  )
);

drop policy if exists "exam_attempt_answers_update_own" on public.exam_attempt_answers;
create policy "exam_attempt_answers_update_own"
on public.exam_attempt_answers
for update
to authenticated
using (
  exists (
    select 1
    from public.exam_attempts ea
    where ea.id = exam_attempt_id
      and ea.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.exam_attempts ea
    where ea.id = exam_attempt_id
      and ea.user_id = auth.uid()
  )
);
