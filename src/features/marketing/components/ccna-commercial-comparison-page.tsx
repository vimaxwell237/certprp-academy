import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { CcnaSeoLinkRail } from "@/features/marketing/components/ccna-seo-link-rail";
import {
  SeoBreadcrumbs,
  SeoCardGrid,
  SeoComparisonTable,
  SeoCtaBanner,
  SeoHeroSection,
  SeoRelatedContentCards,
  SeoSectionHeader,
  SeoTrustSection
} from "@/features/marketing/components/ccna-seo-shared";
import {
  dedupeSeoRelatedLinkItems,
  PRICING_SEO_LINK_ITEM
} from "@/features/marketing/lib/internal-linking";
import type {
  CcnaCommercialComparisonPageContent
} from "@/features/marketing/lib/ccna-commercial-comparison-pages";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { SITE_NAME } from "@/lib/seo/metadata";
import { buildCanonicalUrl } from "@/lib/seo/site-url";

interface CcnaCommercialComparisonPageProps {
  page: CcnaCommercialComparisonPageContent;
}

function buildBreadcrumbs(page: CcnaCommercialComparisonPageContent) {
  return [
    {
      route: APP_ROUTES.home,
      title: "Home"
    },
    {
      route: page.route,
      title: page.title
    }
  ];
}

export function CcnaCommercialComparisonPage({
  page
}: CcnaCommercialComparisonPageProps) {
  const breadcrumbs = buildBreadcrumbs(page);
  const nextStepItems = dedupeSeoRelatedLinkItems([
    PRICING_SEO_LINK_ITEM,
    ...page.relatedLinks.slice(0, 2).map((link) => ({
      ...link,
      ctaLabel: `Read ${link.title}`
    })),
    ...page.funnelLinks.slice(0, 1).map((link) => ({
      ...link,
      ctaLabel: `Open ${link.title}`
    }))
  ]);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.metaTitle,
      description: page.metaDescription,
      url: buildCanonicalUrl(page.route),
      about: page.primaryKeyword,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: buildCanonicalUrl(APP_ROUTES.home)
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((item) => ({
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
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        item: buildCanonicalUrl(item.route)
      }))
    }
  ];

  return (
    <div className="w-full space-y-8 pb-12">
      <JsonLd data={structuredData} />

      <SeoBreadcrumbs items={breadcrumbs} />

      <SeoHeroSection
        asideDescription={page.evidenceIntro}
        asidePoints={page.evidenceBullets}
        asideTitle={page.evidenceHeading}
        description={page.heroDescription}
        eyebrow={page.heroEyebrow}
        points={page.heroPoints}
        primaryAction={{ href: page.primaryCtaHref, label: page.primaryCtaLabel }}
        secondaryAction={{ href: page.secondaryCtaHref, label: page.secondaryCtaLabel }}
        title={page.heroTitle}
      />

      <SeoRelatedContentCards
        cardClassName="bg-pearl/70"
        intro="Move from comparison intent into pricing and the most relevant supporting CCNA pages without leaving this path cold."
        items={nextStepItems}
        title="Where to go after this comparison page"
      />

      <section className="space-y-4">
        <SeoSectionHeader intro={page.frameworkIntro} title={page.frameworkHeading} />
        <SeoCardGrid
          items={page.frameworkCards.map((card) => ({
            title: card.title,
            description: card.description,
            bullets: card.bullets
          }))}
        />
      </section>

      <section className="space-y-4 rounded-[1.5rem] border border-white/70 bg-white/90 px-4 py-6 shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:px-10">
        <SeoSectionHeader intro={page.comparisonIntro} title={page.comparisonHeading} />
        <SeoComparisonTable
          columns={page.comparisonColumns}
          rows={page.comparisonRows.map((row) => ({
            label: row.criterion,
            values: row.values
          }))}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <SeoSectionHeader
            intro={page.differentiatorIntro}
            title={page.differentiatorHeading}
          />
          <SeoCardGrid
            cardClassName="bg-pearl/70"
            columns={1}
            items={page.differentiatorCards.map((card) => ({
              title: card.title,
              description: card.description,
              bullets: card.bullets
            }))}
          />
        </section>

        <section className="space-y-4">
          <SeoSectionHeader intro={page.fitIntro} title={page.fitHeading} />
          <SeoCardGrid
            columns={1}
            items={page.fitCards.map((card) => ({
              title: card.title,
              description: card.description,
              bullets: card.bullets
            }))}
          />
        </section>
      </section>

      <SeoTrustSection
        description={page.bridgeIntro}
        points={page.bridgePoints}
        title={page.bridgeHeading}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <SeoRelatedContentCards
          cardClassName="bg-pearl/70"
          columns={1}
          intro={page.proofIntro}
          items={page.proofLinks.map((link) => ({
            ...link,
            ctaLabel: `Explore ${link.title}`
          }))}
          title={page.proofHeading}
        />

        <SeoRelatedContentCards
          columns={1}
          intro={page.funnelIntro}
          items={page.funnelLinks.map((link) => ({
            ...link,
            ctaLabel: `Open ${link.title}`
          }))}
          title={page.funnelHeading}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <SeoRelatedContentCards
          cardClassName="bg-pearl/70"
          columns={1}
          intro={page.relatedIntro}
          items={page.relatedLinks.map((link) => ({
            ...link,
            ctaLabel: `Read ${link.title}`
          }))}
          title={page.relatedHeading}
        />

        <Card className="border-ink/5">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
            {page.faqHeading}
          </h2>
          <p className="mt-3 text-base text-slate">{page.faqIntro}</p>
          <div className="mt-5 space-y-5">
            {page.faqs.map((item) => (
              <div className="space-y-2" key={item.question}>
                <h3 className="text-lg font-semibold text-ink">{item.question}</h3>
                <p className="text-base text-slate">{item.answer}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <CcnaSeoLinkRail currentRoute={page.route} />

      <SeoCtaBanner
        description={page.ctaDescription}
        primaryAction={{ href: page.primaryCtaHref, label: page.primaryCtaLabel }}
        secondaryAction={{ href: page.secondaryCtaHref, label: page.secondaryCtaLabel }}
        title={page.ctaTitle}
      />
    </div>
  );
}
