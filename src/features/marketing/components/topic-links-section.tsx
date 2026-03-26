import {
  SeoRelatedContentCards,
  SeoSectionHeader
} from "@/features/marketing/components/ccna-seo-shared";
import { ccnaAuthorityPageLinks } from "@/features/marketing/lib/ccna-authority-pages";
import { marketingTopicLinks } from "@/features/marketing/lib/seo-topics";

function buildHubCtaLabel(title: string) {
  return `Explore the ${title.toLowerCase()} hub`;
}

export function TopicLinksSection() {
  return (
    <section className="space-y-5 rounded-[1.5rem] border border-white/70 bg-white/90 px-4 py-6 shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:px-10">
      <SeoSectionHeader
        eyebrow="Explore by Topic"
        intro="These focused pages make it easier to find the right CertPrep Academy study path for blueprint coverage, subnetting, lab practice, and exam preparation."
        title="Start with the CCNA study topic you want to improve next."
      />

      <SeoRelatedContentCards
        intro="Use these topic pages to understand the CCNA 200-301 v1.1 domain structure before moving into hands-on practice."
        items={ccnaAuthorityPageLinks.map((page) => ({
          ...page,
          ctaLabel: buildHubCtaLabel(page.title)
        }))}
        title="CCNA Topic Guides"
      />

      <SeoRelatedContentCards
        intro="Once you know the topic you want to strengthen, move into original practice, labs, and timed review."
        items={marketingTopicLinks.map((page) => ({
          route: page.route,
          title: page.title,
          description: page.description,
          ctaLabel: buildHubCtaLabel(page.title)
        }))}
        title="Practice Tools"
      />
    </section>
  );
}
