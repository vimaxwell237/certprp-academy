create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'active'
    check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.study_plan_items (
  id uuid primary key default gen_random_uuid(),
  study_plan_id uuid not null references public.study_plans(id) on delete cascade,
  item_type text not null,
  module_id uuid null references public.modules(id) on delete set null,
  lesson_id uuid null references public.lessons(id) on delete set null,
  quiz_id uuid null references public.quizzes(id) on delete set null,
  exam_config_id uuid null references public.exam_configs(id) on delete set null,
  lab_id uuid null references public.labs(id) on delete set null,
  cli_challenge_id uuid null references public.cli_challenges(id) on delete set null,
  support_request_id uuid null references public.support_requests(id) on delete set null,
  title text not null,
  description text not null default '',
  action_label text not null default 'Open',
  order_index integer not null default 1,
  is_completed boolean not null default false,
  completed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.learner_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommendation_type text not null,
  severity text not null default 'medium'
    check (severity in ('low', 'medium', 'high')),
  module_id uuid null references public.modules(id) on delete set null,
  lesson_id uuid null references public.lessons(id) on delete set null,
  quiz_id uuid null references public.quizzes(id) on delete set null,
  exam_config_id uuid null references public.exam_configs(id) on delete set null,
  lab_id uuid null references public.labs(id) on delete set null,
  cli_challenge_id uuid null references public.cli_challenges(id) on delete set null,
  support_request_id uuid null references public.support_requests(id) on delete set null,
  title text not null,
  description text not null default '',
  rationale text not null default '',
  is_dismissed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_study_plans_user_status
  on public.study_plans (user_id, status, updated_at desc);

create index if not exists idx_study_plan_items_plan_order
  on public.study_plan_items (study_plan_id, order_index);

create index if not exists idx_learner_recommendations_user_dismissed
  on public.learner_recommendations (user_id, is_dismissed, created_at desc);

create unique index if not exists idx_one_active_study_plan_per_user
  on public.study_plans (user_id)
  where status = 'active';

drop trigger if exists set_study_plans_updated_at on public.study_plans;
create trigger set_study_plans_updated_at
before update on public.study_plans
for each row
execute function public.set_updated_at_timestamp();

alter table public.study_plans enable row level security;
alter table public.study_plan_items enable row level security;
alter table public.learner_recommendations enable row level security;

drop policy if exists "Users can manage own study plans" on public.study_plans;
create policy "Users can manage own study plans"
on public.study_plans
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own study plan items" on public.study_plan_items;
create policy "Users can manage own study plan items"
on public.study_plan_items
for all
to authenticated
using (
  exists (
    select 1
    from public.study_plans
    where public.study_plans.id = study_plan_items.study_plan_id
      and public.study_plans.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.study_plans
    where public.study_plans.id = study_plan_items.study_plan_id
      and public.study_plans.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own learner recommendations" on public.learner_recommendations;
create policy "Users can manage own learner recommendations"
on public.learner_recommendations
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update, delete on public.study_plans to authenticated;
grant select, insert, update, delete on public.study_plan_items to authenticated;
grant select, insert, update, delete on public.learner_recommendations to authenticated;
