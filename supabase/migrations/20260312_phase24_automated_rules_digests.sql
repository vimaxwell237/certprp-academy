-- Phase 24: automated escalation rules and subscription digests

alter table public.operation_escalation_rules
  add column if not exists run_mode text not null default 'manual'
    check (run_mode in ('manual', 'automated')),
  add column if not exists last_run_at timestamptz null,
  add column if not exists next_run_at timestamptz null,
  add column if not exists cooldown_minutes integer not null default 30
    check (cooldown_minutes >= 0),
  add column if not exists max_matches_per_run integer not null default 25
    check (max_matches_per_run >= 1);

alter table public.operation_queue_subscriptions
  add column if not exists digest_cooldown_minutes integer not null default 180
    check (digest_cooldown_minutes >= 0),
  add column if not exists last_digest_at timestamptz null,
  add column if not exists last_digest_hash text null;

create table if not exists public.operation_escalation_rule_runs (
  id uuid primary key default gen_random_uuid(),
  operation_escalation_rule_id uuid not null references public.operation_escalation_rules(id) on delete cascade,
  triggered_by text not null check (triggered_by in ('manual', 'automation')),
  triggered_by_admin_user_id uuid null references auth.users(id) on delete set null,
  matched_count integer not null default 0 check (matched_count >= 0),
  escalated_count integer not null default 0 check (escalated_count >= 0),
  skipped_count integer not null default 0 check (skipped_count >= 0),
  run_summary text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_operation_escalation_rule_runs_rule_created_at
  on public.operation_escalation_rule_runs(operation_escalation_rule_id, created_at desc);

create table if not exists public.operation_subscription_digest_runs (
  id uuid primary key default gen_random_uuid(),
  operation_queue_subscription_id uuid not null references public.operation_queue_subscriptions(id) on delete cascade,
  match_count integer not null default 0 check (match_count >= 0),
  digest_summary text not null default '',
  delivered_via text not null default 'in_app' check (delivered_via in ('in_app')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_operation_subscription_digest_runs_subscription_created_at
  on public.operation_subscription_digest_runs(operation_queue_subscription_id, created_at desc);

alter table public.operation_escalation_rule_runs enable row level security;
alter table public.operation_subscription_digest_runs enable row level security;

drop policy if exists "operation_escalation_rule_runs_select_own_admin" on public.operation_escalation_rule_runs;
create policy "operation_escalation_rule_runs_select_own_admin"
on public.operation_escalation_rule_runs
for select
to authenticated
using (
  public.is_admin() and exists (
    select 1
    from public.operation_escalation_rules rules
    where rules.id = operation_escalation_rule_runs.operation_escalation_rule_id
      and rules.created_by_admin_user_id = auth.uid()
  )
);

drop policy if exists "operation_escalation_rule_runs_insert_own_admin" on public.operation_escalation_rule_runs;
create policy "operation_escalation_rule_runs_insert_own_admin"
on public.operation_escalation_rule_runs
for insert
to authenticated
with check (
  public.is_admin() and exists (
    select 1
    from public.operation_escalation_rules rules
    where rules.id = operation_escalation_rule_runs.operation_escalation_rule_id
      and rules.created_by_admin_user_id = auth.uid()
  )
);

drop policy if exists "operation_subscription_digest_runs_select_own_admin" on public.operation_subscription_digest_runs;
create policy "operation_subscription_digest_runs_select_own_admin"
on public.operation_subscription_digest_runs
for select
to authenticated
using (
  public.is_admin() and exists (
    select 1
    from public.operation_queue_subscriptions subscriptions
    where subscriptions.id = operation_subscription_digest_runs.operation_queue_subscription_id
      and subscriptions.admin_user_id = auth.uid()
  )
);

drop policy if exists "operation_subscription_digest_runs_insert_own_admin" on public.operation_subscription_digest_runs;
create policy "operation_subscription_digest_runs_insert_own_admin"
on public.operation_subscription_digest_runs
for insert
to authenticated
with check (
  public.is_admin() and exists (
    select 1
    from public.operation_queue_subscriptions subscriptions
    where subscriptions.id = operation_subscription_digest_runs.operation_queue_subscription_id
      and subscriptions.admin_user_id = auth.uid()
  )
);

grant select, insert on public.operation_escalation_rule_runs to authenticated;
grant select, insert on public.operation_subscription_digest_runs to authenticated;

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
      'escalated',
      'deescalated',
      'subscription_created',
      'subscription_updated',
      'subscription_deleted',
      'subscription_toggled',
      'subscription_match_notified',
      'subscription_digest_generated',
      'escalation_rule_created',
      'escalation_rule_updated',
      'escalation_rule_deleted',
      'escalation_rule_toggled',
      'escalation_rule_applied',
      'escalation_rule_run_recorded',
      'bulk_subscription_activated',
      'bulk_subscription_deactivated',
      'bulk_subscription_deleted',
      'bulk_subscription_duplicated',
      'note_added'
    )
  );
