-- Phase 10: Admin authorization and content operations foundation

create extension if not exists pgcrypto;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'learner'
    check (role in ('admin', 'tutor', 'learner')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_user_roles_role on public.user_roles(role);

alter table public.user_roles enable row level security;

create or replace function public.get_app_role(target_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select role
      from public.user_roles
      where user_id = target_user_id
      limit 1
    ),
    'learner'
  );
$$;

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.get_app_role(auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'admin';
$$;

create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'learner')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_auth_user_role on auth.users;
create trigger trg_auth_user_role
after insert on auth.users
for each row
execute function public.handle_new_user_role();

insert into public.user_roles (user_id, role)
select id, 'learner'
from auth.users
on conflict (user_id) do nothing;

update public.user_roles
set role = 'tutor',
    updated_at = timezone('utc', now())
where role = 'learner'
  and user_id in (
    select user_id
    from public.tutor_profiles
  );

drop policy if exists "user_roles_select_self_or_admin" on public.user_roles;
create policy "user_roles_select_self_or_admin"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "user_roles_admin_insert" on public.user_roles;
create policy "user_roles_admin_insert"
on public.user_roles
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "user_roles_admin_update" on public.user_roles;
create policy "user_roles_admin_update"
on public.user_roles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "user_roles_admin_delete" on public.user_roles;
create policy "user_roles_admin_delete"
on public.user_roles
for delete
to authenticated
using (public.is_admin());

grant select, insert, update, delete on public.user_roles to authenticated;
grant execute on function public.get_app_role(uuid) to authenticated;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.certifications
  add column if not exists is_published boolean not null default false;

alter table public.modules
  add column if not exists is_published boolean not null default false;

alter table public.lessons
  add column if not exists is_published boolean not null default false;

create index if not exists idx_certifications_is_published on public.certifications(is_published);
create index if not exists idx_modules_is_published on public.modules(is_published);
create index if not exists idx_lessons_is_published on public.lessons(is_published);

update public.certifications
set is_published = true
where exists (
  select 1
  from public.courses
  where courses.certification_id = certifications.id
    and courses.is_published = true
);

update public.modules
set is_published = true
where exists (
  select 1
  from public.courses
  where courses.id = modules.course_id
    and courses.is_published = true
);

update public.lessons
set is_published = true
where exists (
  select 1
  from public.modules
  where modules.id = lessons.module_id
    and modules.is_published = true
);

drop policy if exists "certifications_select_authenticated" on public.certifications;
drop policy if exists "courses_select_authenticated" on public.courses;
drop policy if exists "modules_select_authenticated" on public.modules;
drop policy if exists "lessons_select_authenticated" on public.lessons;
drop policy if exists "quizzes_select_published_authenticated" on public.quizzes;
drop policy if exists "labs_select_published_authenticated" on public.labs;
drop policy if exists "cli_challenges_select_published_authenticated" on public.cli_challenges;
drop policy if exists "tutor_profiles_select_active_authenticated" on public.tutor_profiles;
drop policy if exists "plans_select_active_for_all_authenticated" on public.plans;

create policy "certifications_select_published_authenticated"
on public.certifications
for select
to authenticated
using (is_published = true);

create policy "courses_select_published_authenticated"
on public.courses
for select
to authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.certifications
    where certifications.id = certification_id
      and certifications.is_published = true
  )
);

create policy "modules_select_published_authenticated"
on public.modules
for select
to authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.courses
    join public.certifications
      on certifications.id = courses.certification_id
    where courses.id = course_id
      and courses.is_published = true
      and certifications.is_published = true
  )
);

create policy "lessons_select_published_authenticated"
on public.lessons
for select
to authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.modules
    join public.courses
      on courses.id = modules.course_id
    join public.certifications
      on certifications.id = courses.certification_id
    where modules.id = module_id
      and modules.is_published = true
      and courses.is_published = true
      and certifications.is_published = true
  )
);

