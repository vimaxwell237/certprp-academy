import type { Metadata } from "next";

import { TopicLandingPage } from "@/features/marketing/components/topic-landing-page";
import { marketingTopicPageMap, marketingTopicPages } from "@/features/marketing/lib/seo-topics";
import { buildPageMetadata } from "@/lib/seo/metadata";

const page = marketingTopicPageMap["/ccna-practice-exams"];

export const metadata: Metadata = buildPageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.route,
  keywords: [page.primaryKeyword, ...page.secondaryKeywords]
});

export default function CcnaPracticeExamsPage() {
  return (
    <TopicLandingPage
      page={page}
      relatedPages={marketingTopicPages.filter((entry) => entry.route !== page.route)}
    />
  );
}
