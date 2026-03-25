import type { Metadata } from "next";

import { CcnaCommercialPage } from "@/features/marketing/components/ccna-commercial-page";
import { ccnaCommercialPageMap } from "@/features/marketing/lib/ccna-commercial-pages";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { buildPageMetadata } from "@/lib/seo/metadata";

const page = ccnaCommercialPageMap[APP_ROUTES.ccnaLabSubscription];

export const metadata: Metadata = buildPageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.route,
  keywords: [
    "CCNA lab subscription",
    "CCNA labs subscription",
    "CCNA practical labs subscription",
    "CCNA hands-on practice subscription"
  ]
});

export default function CcnaLabSubscriptionPage() {
  return <CcnaCommercialPage page={page} />;
}
