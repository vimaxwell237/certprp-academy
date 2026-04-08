create or replace function public.get_published_quiz_detail(target_quiz_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with eligible_quiz as (
    select
      q.id,
      q.title,
      q.slug,
      q.description,
      resolved_module.title as module_title,
      resolved_module.slug as module_slug,
      l.title as lesson_title,
      l.slug as lesson_slug,
      c.title as course_title,
      c.slug as course_slug
    from public.quizzes q
    left join public.lessons l
      on l.id = q.lesson_id
    left join public.modules resolved_module
      on resolved_module.id = coalesce(q.module_id, l.module_id)
    left join public.courses c
      on c.id = resolved_module.course_id
    left join public.certifications cert
      on cert.id = c.certification_id
    where auth.uid() is not null
      and q.slug = target_quiz_slug
      and q.is_published = true
      and resolved_module.is_published = true
      and c.is_published = true
      and cert.is_published = true
      and (
        (q.module_id is not null and q.lesson_id is null)
        or (
          q.module_id is null
          and q.lesson_id is not null
          and l.is_published = true
        )
      )
    limit 1
  )
  select jsonb_build_object(
    'id', eq.id,
    'title', eq.title,
    'slug', eq.slug,
    'description', eq.description,
    'course_title', eq.course_title,
    'course_slug', eq.course_slug,
    'module_title', eq.module_title,
    'module_slug', eq.module_slug,
    'lesson_title', eq.lesson_title,
    'lesson_slug', eq.lesson_slug,
    'questions', coalesce(questions.items, '[]'::jsonb)
  )
  from eligible_quiz eq
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id', qq.id,
        'question_text', qq.question_text,
        'difficulty', qq.difficulty,
        'order_index', qq.order_index,
        'question_type', qq.question_type,
        'question_image_path', qq.question_image_path,
        'question_image_alt', qq.question_image_alt,
        'question_image_path_secondary', qq.question_image_path_secondary,
        'question_image_alt_secondary', qq.question_image_alt_secondary,
        'options', coalesce(options.items, '[]'::jsonb)
      )
      order by qq.order_index
    ) as items
    from public.quiz_questions qq
    left join lateral (
      select jsonb_agg(
        jsonb_build_object(
          'id', qo.id,
          'option_text', qo.option_text,
          'order_index', qo.order_index
        )
        order by qo.order_index
      ) as items
      from public.question_options qo
      where qo.question_id = qq.id
    ) options
      on true
    where qq.quiz_id = eq.id
  ) questions
    on true;
$$;

create or replace function public.get_quiz_attempt_review(
  target_attempt_id uuid,
  target_quiz_slug text
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with owned_attempt as (
    select
      qa.id as attempt_id,
      qa.score,
      qa.total_questions,
      qa.correct_answers,
      qa.completed_at,
      q.id as quiz_id,
      q.title as quiz_title,
      q.slug as quiz_slug,
      q.description,
      resolved_module.title as module_title,
      resolved_module.slug as module_slug,
      c.title as course_title,
      c.slug as course_slug
    from public.quiz_attempts qa
    join public.quizzes q
      on q.id = qa.quiz_id
    left join public.lessons l
      on l.id = q.lesson_id
    left join public.modules resolved_module
      on resolved_module.id = coalesce(q.module_id, l.module_id)
    left join public.courses c
      on c.id = resolved_module.course_id
    where auth.uid() is not null
      and qa.id = target_attempt_id
      and qa.user_id = auth.uid()
      and q.slug = target_quiz_slug
    limit 1
  )
  select jsonb_build_object(
    'attempt_id', oa.attempt_id,
    'quiz_title', oa.quiz_title,
    'quiz_slug', oa.quiz_slug,
    'description', oa.description,
    'score', oa.score,
    'total_questions', oa.total_questions,
    'correct_answers', oa.correct_answers,
    'completed_at', oa.completed_at,
    'course_title', oa.course_title,
    'course_slug', oa.course_slug,
    'module_title', oa.module_title,
    'module_slug', oa.module_slug,
    'review', coalesce(review.items, '[]'::jsonb)
  )
  from owned_attempt oa
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id', qq.id,
        'question_text', qq.question_text,
        'explanation', qq.explanation,
        'difficulty', qq.difficulty,
        'question_image_path', qq.question_image_path,
        'question_image_alt', qq.question_image_alt,
        'question_image_path_secondary', qq.question_image_path_secondary,
        'question_image_alt_secondary', qq.question_image_alt_secondary,
        'is_correct', coalesce(attempt_answer.is_correct, false),
        'selected_option_id', attempt_answer.selected_option_id,
        'correct_option_id', correct_option.id,
        'options', coalesce(options.items, '[]'::jsonb)
      )
      order by qq.order_index
    ) as items
    from public.quiz_questions qq
    left join public.quiz_attempt_answers attempt_answer
      on attempt_answer.quiz_attempt_id = oa.attempt_id
      and attempt_answer.question_id = qq.id
    left join lateral (
      select qo.id
      from public.question_options qo
      where qo.question_id = qq.id
        and qo.is_correct = true
      order by qo.order_index
      limit 1
    ) correct_option
      on true
    left join lateral (
      select jsonb_agg(
        jsonb_build_object(
          'id', qo.id,
          'option_text', qo.option_text,
          'is_correct', qo.is_correct,
          'is_selected', coalesce(qo.id = attempt_answer.selected_option_id, false)
        )
        order by qo.order_index
      ) as items
      from public.question_options qo
      where qo.question_id = qq.id
    ) options
      on true
    where qq.quiz_id = oa.quiz_id
  ) review
    on true;
$$;

grant execute on function public.get_published_quiz_detail(text) to authenticated;
grant execute on function public.get_quiz_attempt_review(uuid, text) to authenticated;
