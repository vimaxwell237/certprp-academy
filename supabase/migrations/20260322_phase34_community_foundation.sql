create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_user_id uuid not null references auth.users(id) on delete cascade,
  author_display_name text not null,
  author_role text not null default 'learner'
    check (author_role in ('learner', 'tutor')),
  subject text not null check (length(trim(subject)) > 0),
  topic text not null default 'general'
    check (
      topic in (
        'general',
        'lesson_help',
        'subnetting',
        'routing',
        'switching',
        'wireless',
        'labs'
      )
    ),
  message_body text not null check (length(trim(message_body)) > 0),
  lesson_id uuid null references public.lessons(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.community_replies (
  id uuid primary key default gen_random_uuid(),
  community_post_id uuid not null references public.community_posts(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  author_display_name text not null,
  author_role text not null default 'learner'
    check (author_role in ('learner', 'tutor')),
  message_body text not null check (length(trim(message_body)) > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_community_posts_author_user_id
  on public.community_posts(author_user_id);

create index if not exists idx_community_posts_topic
  on public.community_posts(topic);

create index if not exists idx_community_posts_lesson_id
  on public.community_posts(lesson_id);

create index if not exists idx_community_posts_updated_at
  on public.community_posts(updated_at desc);

create index if not exists idx_community_replies_post_id
  on public.community_replies(community_post_id);

create index if not exists idx_community_replies_author_user_id
  on public.community_replies(author_user_id);

create index if not exists idx_community_replies_created_at
  on public.community_replies(created_at);

drop trigger if exists trg_community_posts_updated_at on public.community_posts;
create trigger trg_community_posts_updated_at
before update on public.community_posts
for each row
execute function public.set_updated_at_timestamp();

create or replace function public.touch_community_post_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.community_posts
  set updated_at = timezone('utc', now())
  where id = new.community_post_id;

  return new;
end;
$$;

drop trigger if exists trg_community_posts_touch_from_reply on public.community_replies;
create trigger trg_community_posts_touch_from_reply
after insert on public.community_replies
for each row
execute function public.touch_community_post_updated_at();

alter table public.community_posts enable row level security;
alter table public.community_replies enable row level security;

drop policy if exists "community_posts_select_authenticated" on public.community_posts;
create policy "community_posts_select_authenticated"
on public.community_posts
for select
to authenticated
using (true);

drop policy if exists "community_posts_insert_own" on public.community_posts;
create policy "community_posts_insert_own"
on public.community_posts
for insert
to authenticated
with check (auth.uid() = author_user_id);

drop policy if exists "community_posts_update_own" on public.community_posts;
create policy "community_posts_update_own"
on public.community_posts
for update
to authenticated
using (auth.uid() = author_user_id)
with check (auth.uid() = author_user_id);

drop policy if exists "community_replies_select_authenticated" on public.community_replies;
create policy "community_replies_select_authenticated"
on public.community_replies
for select
to authenticated
using (true);

drop policy if exists "community_replies_insert_own" on public.community_replies;
create policy "community_replies_insert_own"
on public.community_replies
for insert
to authenticated
with check (
  auth.uid() = author_user_id
  and exists (
    select 1
    from public.community_posts cp
    where cp.id = community_replies.community_post_id
  )
);

grant select, insert, update on public.community_posts to authenticated;
grant select, insert on public.community_replies to authenticated;
