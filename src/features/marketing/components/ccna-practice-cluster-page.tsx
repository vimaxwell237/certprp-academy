import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { CcnaSeoLinkRail } from "@/features/marketing/components/ccna-seo-link-rail";
import {
  SeoBreadcrumbs,
  SeoCardGrid,
  SeoCtaBanner,
  SeoHeroSection,
  SeoRelatedContentCards,
  SeoSectionHeader,
  SeoTrustSection
} from "@/features/marketing/components/ccna-seo-shared";
import type { CcnaPracticeClusterPageContent } from "@/features/marketing/lib/ccna-practice-cluster-pages";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { SITE_NAME } from "@/lib/seo/metadata";
import { buildCanonicalUrl } from "@/lib/seo/site-url";

interface CcnaPracticeClusterPageProps {
  page: CcnaPracticeClusterPageContent;
}

function buildBreadcrumbs(page: CcnaPracticeClusterPageContent) {
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

export function CcnaPracticeClusterPage({ page }: CcnaPracticeClusterPageProps) {
  const breadcrumbs = buildBreadcrumbs(page);
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
      mainEntity: page.objections.map((item) => ({
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
        asidePoints={page.heroPoints}
        asideTitle="What this page emphasizes"
        description={page.heroDescription}
        eyebrow={page.heroEyebrow}
        primaryAction={{ href: page.primaryCtaHref, label: page.primaryCtaLabel }}
        secondaryAction={{ href: page.secondaryCtaHref, label: page.secondaryCtaLabel }}
        title={page.heroTitle}
      />

      <section className="space-y-4">
        <SeoSectionHeader intro={page.intentDescription} title={page.intentHeading} />
        <SeoCardGrid
          items={page.intentCards.map((item) => ({
            title: item.title,
            description: item.description
          }))}
        />
      </section>

      <section className="space-y-4 rounded-[1.5rem] border border-white/70 bg-white/90 px-4 py-6 shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:px-10">
        <SeoSectionHeader intro={page.comparisonIntro} title={page.comparisonHeading} />
        <SeoCardGrid
          cardClassName="bg-pearl/80"
          items={page.comparisonCards.map((item) => ({
            title: item.title,
            description: item.description,
            bullets: item.bullets
          }))}
        />
      </section>

      <SeoTrustSection
        description={page.trustDescription}
        points={page.trustPoints}
        title={page.trustHeading}
      />

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-ink/5">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
            {page.objectionsHeading}
          </h2>
          <p className="mt-3 text-base text-slate">{page.objectionsIntro}</p>
          <div className="mt-5 space-y-5">
            {page.objections.map((item) => (
              <div className="space-y-2" key={item.question}>
                <h3 className="text-lg font-semibold text-ink">{item.question}</h3>
                <p className="text-base text-slate">{item.answer}</p>
              </div>
            ))}
          </div>
        </Card>

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
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <SeoRelatedContentCards
          cardClassName="bg-pearl/70"
          columns={1}
          intro={page.conversionIntro}
          items={page.conversionLinks.map((link) => ({
            ...link,
            ctaLabel: `Open ${link.title}`
          }))}
          title={page.conversionHeading}
        />

        <SeoRelatedContentCards
          columns={1}
          intro={page.clusterIntro}
          items={page.clusterLinks.map((link) => ({
            ...link,
            ctaLabel: `Review ${link.title}`
          }))}
          title={page.clusterHeading}
        />
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
