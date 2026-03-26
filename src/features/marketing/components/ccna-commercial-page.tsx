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
import type { CcnaCommercialPageContent } from "@/features/marketing/lib/ccna-commercial-pages";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { buildAppUrl } from "@/lib/app-url";
import { SITE_NAME } from "@/lib/seo/metadata";

interface CcnaCommercialPageProps {
  page: CcnaCommercialPageContent;
}

function buildBreadcrumbs(page: CcnaCommercialPageContent) {
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

export function CcnaCommercialPage({ page }: CcnaCommercialPageProps) {
  const breadcrumbs = buildBreadcrumbs(page);
  const siteUrl = buildAppUrl(APP_ROUTES.home);
  const pageUrl = buildAppUrl(page.route);
  const primaryCtaUrl = buildAppUrl(page.primaryCtaHref);
  const schema =
    page.schemaType === "Course"
      ? {
          "@context": "https://schema.org",
          "@type": "Course",
          name: page.title,
          description: page.metaDescription,
          url: pageUrl,
          inLanguage: "en-US",
          educationalLevel: "Associate",
          courseMode: "online",
          provider: {
            "@type": "Organization",
            name: SITE_NAME,
            url: siteUrl
          },
          teaches: page.coverageSections.map((section) => section.title),
          isAccessibleForFree: page.route === APP_ROUTES.ccnaCourseFreeTrial,
          offers: {
            "@type": "Offer",
            url: primaryCtaUrl,
            category:
              page.route === APP_ROUTES.ccnaCourseFreeTrial
                ? "free account"
                : "course subscription"
          }
        }
      : {
          "@context": "https://schema.org",
          "@type": "Product",
          name: page.title,
          description: page.metaDescription,
          url: pageUrl,
          category: "CCNA subscription",
          brand: {
            "@type": "Organization",
            name: SITE_NAME,
            url: siteUrl
          },
          audience: {
            "@type": "EducationalAudience",
            educationalRole: "student"
          },
          offers: {
            "@type": "Offer",
            url: primaryCtaUrl,
            availability: "https://schema.org/InStock"
          }
        };

  const structuredData = [
    schema,
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
        item: buildAppUrl(item.route)
      }))
    }
  ];

  return (
    <div className="w-full space-y-8 pb-12">
      <JsonLd data={structuredData} />

      <SeoBreadcrumbs items={breadcrumbs} />

      <SeoHeroSection
        asidePoints={page.heroProofPoints}
        asideTitle="Why this page converts"
        description={page.heroDescription}
        eyebrow={page.heroEyebrow}
        primaryAction={{ href: page.primaryCtaHref, label: page.primaryCtaLabel }}
        secondaryAction={{ href: page.secondaryCtaHref, label: page.secondaryCtaLabel }}
        title={page.heroTitle}
      />

      <section className="space-y-4">
        <SeoSectionHeader intro={page.valueIntro} title={page.valueHeading} />
        <SeoCardGrid
          items={page.valueProps.map((item) => ({
            title: item.title,
            description: item.description
          }))}
        />
      </section>

      <section className="space-y-4 rounded-[1.5rem] border border-white/70 bg-white/90 px-4 py-6 shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:px-10">
        <SeoSectionHeader intro={page.coverageIntro} title={page.coverageHeading} />
        <SeoCardGrid
          cardClassName="bg-pearl/80"
          items={page.coverageSections.map((section) => ({
            title: section.title,
            description: section.description,
            bullets: section.bullets
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
