# CertPrep Academy Phase 3 Architecture

## Scope
Phase 3 adds the quiz and practice-question layer:
- quiz schema and starter CCNA quiz data in Supabase
- authenticated quiz routes and results pages
- attempt storage and answer review
- dashboard quiz metrics and basic history
- quiz links integrated into module and lesson flows

## Data Model
Core quiz tables:
- `quizzes`
- `quiz_questions`
- `question_options`
- `quiz_attempts`
- `quiz_attempt_answers`

Design notes:
- a quiz belongs to either a module or a lesson
- questions currently support `single_choice`
- answer keys are stored in `question_options`
- user attempts and submitted answers are isolated with RLS

## Application Layers
1. Route layer:
- `/quizzes`
- `/quizzes/[quizSlug]`
- `/quizzes/[quizSlug]/results/[attemptId]`

2. Data layer:
- `src/features/quizzes/data/quiz-service.ts`

3. Action layer:
- `submitQuizAttempt`

4. UI layer:
- list cards
- quiz form
- review/results components
- related quiz cards for course and lesson contexts

## Dashboard Integration
Dashboard now includes:
- total quizzes taken
- average score
- latest quiz result
- weak performance indicator when a quiz score drops below the review threshold

## SQL Assets
- Migration: `supabase/migrations/20260308_phase3_quiz_foundation.sql`
- Seed: `supabase/seeds/20260308_ccna_quiz_seed.sql`

Apply in Supabase SQL Editor:
1. Run the migration SQL.
2. Run the seed SQL.
3. Confirm data exists in quiz tables.

