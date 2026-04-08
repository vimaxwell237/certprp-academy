alter table public.quiz_questions
  add column if not exists question_image_path text null,
  add column if not exists question_image_alt text not null default '';

alter table public.exam_attempt_answers
  add column if not exists question_image_path_snapshot text null,
  add column if not exists question_image_alt_snapshot text not null default '';

drop policy if exists "quiz_questions_admin_all" on public.quiz_questions;
create policy "quiz_questions_admin_all"
on public.quiz_questions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "question_options_admin_all" on public.question_options;
create policy "question_options_admin_all"
on public.question_options
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select, insert, update, delete on public.quiz_questions to authenticated;
grant select, insert, update, delete on public.question_options to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quiz-question-images',
  'quiz-question-images',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "quiz_question_images_select_authenticated" on storage.objects;
create policy "quiz_question_images_select_authenticated"
on storage.objects
for select
to authenticated
using (bucket_id = 'quiz-question-images');

drop policy if exists "quiz_question_images_admin_insert" on storage.objects;
create policy "quiz_question_images_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'quiz-question-images'
  and public.is_admin()
);

drop policy if exists "quiz_question_images_admin_update" on storage.objects;
create policy "quiz_question_images_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'quiz-question-images'
  and public.is_admin()
)
with check (
  bucket_id = 'quiz-question-images'
  and public.is_admin()
);

drop policy if exists "quiz_question_images_admin_delete" on storage.objects;
create policy "quiz_question_images_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'quiz-question-images'
  and public.is_admin()
);
