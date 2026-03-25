import type { Metadata } from "next";

import { CcnaPracticeClusterPage } from "@/features/marketing/components/ccna-practice-cluster-page";
import { ccnaPracticeClusterPageMap } from "@/features/marketing/lib/ccna-practice-cluster-pages";
import { buildPageMetadata } from "@/lib/seo/metadata";

const page = ccnaPracticeClusterPageMap["/ccna-question-bank-with-explanations"];

export const metadata: Metadata = buildPageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.route,
  keywords: [page.primaryKeyword, ...page.secondaryKeywords]
});

export default function CcnaQuestionBankWithExplanationsPage() {
  return <CcnaPracticeClusterPage page={page} />;
}
