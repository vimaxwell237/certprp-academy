create table if not exists public.subnetting_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  network text not null,
  prefix integer not null check (prefix >= 0 and prefix <= 32),
  correct boolean not null default false,
  score integer not null default 0 check (score >= 0 and score <= 100),
  time_taken integer not null default 0 check (time_taken >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_subnetting_attempts_user_id
  on public.subnetting_attempts(user_id);

create index if not exists idx_subnetting_attempts_created_at
  on public.subnetting_attempts(created_at desc);

alter table public.subnetting_attempts enable row level security;

drop policy if exists "subnetting_attempts_select_own" on public.subnetting_attempts;
create policy "subnetting_attempts_select_own"
on public.subnetting_attempts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "subnetting_attempts_insert_own" on public.subnetting_attempts;
create policy "subnetting_attempts_insert_own"
on public.subnetting_attempts
for insert
to authenticated
with check (auth.uid() = user_id);
