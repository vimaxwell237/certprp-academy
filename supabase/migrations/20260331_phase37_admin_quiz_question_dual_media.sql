alter table public.quiz_questions
  add column if not exists question_image_path_secondary text null,
  add column if not exists question_image_alt_secondary text not null default '';

alter table public.exam_attempt_answers
  add column if not exists question_image_path_secondary_snapshot text null,
  add column if not exists question_image_alt_secondary_snapshot text not null default '';
