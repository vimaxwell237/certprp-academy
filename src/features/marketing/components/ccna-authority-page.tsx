import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { CcnaSeoLinkRail } from "@/features/marketing/components/ccna-seo-link-rail";
import {
  SeoBreadcrumbs,
  SeoCardGrid,
  SeoCtaBanner,
  SeoHeroSection,
  SeoRelatedContentCards,
  SeoSectionHeader
} from "@/features/marketing/components/ccna-seo-shared";
import type {
  AuthorityLink,
  CcnaAuthorityPageContent
} from "@/features/marketing/lib/ccna-authority-pages";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { buildAppUrl } from "@/lib/app-url";
import { SITE_NAME } from "@/lib/seo/metadata";

interface CcnaAuthorityPageProps {
  page: CcnaAuthorityPageContent;
}

function buildBreadcrumbs(page: CcnaAuthorityPageContent) {
  const links: AuthorityLink[] = [
    {
      route: APP_ROUTES.home,
      title: "Home",
      description: "CertPrep Academy homepage"
    }
  ];

  if (page.route !== APP_ROUTES.ccnaExamTopicsExplained) {
    links.push({
      route: APP_ROUTES.ccnaExamTopicsExplained,
      title: "CCNA Exam Topics Explained",
      description: "CCNA 200-301 v1.1 topic hub"
    });
  }

  links.push({
    route: page.route,
    title: page.title,
    description: page.metaDescription
  });

  return links;
}

export function CcnaAuthorityPage({ page }: CcnaAuthorityPageProps) {
  const breadcrumbs = buildBreadcrumbs(page);
  const siteUrl = buildAppUrl(APP_ROUTES.home);
  const pageUrl = buildAppUrl(page.route);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": page.schemaType,
      name: page.metaTitle,
      headline: page.heroTitle,
      description: page.metaDescription,
      url: pageUrl,
      mainEntityOfPage: pageUrl,
      inLanguage: "en-US",
      about: [page.primaryKeyword, "CCNA 200-301 v1.1"],
      keywords: [page.primaryKeyword, ...page.secondaryKeywords].join(", "),
      articleSection: page.focusAreas.map((section) => section.title),
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: siteUrl
      },
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: siteUrl
      },
      hasPart: page.relatedLinks.map((link) => ({
        "@type": "WebPage",
        name: link.title,
        url: buildAppUrl(link.route)
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((breadcrumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: breadcrumb.title,
        item: buildAppUrl(breadcrumb.route)
      }))
    }
  ];

  return (
    <div className="w-full space-y-8 pb-12">
      <JsonLd data={structuredData} />

      <SeoBreadcrumbs items={breadcrumbs} />

      <SeoHeroSection
        asideDescription="This guide follows the public CCNA 200-301 v1.1 topic outline and points you toward original CertPrep Academy lessons, labs, and practice workflows. It is designed for ethical preparation using original study material."
        asideTitle="Aligned to CCNA 200-301 v1.1 with original study material"
        description={page.heroDescription}
        eyebrow={page.heroEyebrow}
        primaryAction={{ href: APP_ROUTES.signup, label: "Start Free Account" }}
        secondaryAction={{ href: APP_ROUTES.pricing, label: "View CCNA Pricing" }}
        title={page.heroTitle}
      />

      <section className="space-y-4">
        <SeoSectionHeader intro={page.overviewIntro} title={page.overviewHeading} />
        <SeoCardGrid
          items={page.focusAreas.map((area) => ({
            title: area.title,
            description: area.description,
            bullets: area.bullets
          }))}
        />
      </section>

      <section className="space-y-4 rounded-[1.5rem] border border-white/70 bg-white/90 px-4 py-6 shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:px-10">
        <SeoSectionHeader intro={page.studyIntro} title={page.studyHeading} />
        <SeoCardGrid
          cardClassName="bg-pearl/70"
          items={page.studySteps.map((step) => ({
            title: step.title,
            description: step.description,
            link: {
              href: step.link.route,
              label: step.link.title
            }
          }))}
        />
      </section>

      <SeoCtaBanner
        description={page.ctaDescription}
        footnote={
          <p>
            Want hands-on reinforcement next?{" "}
            <Link
              className="font-semibold text-white underline-offset-4 hover:underline"
              href={APP_ROUTES.ccnaLabs}
            >
              Explore original CCNA labs
            </Link>
            .
          </p>
        }
        primaryAction={{ href: APP_ROUTES.signup, label: "Start Free Account" }}
        secondaryAction={{ href: APP_ROUTES.pricing, label: "Compare Plans" }}
        title={page.ctaTitle}
        variant="dark"
      />

      <SeoRelatedContentCards
        intro={page.relatedIntro}
        items={page.relatedLinks.map((related) => ({
          ...related,
          ctaLabel: `Explore ${related.title}`
        }))}
        title={page.relatedHeading}
      />

      <CcnaSeoLinkRail currentRoute={page.route} />
    </div>
  );
}
