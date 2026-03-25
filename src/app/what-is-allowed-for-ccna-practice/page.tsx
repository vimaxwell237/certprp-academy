import type { Metadata } from "next";

import { CcnaTrustPage } from "@/features/marketing/components/ccna-trust-page";
import { ccnaTrustPageMap } from "@/features/marketing/lib/ccna-trust-pages";
import { buildPageMetadata } from "@/lib/seo/metadata";

const page = ccnaTrustPageMap["/what-is-allowed-for-ccna-practice"];

export const metadata: Metadata = buildPageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.route,
  keywords: [page.primaryKeyword, ...page.secondaryKeywords]
});

export default function WhatIsAllowedForCcnaPracticePage() {
  return <CcnaTrustPage page={page} />;
}
