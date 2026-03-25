# CertPrep Academy Phase 5 Architecture

## Scope
Phase 5 adds the Packet Tracer lab foundation:
- lab schema and starter CCNA lab metadata in Supabase
- private Supabase Storage preparation for downloadable lab assets
- authenticated lab routes and progress tracking
- related lab surfaces in the course and lesson flow
- dashboard lab metrics and latest activity

## Data Model
Core lab tables:
- `labs`
- `lab_files`
- `lab_progress`

Design notes:
- labs belong to a module and can optionally point to a lesson
- lab files store metadata separately from storage objects
- lab download URLs are created from a private Supabase Storage bucket
- progress states currently support `not_started`, `in_progress`, and `completed`
- missing storage objects are handled safely as placeholder file records

## Application Layers
1. Route layer:
- `/labs`
- `/labs/[labSlug]`

2. Data layer:
- `src/features/labs/data/lab-service.ts`

3. Action layer:
- `src/features/labs/actions/update-lab-progress.ts`

4. UI layer:
- lab cards
- status and difficulty badges
- progress action form
- file download section
- related labs panel for learning flow integration

## Storage Preparation
- bucket name: `lab-files`
- bucket is private
- authenticated users can read storage objects through signed URLs
- current seed data includes placeholder file metadata so the UI remains stable before real `.pkt` uploads

## Dashboard Integration
Dashboard now includes:
- total labs available
- labs started
- labs completed
- latest lab activity

## SQL Assets
- Migration: `supabase/migrations/20260308_phase5_labs_foundation.sql`
- Seed: `supabase/seeds/20260308_ccna_labs_seed.sql`

Apply in Supabase SQL Editor after Phase 2, Phase 3, and Phase 4 SQL:
1. Run the Phase 5 migration SQL.
2. Run the Phase 5 seed SQL.
3. Confirm `labs`, `lab_files`, and `lab_progress` exist.
4. Confirm `lab-files` storage bucket exists.
