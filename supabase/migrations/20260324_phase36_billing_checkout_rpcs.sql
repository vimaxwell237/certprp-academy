-- Phase 36: Billing checkout RPCs for authenticated finalization

create or replace function public.record_billing_payment_event(
  p_target_user_id uuid,
  p_event_provider text,
  p_event_type text,
  p_event_payload jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is distinct from p_target_user_id then
    raise exception 'Unauthorized billing event write.';
  end if;

  begin
    insert into public.payment_events (
      user_id,
      provider,
      event_type,
      event_payload
    )
    values (
      p_target_user_id,
      p_event_provider,
      p_event_type,
      coalesce(p_event_payload, '{}'::jsonb)
    );
  exception
    when unique_violation then
      null;
  end;
end;
$$;

create or replace function public.finalize_billing_checkout(
  p_target_user_id uuid,
  p_plan_slug text,
  p_provider text,
  p_provider_customer_id text,
  p_provider_subscription_id text,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_payment_event_type text,
  p_payment_event_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan_id uuid;
  v_existing_subscription_id uuid;
  v_existing_subscription_user_id uuid;
  v_subscription_id uuid;
begin
  if auth.uid() is distinct from p_target_user_id then
    raise exception 'Unauthorized billing checkout finalization.';
  end if;

  select id
  into v_plan_id
  from public.plans
  where slug = p_plan_slug
    and is_active = true
  limit 1;

  if v_plan_id is null or p_plan_slug = 'free' then
    raise exception 'Selected billing plan is invalid for checkout finalization.';
  end if;

  if p_provider not in ('dev_checkout', 'stripe') then
    raise exception 'Unsupported billing provider: %', p_provider;
  end if;

  select id, user_id
  into v_existing_subscription_id, v_existing_subscription_user_id
  from public.user_subscriptions
  where provider_subscription_id = p_provider_subscription_id
  limit 1;

  if found and v_existing_subscription_user_id is distinct from p_target_user_id then
    raise exception 'This checkout subscription already belongs to a different user.';
  end if;

  update public.user_subscriptions
  set status = 'expired'
  where user_id = p_target_user_id
    and status in ('active', 'trialing', 'past_due')
    and (
      p_provider_subscription_id is null
      or provider_subscription_id <> p_provider_subscription_id
    );

  if v_existing_subscription_id is not null then
    update public.user_subscriptions
    set
      user_id = p_target_user_id,
      plan_id = v_plan_id,
      status = 'active',
      provider = p_provider,
      provider_customer_id = p_provider_customer_id,
      current_period_start = p_current_period_start,
      current_period_end = p_current_period_end,
      updated_at = timezone('utc', now())
    where id = v_existing_subscription_id
    returning id into v_subscription_id;
  else
    insert into public.user_subscriptions (
      user_id,
      plan_id,
      status,
      provider,
      provider_customer_id,
      provider_subscription_id,
      current_period_start,
      current_period_end
    )
    values (
      p_target_user_id,
      v_plan_id,
      'active',
      p_provider,
      p_provider_customer_id,
      p_provider_subscription_id,
      p_current_period_start,
      p_current_period_end
    )
    returning id into v_subscription_id;
  end if;

  begin
    insert into public.payment_events (
      user_id,
      provider,
      event_type,
      event_payload
    )
    values (
      p_target_user_id,
      p_provider,
      p_payment_event_type,
      coalesce(p_payment_event_payload, '{}'::jsonb)
    );
  exception
    when unique_violation then
      null;
  end;

  return v_subscription_id;
end;
$$;

revoke execute on function public.record_billing_payment_event(uuid, text, text, jsonb) from public, anon;
grant execute on function public.record_billing_payment_event(uuid, text, text, jsonb) to authenticated;

revoke execute on function public.finalize_billing_checkout(uuid, text, text, text, text, timestamptz, timestamptz, text, jsonb) from public, anon;
grant execute on function public.finalize_billing_checkout(uuid, text, text, text, text, timestamptz, timestamptz, text, jsonb) to authenticated;
