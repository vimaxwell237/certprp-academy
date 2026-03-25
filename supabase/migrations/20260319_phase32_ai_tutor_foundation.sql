create table if not exists public.ai_tutor_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  response text not null,
  lesson_context text null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_ai_tutor_sessions_user_id
  on public.ai_tutor_sessions(user_id);

create index if not exists idx_ai_tutor_sessions_created_at
  on public.ai_tutor_sessions(created_at desc);

alter table public.ai_tutor_sessions enable row level security;

drop policy if exists "ai_tutor_sessions_select_own" on public.ai_tutor_sessions;
create policy "ai_tutor_sessions_select_own"
on public.ai_tutor_sessions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "ai_tutor_sessions_insert_own" on public.ai_tutor_sessions;
create policy "ai_tutor_sessions_insert_own"
on public.ai_tutor_sessions
for insert
to authenticated
with check (auth.uid() = user_id);
