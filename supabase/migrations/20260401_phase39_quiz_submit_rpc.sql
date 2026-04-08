create or replace function public.submit_published_quiz_attempt(
  target_quiz_slug text,
  submitted_answers jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_quiz_id uuid;
  attempt_id uuid;
  total_questions integer;
  correct_answers integer;
  score integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select q.id
  into resolved_quiz_id
  from public.quizzes q
  left join public.lessons l
    on l.id = q.lesson_id
  left join public.modules resolved_module
    on resolved_module.id = coalesce(q.module_id, l.module_id)
  left join public.courses c
    on c.id = resolved_module.course_id
  left join public.certifications cert
    on cert.id = c.certification_id
  where q.slug = target_quiz_slug
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
  limit 1;

  if resolved_quiz_id is null then
    return null;
  end if;

  with question_bank as (
    select
      qq.id as question_id,
      correct_option.id as correct_option_id,
      selected_option.id as selected_option_id
    from public.quiz_questions qq
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
      select qo.id
      from public.question_options qo
      where qo.question_id = qq.id
        and qo.id::text = nullif(coalesce(submitted_answers, '{}'::jsonb) ->> qq.id::text, '')
      limit 1
    ) selected_option
      on true
    where qq.quiz_id = resolved_quiz_id
  )
  select
    count(*)::integer,
    count(*) filter (
      where correct_option_id is not null
        and selected_option_id = correct_option_id
    )::integer
  into total_questions, correct_answers
  from question_bank;

  if coalesce(total_questions, 0) = 0 then
    raise exception 'Quiz does not contain any questions yet.';
  end if;

  score := round((correct_answers::numeric / total_questions::numeric) * 100);

  insert into public.quiz_attempts (
    user_id,
    quiz_id,
    score,
    total_questions,
    correct_answers,
    completed_at
  )
  values (
    auth.uid(),
    resolved_quiz_id,
    score,
    total_questions,
    correct_answers,
    timezone('utc', now())
  )
  returning id into attempt_id;

  insert into public.quiz_attempt_answers (
    quiz_attempt_id,
    question_id,
    selected_option_id,
    is_correct
  )
  with question_bank as (
    select
      qq.id as question_id,
      correct_option.id as correct_option_id,
      selected_option.id as selected_option_id
    from public.quiz_questions qq
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
      select qo.id
      from public.question_options qo
      where qo.question_id = qq.id
        and qo.id::text = nullif(coalesce(submitted_answers, '{}'::jsonb) ->> qq.id::text, '')
      limit 1
    ) selected_option
      on true
    where qq.quiz_id = resolved_quiz_id
  )
  select
    attempt_id,
    question_id,
    selected_option_id,
    correct_option_id is not null and selected_option_id = correct_option_id
  from question_bank;

  return jsonb_build_object(
    'attempt_id', attempt_id,
    'score', score,
    'total_questions', total_questions,
    'correct_answers', correct_answers
  );
end;
$$;

grant execute on function public.submit_published_quiz_attempt(text, jsonb) to authenticated;
