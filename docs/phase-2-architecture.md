# CertPrep Academy Phase 2 Architecture

## Scope
Phase 2 adds the first learning domain for CCNA:
- structured learning content model in Supabase
- seed content for the initial CCNA course
- authenticated course browsing routes
- lesson completion tracking tied to authenticated users
- dashboard metrics powered by real course/progress data

## Data Model
Core tables in `public` schema:
- `certifications`
- `courses`
- `modules`
- `lessons`
- `user_progress`

Design notes:
- one certification can map to many courses
- one course can map to many modules
- one module can map to many lessons
- one authenticated user can track completion per lesson via `user_progress`
- RLS is enabled across all learning tables
- authenticated users can read published learning content
- authenticated users can only read/write their own `user_progress` rows

## Application Layers
1. Route layer (`src/app/courses/**`):
- `/courses`
- `/courses/[courseSlug]`
- `/courses/[courseSlug]/[moduleSlug]/[lessonSlug]`

2. Feature data layer (`src/features/learning/data/learning-service.ts`):
- `fetchCourses`
- `fetchCourseDetail`
- `fetchLessonDetail`
- `fetchUserProgress`
- `updateLessonCompletion`
- `fetchDashboardLearningSnapshot`

3. Feature action layer:
- `markLessonComplete` server action for lesson completion updates

4. Shared UI:
- progress indicators
- completion badges
- reusable course and module cards

## Dashboard Integration
Dashboard now renders:
- active course title (CCNA default when available)
- module count
- lesson count
- completed lessons count
- progress percentage

## Middleware
Protected prefixes now include:
- `/dashboard`
- `/courses`

Unauthenticated users are redirected to `/login`.

## SQL Assets
- Migration: `supabase/migrations/20260308_phase2_learning_foundation.sql`
- Seed data: `supabase/seeds/20260308_ccna_starter_content.sql`

Apply in Supabase SQL Editor:
1. Run migration SQL.
2. Run seed SQL.
3. Confirm seeded records in `certifications`, `courses`, `modules`, and `lessons`.

