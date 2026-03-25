import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
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
import type { MarketingLandingPageContent } from "@/features/marketing/lib/seo-topics";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { buildAppUrl } from "@/lib/app-url";
import { SITE_NAME } from "@/lib/seo/metadata";

interface TopicLandingPageProps {
  page: MarketingLandingPageContent;
  relatedPages: MarketingLandingPageContent[];
}

function buildRelatedCtaLabel(title: string) {
  return `Explore the ${title.toLowerCase()} hub`;
}

export function TopicLandingPage({ page, relatedPages }: TopicLandingPageProps) {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.metaTitle,
      description: page.metaDescription,
      url: buildAppUrl(page.route),
      about: page.primaryKeyword,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: buildAppUrl(APP_ROUTES.home)
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer
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
          item: buildAppUrl(APP_ROUTES.home)
        },
        {
          "@type": "ListItem",
          position: 2,
          name: page.title,
          item: buildAppUrl(page.route)
        }
      ]
    }
  ];
  const breadcrumbItems = [
    {
      route: APP_ROUTES.home,
      title: "Home"
    },
    {
      route: page.route,
      title: page.title
    }
  ];
  const relatedContentItems = relatedPages.map((relatedPage) => ({
    route: relatedPage.route,
    title: relatedPage.title,
    description: relatedPage.metaDescription,
    ctaLabel: buildRelatedCtaLabel(relatedPage.title)
  }));

  return (
    <div className="w-full space-y-8 pb-12">
      <JsonLd data={structuredData} />
      <SeoBreadcrumbs items={breadcrumbItems} />

      <SeoHeroSection
        asideDescription="Use this overview page to understand the study intent first, then branch into the deeper CCNA pages that match your next step."
        asidePoints={page.keyPoints.map((item) => item.title)}
        asideTitle={`How this ${page.primaryKeyword.toLowerCase()} hub helps`}
        description={page.heroDescription}
        eyebrow={page.heroEyebrow}
        primaryAction={{
          href: APP_ROUTES.signup,
          label: "Start the free CCNA study path"
        }}
        secondaryAction={{
          href: APP_ROUTES.pricing,
          label: "Compare CCNA pricing and plans"
        }}
        title={page.heroTitle}
      />

      <section className="space-y-4">
        <SeoSectionHeader
          intro="The strongest CCNA overview pages should make the topic easier to understand, easier to practice, and easier to connect back to the blueprint."
          title={`What strong ${page.primaryKeyword.toLowerCase()} should help you do`}
        />
        <SeoCardGrid items={page.keyPoints} />
      </section>

      <section className="space-y-4 rounded-[2rem] border border-white/70 bg-white/90 px-6 py-8 shadow-soft lg:px-10">
        <SeoSectionHeader
          intro="CertPrep Academy connects lessons, practice tools, and guided workflows so this topic does not sit in isolation from the rest of your study path."
          title="How CertPrep Academy supports this part of CCNA study"
        />
        <SeoCardGrid cardClassName="bg-pearl/80" items={page.certPrepSupport} />
      </section>

      <SeoTrustSection
        description={`This ${page.primaryKeyword.toLowerCase()} page is designed to connect overview intent with the next practical step, so learners are not left on a thin hub with nowhere meaningful to go next.`}
        points={[
          "Visible breadcrumbs and canonical metadata keep the page aligned with the wider CCNA architecture.",
          "Descriptive internal links connect this hub to labs, practice exams, comparisons, and subscription pages.",
          "Supporting content is grouped so learners can move from overview intent into deeper study without dead ends."
        ]}
        title={`Why this ${page.primaryKeyword.toLowerCase()} page fits the wider SEO architecture`}
      />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-ink/5">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
            Frequently asked questions
          </h2>
          <div className="mt-5 space-y-5">
            {page.faqs.map((faq) => (
              <div className="space-y-2" key={faq.question}>
                <h3 className="text-lg font-semibold text-ink">{faq.question}</h3>
                <p className="text-base text-slate">{faq.answer}</p>
              </div>
            ))}
          </div>
        </Card>

        <SeoRelatedContentCards
          cardClassName="bg-pearl/70"
          columns={1}
          intro="Use adjacent hubs when you want to shift from this overview into another core study path."
          items={relatedContentItems}
          title="Related CCNA study hubs"
        />
      </section>

      <SeoCtaBanner
        description={`Start with the free account if you want to explore ${page.primaryKeyword.toLowerCase()} inside the wider platform, or move straight to pricing when you are comparing study-path depth.`}
        footnote={
          <span>
            Need a narrower next step? Use the internal content rail below to jump into labs,
            practice tests, comparison pages, and subscription paths.
          </span>
        }
        primaryAction={{
          href: APP_ROUTES.signup,
          label: "Start free CCNA access"
        }}
        secondaryAction={{
          href: APP_ROUTES.pricing,
          label: "Review pricing and plans"
        }}
        title="Move from overview intent into focused CCNA practice"
      />

      <CcnaSeoLinkRail currentRoute={page.route} />
    </div>
  );
}
