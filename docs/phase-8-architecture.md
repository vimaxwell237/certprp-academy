# Phase 8 Architecture

Phase 8 adds the billing and premium access-control foundation for CertPrep Academy.

## Scope

- Billing tables for plans, subscriptions, and payment event history
- Seeded Free, Premium, and Tutor Plan records
- Public pricing flow and authenticated billing page
- Provider abstraction with a development checkout implementation
- Centralized feature-access checks for quizzes, exam simulator, labs, CLI practice, and tutor support
- Dashboard billing status and locked-feature visibility

## Feature layer

Billing logic is centralized under `src/features/billing`:

- `data/billing-service.ts`
  Handles plan reads, subscription state, checkout persistence, payment events, dashboard billing data, and feature-access checks.
- `actions/billing-actions.ts`
  Starts checkout and supports the return-flow wiring.
- `lib/provider.ts`
  Provider abstraction for checkout implementations.
- `lib/dev-provider.ts`
  Development checkout provider used for Phase 8 foundation work.
- `lib/access-control.ts`
  Reusable feature-gating helpers and free-preview logic.
- `components/*`
  Pricing cards, billing summary card, current-plan badge, and locked-feature UI.

## Access model

- `Free`
  Lessons plus preview access for the `network-fundamentals` module in quizzes, labs, and CLI practice.
- `Premium`
  Full self-study access across quizzes, exam simulator, labs, and CLI practice.
- `Tutor Plan`
  Premium access plus tutor support.

Tutor-profile users are still allowed into tutor support flows even if they are operating without a Tutor Plan subscription. That keeps seeded tutor accounts usable for development and support-response testing.

## Routing

New routes:

- `/pricing`
- `/billing`
- `/checkout/success`
- `/checkout/cancel`

Protected routes continue to be enforced in middleware, and billing checks are also enforced inside feature actions so direct form posts cannot bypass locked UI states.

## Supabase

Phase 8 SQL files:

- `supabase/migrations/20260309_phase8_billing_foundation.sql`
- `supabase/seeds/20260309_billing_plans_seed.sql`

Core tables:

- `plans`
- `user_subscriptions`
- `payment_events`

## Notes

- The payment provider is intentionally abstracted so Stripe or another provider can replace the dev checkout flow later without rewriting the feature-gating layer.
- The dashboard reads billing state separately so the application can surface current plan, status, renewal date, and upgrade prompts in one place.
