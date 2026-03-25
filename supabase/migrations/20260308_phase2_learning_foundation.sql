create extension if not exists pgcrypto;

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  certification_id uuid not null references public.certifications(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text not null default '',
  level text not null default 'associate',
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique (certification_id, title)
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  slug text not null,
  description text not null default '',
  order_index integer not null check (order_index > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (course_id, slug),
  unique (course_id, order_index)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  slug text not null,
  summary text not null default '',
  content text not null default '',
  order_index integer not null check (order_index > 0),
  estimated_minutes integer not null check (estimated_minutes > 0),
  video_url text null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (module_id, slug),
  unique (module_id, order_index)
);

create table if not exists public.user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, lesson_id)
);

create index if not exists idx_courses_certification_id on public.courses(certification_id);
create index if not exists idx_courses_is_published on public.courses(is_published);
create index if not exists idx_modules_course_id on public.modules(course_id);
create index if not exists idx_lessons_module_id on public.lessons(module_id);
create index if not exists idx_user_progress_user_id on public.user_progress(user_id);
create index if not exists idx_user_progress_lesson_id on public.user_progress(lesson_id);
create index if not exists idx_user_progress_completed on public.user_progress(completed);

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_user_progress_updated_at on public.user_progress;
create trigger trg_user_progress_updated_at
before update on public.user_progress
for each row
execute function public.set_updated_at_timestamp();

alter table public.certifications enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.user_progress enable row level security;

drop policy if exists "certifications_select_authenticated" on public.certifications;
create policy "certifications_select_authenticated"
on public.certifications
for select
to authenticated
using (true);

drop policy if exists "courses_select_authenticated" on public.courses;
create policy "courses_select_authenticated"
on public.courses
for select
to authenticated
using (true);

drop policy if exists "modules_select_authenticated" on public.modules;
create policy "modules_select_authenticated"
on public.modules
for select
to authenticated
using (true);

drop policy if exists "lessons_select_authenticated" on public.lessons;
create policy "lessons_select_authenticated"
on public.lessons
for select
to authenticated
using (true);

drop policy if exists "user_progress_select_own" on public.user_progress;
create policy "user_progress_select_own"
on public.user_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_progress_insert_own" on public.user_progress;
create policy "user_progress_insert_own"
on public.user_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_progress_update_own" on public.user_progress;
create policy "user_progress_update_own"
on public.user_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_progress_delete_own" on public.user_progress;
create policy "user_progress_delete_own"
on public.user_progress
for delete
to authenticated
using (auth.uid() = user_id);

grant select on public.certifications to authenticated;
grant select on public.courses to authenticated;
grant select on public.modules to authenticated;
grant select on public.lessons to authenticated;
grant select, insert, update, delete on public.user_progress to authenticated;

