-- Phase 10 admin bootstrap helper
-- Replace the UUID below with an existing auth.users.id value.

update public.user_roles
set role = 'admin',
    updated_at = timezone('utc', now())
where user_id = 'YOUR_AUTH_USER_UUID';

-- Optional verification:
-- select user_id, role, created_at, updated_at
-- from public.user_roles
-- order by updated_at desc;
