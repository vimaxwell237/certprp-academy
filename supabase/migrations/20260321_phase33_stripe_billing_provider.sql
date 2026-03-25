alter table public.user_subscriptions
drop constraint if exists user_subscriptions_provider_check;

alter table public.user_subscriptions
add constraint user_subscriptions_provider_check
check (provider in ('dev_checkout', 'stripe'));

alter table public.payment_events
drop constraint if exists payment_events_provider_check;

alter table public.payment_events
add constraint payment_events_provider_check
check (provider in ('dev_checkout', 'stripe'));
