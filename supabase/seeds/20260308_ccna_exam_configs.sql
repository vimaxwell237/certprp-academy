insert into public.exam_configs (
  certification_id,
  title,
  slug,
  description,
  exam_mode,
  selection_strategy,
  included_module_slugs,
  time_limit_minutes,
  question_count,
  passing_score,
  is_published
)
select
  c.id,
  x.title,
  x.slug,
  x.description,
  x.exam_mode,
  x.selection_strategy,
  x.included_module_slugs,
  x.time_limit_minutes,
  x.question_count,
  x.passing_score,
  true
from public.certifications c
join (
  values
    (
      'CCNA Full Mock Exam',
      'ccna-full-mock-exam',
      'A longer CCNA-style mock exam that pulls questions across all current domains with a full-length timer.',
      'full_mock',
      'balanced',
      array[
        'network-fundamentals',
        'network-access',
        'ip-connectivity',
        'ip-services',
        'security-fundamentals',
        'automation-and-programmability'
      ]::text[],
      120,
      18,
      80
    ),
    (
      'CCNA Quick Practice Exam',
      'ccna-quick-practice-exam',
      'A shorter timed practice run for fast review sessions before a study block or checkpoint.',
      'quick_practice',
      'random',
      array[
        'network-fundamentals',
        'network-access',
        'ip-connectivity',
        'ip-services',
        'security-fundamentals',
        'automation-and-programmability'
      ]::text[],
      25,
      8,
      75
    ),
    (
      'CCNA Random Mixed Exam',
      'ccna-random-mixed-exam',
      'A mixed-domain exam session with randomized coverage and a moderate timer window.',
      'random_mixed',
      'balanced',
      array[
        'network-fundamentals',
        'network-access',
        'ip-connectivity',
        'ip-services',
        'security-fundamentals',
        'automation-and-programmability'
      ]::text[],
      45,
      12,
      78
    )
) as x(
  title,
  slug,
  description,
  exam_mode,
  selection_strategy,
  included_module_slugs,
  time_limit_minutes,
  question_count,
  passing_score
)
  on c.slug = 'ccna'
on conflict (slug) do update
set
  certification_id = excluded.certification_id,
  title = excluded.title,
  description = excluded.description,
  exam_mode = excluded.exam_mode,
  selection_strategy = excluded.selection_strategy,
  included_module_slugs = excluded.included_module_slugs,
  time_limit_minutes = excluded.time_limit_minutes,
  question_count = excluded.question_count,
  passing_score = excluded.passing_score,
  is_published = excluded.is_published,
  updated_at = timezone('utc', now());
