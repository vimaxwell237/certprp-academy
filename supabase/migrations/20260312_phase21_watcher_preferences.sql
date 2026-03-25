-- Phase 21: richer watcher preferences and watcher-oriented execution

alter table public.operation_watchers
  add column if not exists is_muted boolean not null default false,
  add column if not exists notify_on_comment boolean not null default true,
  add column if not exists notify_on_owner_change boolean not null default true,
  add column if not exists notify_on_workflow_change boolean not null default true,
  add column if not exists notify_on_resolve boolean not null default true,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

drop trigger if exists trg_operation_watchers_updated_at on public.operation_watchers;
create trigger trg_operation_watchers_updated_at
before update on public.operation_watchers
for each row
execute function public.set_updated_at_timestamp();

drop policy if exists "operation_watchers_update_own_admin" on public.operation_watchers;
create policy "operation_watchers_update_own_admin"
on public.operation_watchers
for update
to authenticated
using (public.is_admin() and admin_user_id = auth.uid())
with check (public.is_admin() and admin_user_id = auth.uid());

grant update on public.operation_watchers to authenticated;

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
      'watch_started',
      'watch_removed',
      'watch_preferences_updated',
      'note_added'
    )
  );
