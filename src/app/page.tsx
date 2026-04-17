import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { HeroSection } from "@/features/marketing/components/hero-section";
import { HomeNextStepsSection } from "@/features/marketing/components/home-next-steps-section";
import { PlatformOverview } from "@/features/marketing/components/platform-overview";
import { TopicLinksSection } from "@/features/marketing/components/topic-links-section";
import { buildPageMetadata, SITE_DESCRIPTION } from "@/lib/seo/metadata";
import { buildCanonicalUrl } from "@/lib/seo/site-url";

export const metadata: Metadata = buildPageMetadata({
  title: "CCNA Training Platform",
  description:
    "Prepare for CCNA with structured lessons, subnetting practice, labs, quizzes, and AI tutor support inside CertPrep Academy.",
  path: "/",
  keywords: [
    "CCNA training platform",
    "CCNA subnetting practice",
    "CCNA labs",
    "Cisco networking course"
  ]
});

export default function HomePage() {
  const organizationId = buildCanonicalUrl("/#organization");
  const websiteId = buildCanonicalUrl("/#website");
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": buildCanonicalUrl("/#webpage"),
      name: "CCNA Training Platform",
      url: buildCanonicalUrl("/"),
      description: SITE_DESCRIPTION,
      isPartOf: {
        "@id": websiteId
      },
      about: {
        "@id": organizationId
      },
      inLanguage: "en-US"
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: buildCanonicalUrl("/")
        }
      ]
    }
  ];

  return (
    <div className="w-full space-y-10 pb-12">
      <JsonLd data={structuredData} />
      <HeroSection />
      <PlatformOverview />
      <HomeNextStepsSection />
      <TopicLinksSection />
    </div>
  );
}
