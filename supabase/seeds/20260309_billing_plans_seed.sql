insert into public.plans (
  name,
  slug,
  description,
  price_amount,
  price_currency,
  billing_interval,
  is_active,
  features_json
)
values
  (
    'Free',
    'free',
    'Core lesson access with a limited self-study preview.',
    0,
    'USD',
    'none',
    true,
    jsonb_build_object(
      'full_quiz_access', false,
      'exam_simulator_access', false,
      'lab_access', false,
      'cli_access', false,
      'tutor_support_access', false
    )
  ),
  (
    'Premium',
    'premium',
    'Full self-study access across quizzes, labs, CLI practice, and exam simulator.',
    2900,
    'USD',
    'month',
    true,
    jsonb_build_object(
      'full_quiz_access', true,
      'exam_simulator_access', true,
      'lab_access', true,
      'cli_access', true,
      'tutor_support_access', false
    )
  ),
  (
    'Tutor Plan',
    'tutor-plan',
    'Premium learning access plus tutor support and tutor directory access.',
    5900,
    'USD',
    'month',
    true,
    jsonb_build_object(
      'full_quiz_access', true,
      'exam_simulator_access', true,
      'lab_access', true,
      'cli_access', true,
      'tutor_support_access', true
    )
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  price_amount = excluded.price_amount,
  price_currency = excluded.price_currency,
  billing_interval = excluded.billing_interval,
  is_active = excluded.is_active,
  features_json = excluded.features_json;
