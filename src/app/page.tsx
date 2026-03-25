import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { HeroSection } from "@/features/marketing/components/hero-section";
import { PlatformOverview } from "@/features/marketing/components/platform-overview";
import { TopicLinksSection } from "@/features/marketing/components/topic-links-section";
import { buildAppUrl, getAppBaseUrl } from "@/lib/app-url";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";

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
  const baseUrl = getAppBaseUrl();
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      url: baseUrl,
      description:
        "Online CCNA training platform with lessons, quizzes, labs, subnetting tools, and AI-guided support."
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: baseUrl,
      description:
        "Certification learning platform focused on CCNA preparation, networking practice, and guided study tools.",
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
          item: buildAppUrl("/")
        }
      ]
    }
  ];

  return (
    <div className="w-full space-y-10 pb-12">
      <JsonLd data={structuredData} />
      <HeroSection />
      <PlatformOverview />
      <TopicLinksSection />
    </div>
  );
}
