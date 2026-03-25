create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price_amount integer not null default 0 check (price_amount >= 0),
  price_currency text not null default 'USD',
  billing_interval text not null default 'none'
    check (billing_interval in ('none', 'month', 'year')),
  is_active boolean not null default true,
  features_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status text not null default 'active'
    check (status in ('active', 'trialing', 'canceled', 'expired', 'past_due')),
  provider text not null default 'dev_checkout'
    check (provider in ('dev_checkout')),
  provider_customer_id text null,
  provider_subscription_id text null,
  current_period_start timestamptz null,
  current_period_end timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  provider text not null default 'dev_checkout'
    check (provider in ('dev_checkout')),
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_plans_slug on public.plans(slug);
create index if not exists idx_plans_is_active on public.plans(is_active);
create index if not exists idx_user_subscriptions_user_id on public.user_subscriptions(user_id);
create index if not exists idx_user_subscriptions_plan_id on public.user_subscriptions(plan_id);
create index if not exists idx_user_subscriptions_status on public.user_subscriptions(status);
create unique index if not exists idx_user_subscriptions_provider_subscription_id
  on public.user_subscriptions(provider_subscription_id)
  where provider_subscription_id is not null;
create index if not exists idx_payment_events_user_id on public.payment_events(user_id);
create index if not exists idx_payment_events_provider on public.payment_events(provider);
create unique index if not exists idx_payment_events_provider_event_type_token
  on public.payment_events(provider, event_type, md5(event_payload::text));

drop trigger if exists trg_user_subscriptions_updated_at on public.user_subscriptions;
create trigger trg_user_subscriptions_updated_at
before update on public.user_subscriptions
for each row
execute function public.set_updated_at_timestamp();

alter table public.plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.payment_events enable row level security;

drop policy if exists "plans_select_active_for_all_authenticated" on public.plans;
create policy "plans_select_active_for_all_authenticated"
on public.plans
for select
to authenticated
using (is_active = true);

drop policy if exists "plans_select_active_for_anon" on public.plans;
create policy "plans_select_active_for_anon"
on public.plans
for select
to anon
using (is_active = true);

drop policy if exists "user_subscriptions_select_own" on public.user_subscriptions;
create policy "user_subscriptions_select_own"
on public.user_subscriptions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_subscriptions_insert_own" on public.user_subscriptions;
create policy "user_subscriptions_insert_own"
on public.user_subscriptions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_subscriptions_update_own" on public.user_subscriptions;
create policy "user_subscriptions_update_own"
on public.user_subscriptions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "payment_events_select_own_or_unbound" on public.payment_events;
create policy "payment_events_select_own_or_unbound"
on public.payment_events
for select
to authenticated
using (user_id is null or auth.uid() = user_id);

drop policy if exists "payment_events_insert_own_or_unbound" on public.payment_events;
create policy "payment_events_insert_own_or_unbound"
on public.payment_events
for insert
to authenticated
with check (user_id is null or auth.uid() = user_id);

grant select on public.plans to anon, authenticated;
grant select, insert, update on public.user_subscriptions to authenticated;
grant select, insert on public.payment_events to authenticated;
