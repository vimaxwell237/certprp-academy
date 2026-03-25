import type { Metadata } from "next";

import { CcnaTrustPage } from "@/features/marketing/components/ccna-trust-page";
import { ccnaTrustPageMap } from "@/features/marketing/lib/ccna-trust-pages";
import { buildPageMetadata } from "@/lib/seo/metadata";

const page = ccnaTrustPageMap["/ccna-practice-questions-not-exam-dump"];

export const metadata: Metadata = buildPageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.route,
  keywords: [page.primaryKeyword, ...page.secondaryKeywords]
});

export default function CcnaPracticeQuestionsNotExamDumpPage() {
  return <CcnaTrustPage page={page} />;
}
