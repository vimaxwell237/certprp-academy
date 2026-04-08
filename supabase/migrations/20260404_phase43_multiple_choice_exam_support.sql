alter table public.quiz_questions
  drop constraint if exists quiz_questions_question_type_check;

alter table public.quiz_questions
  add constraint quiz_questions_question_type_check
  check (question_type in ('single_choice', 'multiple_choice', 'drag_drop_categorize'));

alter table public.exam_attempt_answers
  drop constraint if exists exam_attempt_answers_question_type_snapshot_check;

alter table public.exam_attempt_answers
  add constraint exam_attempt_answers_question_type_snapshot_check
  check (question_type_snapshot in ('single_choice', 'multiple_choice', 'drag_drop_categorize'));
