create or replace function public.start_published_exam_attempt(target_exam_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_exam_config_id uuid;
  v_exam_slug text;
  v_selection_strategy text;
  v_included_module_slugs text[];
  v_question_count integer;
  v_duration_seconds integer;
  v_attempt_id uuid;
  v_active_attempt_id uuid;
  v_active_expires_at timestamptz;
  v_inserted_answer_count integer;
  v_started_at timestamptz;
  v_expires_at timestamptz;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authenticated user is required to start an exam attempt.';
  end if;

  select
    id,
    slug,
    selection_strategy,
    included_module_slugs,
    question_count,
    time_limit_minutes * 60
  into
    v_exam_config_id,
    v_exam_slug,
    v_selection_strategy,
    v_included_module_slugs,
    v_question_count,
    v_duration_seconds
  from public.exam_configs
  where slug = target_exam_slug
    and is_published = true
  limit 1;

  if v_exam_config_id is null then
    raise exception 'Exam config was not found or is not published.';
  end if;

  select
    id,
    expires_at
  into
    v_active_attempt_id,
    v_active_expires_at
  from public.exam_attempts
  where user_id = v_user_id
    and exam_config_id = v_exam_config_id
    and status = 'in_progress'
  order by started_at desc
  limit 1;

  if v_active_attempt_id is not null then
    if timezone('utc', now()) < v_active_expires_at then
      return jsonb_build_object(
        'attempt_id', v_active_attempt_id,
        'exam_slug', v_exam_slug
      );
    end if;

    update public.exam_attempts
    set
      status = 'timed_out',
      submitted_at = coalesce(submitted_at, timezone('utc', now())),
      time_used_seconds = coalesce(time_used_seconds, duration_seconds),
      updated_at = timezone('utc', now())
    where id = v_active_attempt_id
      and status = 'in_progress';
  end if;

  v_started_at := timezone('utc', now());
  v_expires_at := v_started_at + make_interval(secs => v_duration_seconds);

  insert into public.exam_attempts (
    user_id,
    exam_config_id,
    expires_at,
    duration_seconds,
    total_questions,
    unanswered_answers
  )
  values (
    v_user_id,
    v_exam_config_id,
    v_expires_at,
    v_duration_seconds,
    greatest(v_question_count, 1),
    greatest(v_question_count, 1)
  )
  returning id into v_attempt_id;

  with module_order as (
    select
      m.slug as module_slug,
      random() as module_random_order
    from public.quizzes q
    left join public.lessons l
      on l.id = q.lesson_id
    join public.modules m
      on m.id = coalesce(q.module_id, l.module_id)
    join public.courses c
      on c.id = m.course_id
    join public.certifications cert
      on cert.id = c.certification_id
    join public.quiz_questions qq
      on qq.quiz_id = q.id
    where q.is_published = true
      and m.is_published = true
      and c.is_published = true
      and cert.is_published = true
      and (
        q.module_id is not null
        or (q.lesson_id is not null and l.is_published = true)
      )
      and (
        coalesce(array_length(v_included_module_slugs, 1), 0) = 0
        or m.slug = any(v_included_module_slugs)
      )
    group by m.slug
  ),
  question_bank as (
    select
      qq.id as question_id,
      m.slug as module_slug,
      m.title as module_title,
      qq.show_in_quiz,
      qq.question_text,
      qq.explanation,
      qq.difficulty,
      qq.question_type,
      qq.interaction_config,
      qq.question_image_path,
      qq.question_image_alt,
      qq.question_image_path_secondary,
      qq.question_image_alt_secondary,
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', qo.id,
              'optionText', qo.option_text,
              'orderIndex', qo.order_index,
              'isCorrect', qo.is_correct,
              'matchKey', qo.match_key
            )
            order by qo.order_index
          )
          from public.question_options qo
          where qo.question_id = qq.id
        ),
        '[]'::jsonb
      ) as options_snapshot,
      (
        select qo.id
        from public.question_options qo
        where qo.question_id = qq.id
          and qo.is_correct = true
        order by qo.order_index
        limit 1
      ) as correct_option_id,
      (
        case
          when qq.show_in_quiz = false then 2
          else 0
        end
        +
        case
          when qq.question_type = 'drag_drop_categorize' then 1
          else 0
        end
      ) as question_priority,
      module_order.module_random_order,
      row_number() over (
        partition by m.slug
        order by
          (
            case
              when qq.show_in_quiz = false then 2
              else 0
            end
            +
            case
              when qq.question_type = 'drag_drop_categorize' then 1
              else 0
            end
          ) desc,
          random()
      ) as module_question_order,
      random() as random_order
    from public.quizzes q
    left join public.lessons l
      on l.id = q.lesson_id
    join public.modules m
      on m.id = coalesce(q.module_id, l.module_id)
    join public.courses c
      on c.id = m.course_id
    join public.certifications cert
      on cert.id = c.certification_id
    join public.quiz_questions qq
      on qq.quiz_id = q.id
    join module_order
      on module_order.module_slug = m.slug
    where q.is_published = true
      and m.is_published = true
      and c.is_published = true
      and cert.is_published = true
      and (
        q.module_id is not null
        or (q.lesson_id is not null and l.is_published = true)
      )
      and (
        coalesce(array_length(v_included_module_slugs, 1), 0) = 0
        or m.slug = any(v_included_module_slugs)
      )
  ),
  selected_questions as (
    select *
    from question_bank
    order by
      case
        when v_selection_strategy = 'balanced'
          then module_question_order::double precision
        else 0::double precision
      end asc,
      case
        when v_selection_strategy = 'random'
          then question_priority::double precision
        else 0::double precision
      end desc,
      case
        when v_selection_strategy = 'balanced'
          then module_random_order
        else random_order
      end asc,
      random_order asc
    limit greatest(v_question_count, 1)
  ),
  inserted_rows as (
    insert into public.exam_attempt_answers (
      exam_attempt_id,
      question_id,
      question_order,
      module_slug_snapshot,
      module_title_snapshot,
      question_text_snapshot,
      explanation_snapshot,
      difficulty_snapshot,
      question_type_snapshot,
      interaction_config_snapshot,
      question_image_path_snapshot,
      question_image_alt_snapshot,
      question_image_path_secondary_snapshot,
      question_image_alt_secondary_snapshot,
      options_snapshot,
      correct_option_id
    )
    select
      v_attempt_id,
      selected_questions.question_id,
      row_number() over (
        order by
          case
            when v_selection_strategy = 'balanced'
              then selected_questions.module_question_order::double precision
            else 0::double precision
          end asc,
          case
            when v_selection_strategy = 'random'
              then selected_questions.question_priority::double precision
            else 0::double precision
          end desc,
          case
            when v_selection_strategy = 'balanced'
              then selected_questions.module_random_order
            else selected_questions.random_order
          end asc,
          selected_questions.random_order asc
      ),
      selected_questions.module_slug,
      selected_questions.module_title,
      selected_questions.question_text,
      selected_questions.explanation,
      selected_questions.difficulty,
      selected_questions.question_type,
      coalesce(selected_questions.interaction_config, '{}'::jsonb),
      selected_questions.question_image_path,
      selected_questions.question_image_alt,
      selected_questions.question_image_path_secondary,
      selected_questions.question_image_alt_secondary,
      selected_questions.options_snapshot,
      case
        when selected_questions.question_type = 'single_choice'
          then selected_questions.correct_option_id
        else null
      end
    from selected_questions
    returning id
  )
  select count(*)
  into v_inserted_answer_count
  from inserted_rows;

  if coalesce(v_inserted_answer_count, 0) = 0 then
    delete from public.exam_attempts
    where id = v_attempt_id;

    raise exception 'No published questions are available for this exam config.';
  end if;

  update public.exam_attempts
  set
    total_questions = v_inserted_answer_count,
    unanswered_answers = v_inserted_answer_count,
    updated_at = timezone('utc', now())
  where id = v_attempt_id;

  return jsonb_build_object(
    'attempt_id', v_attempt_id,
    'exam_slug', v_exam_slug
  );
end;
$$;

revoke execute on function public.start_published_exam_attempt(text) from public, anon;
grant execute on function public.start_published_exam_attempt(text) to authenticated;
