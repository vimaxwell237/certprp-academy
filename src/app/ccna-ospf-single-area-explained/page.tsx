import type { Metadata } from "next";

import { CcnaLabClusterPage } from "@/features/marketing/components/ccna-lab-cluster-page";
import { ccnaLabClusterPageMap } from "@/features/marketing/lib/ccna-lab-cluster-pages";
import { buildPageMetadata } from "@/lib/seo/metadata";

const page = ccnaLabClusterPageMap["/ccna-ospf-single-area-explained"];

export const metadata: Metadata = buildPageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.route,
  keywords: [page.primaryKeyword, ...page.secondaryKeywords]
});

export default function CcnaOspfSingleAreaExplainedPage() {
  return <CcnaLabClusterPage page={page} />;
}
