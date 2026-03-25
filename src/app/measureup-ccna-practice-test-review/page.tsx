import type { Metadata } from "next";

import { CcnaCommercialComparisonPage } from "@/features/marketing/components/ccna-commercial-comparison-page";
import { ccnaCommercialComparisonPageMap } from "@/features/marketing/lib/ccna-commercial-comparison-pages";
import { buildPageMetadata } from "@/lib/seo/metadata";

const page = ccnaCommercialComparisonPageMap["/measureup-ccna-practice-test-review"];

export const metadata: Metadata = buildPageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.route,
  keywords: [page.primaryKeyword, ...page.secondaryKeywords]
});

export default function MeasureupCcnaPracticeTestReviewPage() {
  return <CcnaCommercialComparisonPage page={page} />;
}
