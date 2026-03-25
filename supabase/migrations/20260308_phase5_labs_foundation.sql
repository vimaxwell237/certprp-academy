create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.labs (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  lesson_id uuid null references public.lessons(id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text not null default '',
  objectives text not null default '',
  instructions text not null default '',
  topology_notes text null,
  expected_outcomes text not null default '',
  difficulty text not null default 'intermediate'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  estimated_minutes integer not null check (estimated_minutes > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (module_id, title)
);

create table if not exists public.lab_files (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid not null references public.labs(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text not null default 'packet_tracer'
    check (file_type in ('packet_tracer', 'guide', 'topology', 'solution', 'reference')),
  sort_order integer not null default 1 check (sort_order > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (lab_id, sort_order)
);

create table if not exists public.lab_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lab_id uuid not null references public.labs(id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz null,
  notes text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, lab_id)
);

create index if not exists idx_labs_module_id on public.labs(module_id);
create index if not exists idx_labs_lesson_id on public.labs(lesson_id);
create index if not exists idx_labs_is_published on public.labs(is_published);
create index if not exists idx_lab_files_lab_id on public.lab_files(lab_id);
create index if not exists idx_lab_progress_user_id on public.lab_progress(user_id);
create index if not exists idx_lab_progress_lab_id on public.lab_progress(lab_id);
create index if not exists idx_lab_progress_status on public.lab_progress(status);

drop trigger if exists trg_labs_updated_at on public.labs;
create trigger trg_labs_updated_at
before update on public.labs
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_lab_progress_updated_at on public.lab_progress;
create trigger trg_lab_progress_updated_at
before update on public.lab_progress
for each row
execute function public.set_updated_at_timestamp();

alter table public.labs enable row level security;
alter table public.lab_files enable row level security;
alter table public.lab_progress enable row level security;

drop policy if exists "labs_select_published_authenticated" on public.labs;
create policy "labs_select_published_authenticated"
on public.labs
for select
to authenticated
using (is_published = true);

revoke select on public.lab_files from authenticated;

drop policy if exists "lab_progress_select_own" on public.lab_progress;
create policy "lab_progress_select_own"
on public.lab_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "lab_progress_insert_own" on public.lab_progress;
create policy "lab_progress_insert_own"
on public.lab_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "lab_progress_update_own" on public.lab_progress;
create policy "lab_progress_update_own"
on public.lab_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lab-files',
  'lab-files',
  false,
  52428800,
  array[
    'application/octet-stream',
    'application/pdf',
    'application/zip',
    'text/plain'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "lab_storage_select_authenticated" on storage.objects;
