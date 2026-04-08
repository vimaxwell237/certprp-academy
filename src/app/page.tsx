import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { HeroSection } from "@/features/marketing/components/hero-section";
import { PlatformOverview } from "@/features/marketing/components/platform-overview";
import { TopicLinksSection } from "@/features/marketing/components/topic-links-section";
import { buildPageMetadata } from "@/lib/seo/metadata";
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
  const structuredData = [
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
      <TopicLinksSection />
    </div>
  );
}
