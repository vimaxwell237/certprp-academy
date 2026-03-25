-- Phase 15: Queue operations tooling and ignored delivery state

alter table public.notification_deliveries
  drop constraint if exists notification_deliveries_status_check;

alter table public.notification_deliveries
  drop constraint if exists notification_deliveries_status_valid;

alter table public.notification_deliveries
  add constraint notification_deliveries_status_valid
  check (status in ('pending', 'sent', 'failed', 'ignored'));
