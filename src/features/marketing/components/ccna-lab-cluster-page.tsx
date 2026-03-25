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
import type { CcnaLabClusterPageContent } from "@/features/marketing/lib/ccna-lab-cluster-pages";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { buildAppUrl } from "@/lib/app-url";
import { SITE_NAME } from "@/lib/seo/metadata";

interface CcnaLabClusterPageProps {
  page: CcnaLabClusterPageContent;
}

function buildBreadcrumbs(page: CcnaLabClusterPageContent) {
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

export function CcnaLabClusterPage({ page }: CcnaLabClusterPageProps) {
  const breadcrumbs = buildBreadcrumbs(page);
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
      "@type": "HowTo",
      name: page.heroTitle,
      description: page.labGoal,
      totalTime: page.totalTime,
      step: page.steps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.description
      }))
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
        asideDescription={page.labGoal}
        asidePoints={page.heroPoints}
        asideTitle="Lab Goal"
        description={page.heroDescription}
        eyebrow={page.heroEyebrow}
        primaryAction={{ href: page.primaryCtaHref, label: page.primaryCtaLabel }}
        secondaryAction={{ href: page.secondaryCtaHref, label: page.secondaryCtaLabel }}
        title={page.heroTitle}
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="border-ink/5">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
            Objective Mapping
          </h2>
          <div className="mt-5 space-y-4">
            {page.objectiveMapping.map((item) => (
              <div className="space-y-2" key={item.title}>
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                <p className="text-base text-slate">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-ink/5">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
            Prerequisites
          </h2>
          <p className="mt-3 text-base text-slate">
            These are the minimum concepts and tools that make the walkthrough easier to finish.
          </p>
          <ul className="mt-5 space-y-3 text-base text-slate">
            {page.prerequisites.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="space-y-4 rounded-[2rem] border border-white/70 bg-white/90 px-6 py-8 shadow-soft lg:px-10">
        <SeoSectionHeader
          intro="Follow these steps in order, then use the verification section to confirm that the result matches the goal."
          title="Steps"
        />
        <SeoCardGrid
          cardClassName="bg-pearl/80"
          columns={2}
          items={page.steps.map((step, index) => ({
            title: `Step ${index + 1}: ${step.title}`,
            description: step.description
          }))}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="border-ink/5">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
            Verification
          </h2>
          <p className="mt-3 text-base text-slate">
            Use these checks to confirm the walkthrough worked the way the objective intended.
          </p>
          <ul className="mt-5 space-y-3 text-base text-slate">
            {page.verification.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </Card>

        <Card className="border-ink/5">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
            Troubleshooting
          </h2>
          <p className="mt-3 text-base text-slate">
            These are the issues that usually break the walkthrough on a first attempt.
          </p>
          <div className="mt-5 space-y-4">
            {page.troubleshooting.map((item) => (
              <div className="space-y-2" key={item.issue}>
                <h3 className="text-lg font-semibold text-ink">{item.issue}</h3>
                <p className="text-base text-slate">{item.fix}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <SeoTrustSection
        description={page.trustDescription}
        points={page.trustPoints}
        title={page.trustHeading}
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <SeoRelatedContentCards
          cardClassName="bg-pearl/70"
          columns={1}
          intro="Move from hands-on work into related practice tests and review hubs."
          items={page.practiceLinks.map((link) => ({
            ...link,
            ctaLabel: `Review ${link.title}`
          }))}
          title="Practice Links"
        />

        <SeoRelatedContentCards
          columns={1}
          intro="Use these pages to keep building out the same CCNA workflow from adjacent angles."
          items={page.relatedLinks.map((link) => ({
            ...link,
            ctaLabel: `Explore ${link.title}`
          }))}
          title="Related Guides"
        />

        <SeoRelatedContentCards
          cardClassName="bg-pearl/70"
          columns={1}
          intro="These are the strongest next steps if you want more guided labs, more practice depth, or a fuller subscription path."
          items={page.conversionLinks.map((link) => ({
            ...link,
            ctaLabel: `Open ${link.title}`
          }))}
          title="Unlock More Labs"
        />
      </section>

      <section>
        <Card className="border-ink/5">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
            Frequently Asked Questions
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
