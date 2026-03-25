with ranked_users as (
  select
    id,
    email,
    row_number() over (order by created_at asc) as row_num
  from auth.users
)
insert into public.tutor_profiles (
  user_id,
  display_name,
  bio,
  expertise,
  is_active
)
select
  ranked_users.id,
  case ranked_users.row_num
    when 1 then 'Amina Okafor'
    when 2 then 'Marcus Lee'
    else concat('Tutor ', ranked_users.row_num)
  end,
  case ranked_users.row_num
    when 1 then 'CCNA mentor focused on routing fundamentals, subnetting, and hands-on troubleshooting.'
    when 2 then 'Network support coach focused on switching, security baselines, and exam readiness.'
    else 'CertPrep Academy development tutor profile.'
  end,
  case ranked_users.row_num
    when 1 then array['CCNA', 'Routing', 'OSPF', 'Troubleshooting']::text[]
    when 2 then array['CCNA', 'Switching', 'Security', 'Labs']::text[]
    else array['CCNA']::text[]
  end,
  true
from ranked_users
where ranked_users.row_num <= 2
on conflict (user_id) do update
set
  display_name = excluded.display_name,
  bio = excluded.bio,
  expertise = excluded.expertise,
  is_active = excluded.is_active;
