import type { Metadata } from "next";

import { CcnaAuthorityPage } from "@/features/marketing/components/ccna-authority-page";
import { ccnaAuthorityPageMap } from "@/features/marketing/lib/ccna-authority-pages";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { buildPageMetadata } from "@/lib/seo/metadata";

const page = ccnaAuthorityPageMap[APP_ROUTES.ccnaSecurityFundamentals];

export const metadata: Metadata = buildPageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.route,
  keywords: [page.primaryKeyword, ...page.secondaryKeywords]
});

export default function CcnaSecurityFundamentalsPage() {
  return <CcnaAuthorityPage page={page} />;
}