create policy "quizzes_select_published_authenticated"
on public.quizzes
for select
to authenticated
using (
  is_published = true
  and (
    (
      module_id is not null
      and exists (
        select 1
        from public.modules
        join public.courses
          on courses.id = modules.course_id
        join public.certifications
          on certifications.id = courses.certification_id
        where modules.id = quizzes.module_id
          and modules.is_published = true
          and courses.is_published = true
          and certifications.is_published = true
      )
    )
    or
    (
      lesson_id is not null
      and exists (
        select 1
        from public.lessons
        join public.modules
          on modules.id = lessons.module_id
        join public.courses
          on courses.id = modules.course_id
        join public.certifications
          on certifications.id = courses.certification_id
        where lessons.id = quizzes.lesson_id
          and lessons.is_published = true
          and modules.is_published = true
          and courses.is_published = true
          and certifications.is_published = true
      )
    )
  )
);

create policy "labs_select_published_authenticated"
on public.labs
for select
to authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.modules
    join public.courses
      on courses.id = modules.course_id
    join public.certifications
      on certifications.id = courses.certification_id
    where modules.id = labs.module_id
      and modules.is_published = true
      and courses.is_published = true
      and certifications.is_published = true
  )
  and (
    lesson_id is null
    or exists (
      select 1
      from public.lessons
      where lessons.id = labs.lesson_id
        and lessons.is_published = true
    )
  )
);

create policy "cli_challenges_select_published_authenticated"
on public.cli_challenges
for select
to authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.modules
    join public.courses
      on courses.id = modules.course_id
    join public.certifications
      on certifications.id = courses.certification_id
    where modules.id = cli_challenges.module_id
      and modules.is_published = true
      and courses.is_published = true
      and certifications.is_published = true
  )
  and (
    lesson_id is null
    or exists (
      select 1
      from public.lessons
      where lessons.id = cli_challenges.lesson_id
        and lessons.is_published = true
    )
  )
);

create policy "tutor_profiles_select_active_authenticated"
on public.tutor_profiles
for select
to authenticated
using (is_active = true);

create policy "plans_select_active_for_all_authenticated"
on public.plans
for select
to authenticated
using (is_active = true);

drop policy if exists "certifications_admin_all" on public.certifications;
create policy "certifications_admin_all"
on public.certifications
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "courses_admin_all" on public.courses;
create policy "courses_admin_all"
on public.courses
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "modules_admin_all" on public.modules;
create policy "modules_admin_all"
on public.modules
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "lessons_admin_all" on public.lessons;
create policy "lessons_admin_all"
on public.lessons
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "quizzes_admin_all" on public.quizzes;
create policy "quizzes_admin_all"
on public.quizzes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "labs_admin_all" on public.labs;
create policy "labs_admin_all"
on public.labs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "cli_challenges_admin_all" on public.cli_challenges;
create policy "cli_challenges_admin_all"
on public.cli_challenges
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "tutor_profiles_admin_all" on public.tutor_profiles;
create policy "tutor_profiles_admin_all"
on public.tutor_profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "plans_admin_all" on public.plans;
create policy "plans_admin_all"
on public.plans
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select, insert, update, delete on public.certifications to authenticated;
grant select, insert, update, delete on public.courses to authenticated;
grant select, insert, update, delete on public.modules to authenticated;
grant select, insert, update, delete on public.lessons to authenticated;
grant select, insert, update, delete on public.quizzes to authenticated;
grant select, insert, update, delete on public.labs to authenticated;
grant select, insert, update, delete on public.cli_challenges to authenticated;
grant select, insert, update, delete on public.tutor_profiles to authenticated;
grant select, insert, update, delete on public.plans to authenticated;

-- After running this migration, promote at least one account manually:
-- update public.user_roles
-- set role = 'admin'
-- where user_id = 'YOUR_AUTH_USER_UUID';
