-- Phase 35: RLS hardening for learner-owned, billing, and community data

drop policy if exists "user_progress_insert_own" on public.user_progress;
create policy "user_progress_insert_own"
on public.user_progress
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.lessons l
    where l.id = user_progress.lesson_id
      and l.is_published = true
  )
);

drop policy if exists "user_progress_update_own" on public.user_progress;
create policy "user_progress_update_own"
on public.user_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.lessons l
    where l.id = user_progress.lesson_id
      and l.is_published = true
  )
);

drop policy if exists "lab_progress_insert_own" on public.lab_progress;
create policy "lab_progress_insert_own"
on public.lab_progress
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.labs l
    where l.id = lab_progress.lab_id
      and l.is_published = true
  )
);

drop policy if exists "lab_progress_update_own" on public.lab_progress;
create policy "lab_progress_update_own"
on public.lab_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.labs l
    where l.id = lab_progress.lab_id
      and l.is_published = true
  )
);

drop policy if exists "quiz_attempts_insert_own" on public.quiz_attempts;
create policy "quiz_attempts_insert_own"
on public.quiz_attempts
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.quizzes q
    where q.id = quiz_attempts.quiz_id
      and q.is_published = true
  )
);

drop policy if exists "exam_attempts_insert_own" on public.exam_attempts;
create policy "exam_attempts_insert_own"
on public.exam_attempts
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.exam_configs ec
    where ec.id = exam_attempts.exam_config_id
      and ec.is_published = true
  )
);

drop policy if exists "support_requests_insert_own" on public.support_requests;
create policy "support_requests_insert_own"
on public.support_requests
for insert
to authenticated
with check (
  auth.uid() = learner_user_id
  and (
    tutor_profile_id is null
    or exists (
      select 1
      from public.tutor_profiles tp
      where tp.id = support_requests.tutor_profile_id
        and tp.is_active = true
    )
  )
  and (
    lesson_id is null
    or exists (
      select 1
      from public.lessons l
      where l.id = support_requests.lesson_id
        and l.is_published = true
    )
  )
  and (
    quiz_attempt_id is null
    or exists (
      select 1
      from public.quiz_attempts qa
      where qa.id = support_requests.quiz_attempt_id
        and qa.user_id = auth.uid()
    )
  )
  and (
    exam_attempt_id is null
    or exists (
      select 1
      from public.exam_attempts ea
      where ea.id = support_requests.exam_attempt_id
        and ea.user_id = auth.uid()
    )
  )
  and (
    lab_id is null
    or exists (
      select 1
      from public.labs l
      where l.id = support_requests.lab_id
        and l.is_published = true
    )
  )
  and (
    cli_challenge_id is null
    or exists (
      select 1
      from public.cli_challenges challenge
      where challenge.id = support_requests.cli_challenge_id
        and challenge.is_published = true
    )
  )
);

drop policy if exists "user_subscriptions_insert_own" on public.user_subscriptions;
drop policy if exists "user_subscriptions_update_own" on public.user_subscriptions;
revoke insert, update on public.user_subscriptions from authenticated;
grant select on public.user_subscriptions to authenticated;

drop policy if exists "payment_events_select_own_or_unbound" on public.payment_events;
drop policy if exists "payment_events_select_own" on public.payment_events;
drop policy if exists "payment_events_insert_own_or_unbound" on public.payment_events;
drop policy if exists "payment_events_insert_own" on public.payment_events;
revoke select, insert on public.payment_events from authenticated;

drop policy if exists "community_posts_insert_own" on public.community_posts;
create policy "community_posts_insert_own"
on public.community_posts
for insert
to authenticated
with check (
  auth.uid() = author_user_id
  and author_role = case
    when public.current_app_role() = 'tutor' then 'tutor'
    else 'learner'
  end
  and (
    lesson_id is null
    or exists (
      select 1
      from public.lessons l
      where l.id = community_posts.lesson_id
        and l.is_published = true
    )
  )
);

drop policy if exists "community_posts_update_own" on public.community_posts;
create policy "community_posts_update_own"
on public.community_posts
for update
to authenticated
using (auth.uid() = author_user_id)
with check (
  auth.uid() = author_user_id
  and author_role = case
    when public.current_app_role() = 'tutor' then 'tutor'
    else 'learner'
  end
  and (
    lesson_id is null
    or exists (
      select 1
      from public.lessons l
      where l.id = community_posts.lesson_id
        and l.is_published = true
    )
  )
);

drop policy if exists "community_replies_insert_own" on public.community_replies;
create policy "community_replies_insert_own"
on public.community_replies
for insert
to authenticated
with check (
  auth.uid() = author_user_id
  and author_role = case
    when public.current_app_role() = 'tutor' then 'tutor'
    else 'learner'
  end
  and exists (
    select 1
    from public.community_posts cp
    where cp.id = community_replies.community_post_id
  )
);

drop policy if exists "lab_storage_select_authenticated" on storage.objects;
drop policy if exists "lab_storage_select_published_lab_files" on storage.objects;

revoke execute on function public.get_app_role(uuid) from public, anon, authenticated;
revoke execute on function public.current_app_role() from public, anon;
grant execute on function public.current_app_role() to authenticated;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke execute on function public.current_active_tutor_profile_id() from public, anon;
grant execute on function public.current_active_tutor_profile_id() to authenticated;
revoke execute on function public.is_tutor() from public, anon;
grant execute on function public.is_tutor() to authenticated;

revoke execute on function public.handle_new_user_role() from public, anon, authenticated;
revoke execute on function public.sync_user_role_for_tutor_profile(uuid) from public, anon, authenticated;
revoke execute on function public.handle_tutor_profile_role_sync() from public, anon, authenticated;
revoke execute on function public.insert_notification_record(uuid, text, text, text, text, text, text, uuid) from public, anon, authenticated;
revoke execute on function public.validate_tutor_session_followup_write() from public, anon, authenticated;
revoke execute on function public.handle_tutor_session_notifications() from public, anon, authenticated;
revoke execute on function public.handle_tutor_session_followup_notifications() from public, anon, authenticated;
revoke execute on function public.enqueue_notification_delivery_record() from public, anon, authenticated;
revoke execute on function public.upsert_scheduled_job(uuid, text, text, uuid, timestamptz, jsonb, text) from public, anon, authenticated;
revoke execute on function public.cancel_pending_jobs_for_entity(uuid, text, uuid, text) from public, anon, authenticated;
revoke execute on function public.schedule_tutor_session_reminders(uuid) from public, anon, authenticated;
revoke execute on function public.seed_default_notification_preferences(uuid) from public, anon, authenticated;
revoke execute on function public.handle_notification_preferences_for_new_user() from public, anon, authenticated;
revoke execute on function public.notification_channel_enabled(uuid, text, text) from public, anon, authenticated;
revoke execute on function public.claim_due_scheduled_jobs(uuid, integer, integer) from public, anon, authenticated;
revoke execute on function public.claim_due_notification_deliveries(uuid, integer, integer) from public, anon, authenticated;
revoke execute on function public.touch_community_post_updated_at() from public, anon, authenticated;
