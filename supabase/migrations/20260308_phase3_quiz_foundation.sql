create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid null references public.modules(id) on delete cascade,
  lesson_id uuid null references public.lessons(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  check (
    (module_id is not null and lesson_id is null) or
    (module_id is null and lesson_id is not null)
  )
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  explanation text not null default '',
  difficulty text not null default 'medium'
    check (difficulty in ('easy', 'medium', 'hard')),
  order_index integer not null check (order_index > 0),
  question_type text not null default 'single_choice'
    check (question_type in ('single_choice')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (quiz_id, order_index)
);

create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  order_index integer not null check (order_index > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (question_id, order_index)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score integer not null check (score >= 0 and score <= 100),
  total_questions integer not null check (total_questions >= 0),
  correct_answers integer not null check (correct_answers >= 0),
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz null
);

create table if not exists public.quiz_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  quiz_attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  selected_option_id uuid null references public.question_options(id) on delete set null,
  is_correct boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique (quiz_attempt_id, question_id)
);

create index if not exists idx_quizzes_module_id on public.quizzes(module_id);
create index if not exists idx_quizzes_lesson_id on public.quizzes(lesson_id);
create index if not exists idx_quizzes_is_published on public.quizzes(is_published);
create index if not exists idx_quiz_questions_quiz_id on public.quiz_questions(quiz_id);
create index if not exists idx_question_options_question_id on public.question_options(question_id);
create index if not exists idx_quiz_attempts_user_id on public.quiz_attempts(user_id);
create index if not exists idx_quiz_attempts_quiz_id on public.quiz_attempts(quiz_id);
create index if not exists idx_quiz_attempt_answers_attempt_id on public.quiz_attempt_answers(quiz_attempt_id);

alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.question_options enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_answers enable row level security;

drop policy if exists "quizzes_select_published_authenticated" on public.quizzes;
create policy "quizzes_select_published_authenticated"
on public.quizzes
for select
to authenticated
using (is_published = true);

revoke select on public.quiz_questions from authenticated;
revoke select on public.question_options from authenticated;

drop policy if exists "quiz_attempts_select_own" on public.quiz_attempts;
create policy "quiz_attempts_select_own"
on public.quiz_attempts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "quiz_attempts_insert_own" on public.quiz_attempts;
create policy "quiz_attempts_insert_own"
on public.quiz_attempts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "quiz_attempt_answers_select_own" on public.quiz_attempt_answers;
create policy "quiz_attempt_answers_select_own"
on public.quiz_attempt_answers
for select
to authenticated
using (
  exists (
    select 1
    from public.quiz_attempts qa
    where qa.id = quiz_attempt_id
      and qa.user_id = auth.uid()
  )
);

drop policy if exists "quiz_attempt_answers_insert_own" on public.quiz_attempt_answers;
create policy "quiz_attempt_answers_insert_own"
on public.quiz_attempt_answers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.quiz_attempts qa
    where qa.id = quiz_attempt_id
      and qa.user_id = auth.uid()
  )
);

grant select on public.quizzes to authenticated;
grant select, insert on public.quiz_attempts to authenticated;
grant select, insert on public.quiz_attempt_answers to authenticated;
