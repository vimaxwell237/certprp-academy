import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { PricingCard } from "@/features/billing/components/pricing-card";
import {
  fetchPricingPlansForUser,
  getBillingCheckoutAvailability
} from "@/features/billing/data/billing-service";
import { ccnaCommercialSupportLinks } from "@/features/marketing/lib/ccna-commercial-pages";
import { getCurrentUser } from "@/lib/auth/session";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { buildCanonicalUrl } from "@/lib/seo/site-url";
import type { BillingAccessState, PricingPlanCardData } from "@/types/billing";

const pricingBenefits = [
  {
    title: "Labs, practice tests, and explanations",
    description:
      "The strongest paid value comes from combining original labs, original CCNA-style practice tests, and explanations that help mistakes turn into retention."
  },
  {
    title: "Coverage across the main CCNA domains",
    description:
      "Pricing is built around the full CCNA 200-301 v1.1 path, not just one tool or one narrow topic."
  },
  {
    title: "Original practice instead of dumps",
    description:
      "The platform is positioned for ethical preparation with original study material and original practice workflows."
  },
  {
    title: "A cleaner study workflow",
    description:
      "Move from topic guides into labs, drills, and timed review without stitching together disconnected resources."
  }
];

const pricingFitCards = [
  {
    title: "Free",
    description:
      "Best for learners who want a low-risk starting point and want to inspect the platform before upgrading."
  },
  {
    title: "Premium",
    description:
      "Best for self-study learners who want the commercial core: labs, quizzes, CLI practice, and exam simulation."
  },
  {
    title: "Tutor Plan",
    description:
      "Best for learners who want the full Premium path plus tutor access and extra guided support."
  }
];

const pricingFaqs = [
  {
    question: "Is CertPrep Academy built around dumps or recalled exam questions?",
    answer:
      "No. The pricing page supports ethical CCNA preparation with original CCNA-style practice, labs, explanations, and study pages aligned to the public CCNA 200-301 v1.1 topic outline."
  },
  {
    question: "What makes the paid plans more valuable than free access?",
    answer:
      "Paid access is where the wider practice loop opens up: more labs, more practice tests, more guided review, and a smoother way to move between weak domains and supporting study material."
  },
  {
    question: "Can I start free before choosing a paid subscription?",
    answer:
      "Yes. The platform includes a free-start path so you can review the study approach and inspect supporting proof pages before upgrading."
  }
];

const pricingProofLinks = [
  ccnaCommercialSupportLinks.topicsHub,
  ccnaCommercialSupportLinks.practiceExams,
  ccnaCommercialSupportLinks.labs,
  ccnaCommercialSupportLinks.subnetting
];

function buildProofLinkLabel(title: string) {
  return `Explore ${title}`;
}

export const metadata: Metadata = buildPageMetadata({
  title: "CCNA Pricing for Labs, Practice Tests, and Course Access",
  description:
    "Compare CCNA pricing for course access, labs, practice tests, explanations, and ethical original CCNA-style preparation inside CertPrep Academy.",
  path: APP_ROUTES.pricing,
  keywords: [
    "CCNA pricing",
    "CCNA subscription pricing",
    "CCNA labs and practice tests",
    "CCNA course pricing"
  ]
});

