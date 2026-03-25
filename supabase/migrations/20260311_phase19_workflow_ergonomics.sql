-- Phase 19: operator workflow ergonomics and collaboration

create table if not exists public.operation_saved_views (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null
    check (entity_type in ('notification_delivery', 'scheduled_job')),
  name text not null check (length(trim(name)) > 0),
  filters_json jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_operation_saved_views_default_unique
  on public.operation_saved_views(admin_user_id, entity_type)
  where is_default = true;

create index if not exists idx_operation_saved_views_admin_entity_updated_at
  on public.operation_saved_views(admin_user_id, entity_type, updated_at desc);

create table if not exists public.operation_comments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('notification_delivery', 'scheduled_job')),
  entity_id uuid not null,
  admin_user_id uuid not null references auth.users(id) on delete restrict,
  comment_body text not null check (char_length(trim(comment_body)) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_operation_comments_entity_created_at
  on public.operation_comments(entity_type, entity_id, created_at desc);

create index if not exists idx_operation_comments_admin_created_at
  on public.operation_comments(admin_user_id, created_at desc);

drop trigger if exists trg_operation_saved_views_updated_at on public.operation_saved_views;
create trigger trg_operation_saved_views_updated_at
before update on public.operation_saved_views
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_operation_comments_updated_at on public.operation_comments;
create trigger trg_operation_comments_updated_at
before update on public.operation_comments
for each row
execute function public.set_updated_at_timestamp();

alter table public.operation_saved_views enable row level security;
alter table public.operation_comments enable row level security;

drop policy if exists "operation_saved_views_select_own_admin" on public.operation_saved_views;
create policy "operation_saved_views_select_own_admin"
on public.operation_saved_views
for select
to authenticated
using (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "operation_saved_views_insert_own_admin" on public.operation_saved_views;
create policy "operation_saved_views_insert_own_admin"
on public.operation_saved_views
for insert
to authenticated
with check (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "operation_saved_views_update_own_admin" on public.operation_saved_views;
create policy "operation_saved_views_update_own_admin"
on public.operation_saved_views
for update
to authenticated
using (public.is_admin() and admin_user_id = auth.uid())
with check (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "operation_saved_views_delete_own_admin" on public.operation_saved_views;
create policy "operation_saved_views_delete_own_admin"
on public.operation_saved_views
for delete
to authenticated
using (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "operation_comments_select_admin" on public.operation_comments;
create policy "operation_comments_select_admin"
on public.operation_comments
for select
to authenticated
using (public.is_admin());

drop policy if exists "operation_comments_insert_admin" on public.operation_comments;
create policy "operation_comments_insert_admin"
on public.operation_comments
for insert
to authenticated
with check (public.is_admin());

grant select, insert, update, delete on public.operation_saved_views to authenticated;
grant select, insert on public.operation_comments to authenticated;

alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (
    type in (
      'session_booked',
      'session_confirmed',
      'session_canceled',
      'session_reminder',
      'session_completed',
      'followup_added',
      'operator_mentioned'
    )
  );

alter table public.operation_audit_events
  drop constraint if exists operation_audit_events_event_type_check;

alter table public.operation_audit_events
  add constraint operation_audit_events_event_type_check
  check (
    event_type in (
      'retry_requested',
      'force_retry_requested',
      'ignored',
      'canceled',
      'replay_requested',
      'claimed',
      'released',
      'reassigned',
      'bulk_claimed',
      'bulk_released',
      'bulk_reassigned',
      'status_changed',
      'workflow_state_changed',
      'comment_added',
      'note_added'
    )
  );
