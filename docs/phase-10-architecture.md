# Phase 10 Architecture

Phase 10 adds the first in-app admin and content-operations layer for CertPrep Academy.

## Scope

- Role-based admin authorization with a dedicated `user_roles` table
- Protected `/admin/*` route tree with a shared sidebar layout
- Admin dashboard with content and operations counts
- In-app management for:
  - certifications
  - courses
  - modules
  - lessons
  - quizzes
  - labs
  - CLI challenges
  - tutor profiles
  - plans
- Draft/published and active/inactive controls for learner-facing content
- Reusable admin server actions, validation helpers, and content-ops data services

## Authorization design

Admin authorization is now centralized in two places:

- Database layer:
  - `public.user_roles` stores one app role per auth user
  - supported roles are `admin`, `tutor`, and `learner`
  - helper SQL functions `public.get_app_role`, `public.current_app_role`, and `public.is_admin` power RLS policies
- App layer:
  - `src/lib/auth/roles.ts` exposes `getCurrentUserRole`, `requireAuthenticatedAppUser`, and `requireAdminUser`
  - `/admin` layout calls `requireAdminUser()` once at the route boundary
  - server actions also call `requireAdminUser()` so POST access is protected even if a route is forged

Tutors do not automatically receive admin access.

## Content-ops feature layer

Admin logic is isolated under `src/features/admin`:

- `data/admin-service.ts`
  - record listing
  - detail fetches for edit mode
  - create/update persistence
  - publish/active toggles
  - duplicate slug and parent validation
  - dashboard counting
- `actions/admin-actions.ts`
  - server actions for each admin form and toggle
  - centralized success/error state handling
  - admin authorization enforcement
- `lib/validation.ts`
  - shared form parsing and error helpers
- `components/*`
  - sidebar
  - stats cards
  - tables
  - forms
  - draft/published badges

Page files stay thin and call into the feature layer rather than issuing raw Supabase queries directly.

## Publish-state model

Phase 10 adds `is_published` to:

- `certifications`
- `modules`
- `lessons`

Existing published records are backfilled so current CCNA learner content remains available after migration.

Learner-facing content visibility now depends on both the record itself and its parent chain being publish-ready. Admin pages can still see drafts through admin-only RLS policies and admin data services.

## Supabase migration

Migration file:

- `supabase/migrations/20260310_phase10_admin_content_ops.sql`

The migration:

- creates `user_roles`
- seeds missing learner roles for existing users
- backfills tutor users to role `tutor`
- creates an auth trigger to default new users to `learner`
- adds new publish-state columns
- tightens published-only learner RLS policies
- adds admin-only CRUD policies for managed tables

After running it, promote at least one existing auth user manually:

```sql
update public.user_roles
set role = 'admin'
where user_id = 'YOUR_AUTH_USER_UUID';
```

## Phase 11 recommendation

Phase 11 should focus on deeper authoring workflows instead of widening admin scope again:

- quiz question and answer option management
- lab file metadata management and upload workflows
- CLI step authoring inside the app
- exam simulator configuration management
- safer destructive/archive workflows with impact checks