export default async function PricingPage({
  searchParams
}: {
  searchParams: Promise<{ billingError?: string }>;
}) {
  const user = await getCurrentUser();
  const { billingError } = await searchParams;
  let plans: PricingPlanCardData[] = [];
  let accessState: BillingAccessState | null = null;
  let loadErrorMessage: string | null = null;

  try {
    const pricingData = await fetchPricingPlansForUser(user?.id ?? null);
    plans = pricingData.plans;
    accessState = pricingData.accessState;
  } catch (error) {
    loadErrorMessage = getPublicErrorMessage(
      error,
      "Billing data could not be loaded right now."
    );
  }

  const checkoutAvailability = getBillingCheckoutAvailability(plans);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "OfferCatalog",
      name: `${SITE_NAME} pricing`,
      url: buildCanonicalUrl(APP_ROUTES.pricing),
      itemListElement: plans.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        description: plan.description,
        price: Number(plan.priceAmount.toFixed(2)),
        priceCurrency: plan.priceCurrency,
        url: buildCanonicalUrl(APP_ROUTES.pricing),
        availability: "https://schema.org/InStock",
        category: plan.billingInterval === "none" ? "Free plan" : "Paid plan"
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: pricingFaqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: buildCanonicalUrl(APP_ROUTES.home)
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Pricing",
          item: buildCanonicalUrl(APP_ROUTES.pricing)
        }
      ]
    }
  ];

  return (
    <section className="w-full max-w-6xl space-y-8 pb-12">
      <JsonLd data={structuredData} />

      <div className="grid gap-6 rounded-[1.5rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,145,178,0.9))] px-4 py-6 text-white shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">
            CCNA Pricing
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            CCNA pricing for learners who want labs, practice tests, and explanations in one place
          </h1>
          <p className="max-w-3xl text-base text-slate-100">
            Choose the plan that fits your study intensity, from a free start into the
            platform to paid access built around original labs, original CCNA-style
            practice, and ethical non-dump preparation.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-sand"
              href={user ? APP_ROUTES.billing : APP_ROUTES.signup}
            >
              {user ? "Open Billing" : "Start Free Account"}
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
              href={APP_ROUTES.ccnaCourseSubscription}
            >
              View Subscription Overview
            </Link>
          </div>
        </div>

        <Card className="text-ink">
          <h2 className="font-display text-2xl font-semibold text-ink">
            What paid access emphasizes
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li>- Labs plus practice tests plus explanations</li>
            <li>- Coverage across the main CCNA 200-301 v1.1 domains</li>
            <li>- Original CCNA-style practice for ethical preparation</li>
            <li>- A smoother path from topic guides into hands-on review</li>
          </ul>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Why learners upgrade from free access
          </h2>
          <p className="max-w-4xl text-base text-slate">
            The conversion case is not just more content. It is a stronger study loop:
            learn the topic, practice it, review explanations, and keep moving across the
            blueprint without losing momentum.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {pricingBenefits.map((item) => (
            <Card className="border-ink/5" key={item.title}>
              <h3 className="font-display text-2xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 text-base text-slate">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {billingError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Checkout could not start.</p>
          <p className="mt-2 text-sm">{billingError}</p>
        </div>
      ) : null}

      {checkoutAvailability.globalMessage ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p className="font-semibold">Payment setup status</p>
          <p className="mt-2 text-sm">{checkoutAvailability.globalMessage}</p>
        </div>
      ) : null}

      <section aria-labelledby="pricing-plans-heading" className="space-y-4">
        <div className="space-y-2">
          <h2
            className="font-display text-2xl font-semibold tracking-tight text-ink"
            id="pricing-plans-heading"
          >
            Compare CCNA study plans
          </h2>
          <p className="max-w-3xl text-sm text-slate">
            Choose a plan based on how much CCNA practice, labs, exam simulation, and
            guided support you want inside one study environment.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <PricingCard
                accessState={accessState}
                checkoutDisabledReason={checkoutAvailability.planMessages[plan.slug] ?? null}
                key={plan.id}
                plan={plan}
                returnTo={APP_ROUTES.pricing}
              />
            ))
          ) : (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900 lg:col-span-3">
              <p className="font-semibold">Pricing plans are not loaded yet.</p>
              <p className="mt-2 text-sm">
                Run the Phase 8 billing migration and plan seed SQL in Supabase, then
                refresh this page.
              </p>
              {loadErrorMessage ? (
                <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">
                  {loadErrorMessage}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-[1.5rem] border border-white/70 bg-white/90 px-4 py-6 shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:px-10">
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Which plan usually fits which buyer
          </h2>
          <p className="max-w-4xl text-base text-slate">
            This makes the commercial decision easier: start free if you are still
            evaluating, move into Premium for the full self-study core, or choose Tutor
            Plan if you want added human support.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {pricingFitCards.map((item) => (
            <Card className="border-ink/5 bg-pearl/80" key={item.title}>
              <h3 className="font-display text-2xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 text-base text-slate">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,145,178,0.9))] px-4 py-6 text-white shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:px-10">
        <div className="max-w-4xl space-y-4">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Trust matters more on pricing pages than on almost any other page
          </h2>
          <p className="text-base text-slate-100">
            CertPrep Academy is positioned around original study material, original
            CCNA-style practice, and ethical preparation aligned to the public CCNA
            200-301 v1.1 topic outline. The value is in understanding, not shortcut
            culture.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm text-slate-100">
              Aligned to the public CCNA topic structure
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm text-slate-100">
              Original labs, practice, and explanation-driven review
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm text-slate-100">
              Explicitly positioned as ethical non-dump preparation
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-ink/5">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Objection handling
          </h2>
          <div className="mt-5 space-y-5">
            {pricingFaqs.map((item) => (
              <div className="space-y-2" key={item.question}>
                <h3 className="text-lg font-semibold text-ink">{item.question}</h3>
                <p className="text-base text-slate">{item.answer}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-ink/5">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Supporting proof pages
          </h2>
          <p className="mt-3 text-base text-slate">
            If you want more confidence before buying, inspect the pages below to see how
            the platform handles topic coverage, labs, and review.
          </p>
          <div className="mt-5 space-y-4">
            {pricingProofLinks.map((link) => (
              <div className="rounded-2xl border border-ink/5 bg-pearl/70 px-4 py-4" key={link.route}>
                <h3 className="text-lg font-semibold text-ink">{link.title}</h3>
                <p className="mt-2 text-sm text-slate">{link.description}</p>
                <Link
                  className="mt-3 inline-flex text-sm font-semibold text-cyan transition hover:text-cyan-700"
                  href={link.route}
                >
                  {buildProofLinkLabel(link.title)}
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </section>
  );
}
