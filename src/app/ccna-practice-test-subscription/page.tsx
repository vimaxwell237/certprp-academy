import type { Metadata } from "next";

import { CcnaCommercialPage } from "@/features/marketing/components/ccna-commercial-page";
import { ccnaCommercialPageMap } from "@/features/marketing/lib/ccna-commercial-pages";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { buildPageMetadata } from "@/lib/seo/metadata";

const page = ccnaCommercialPageMap[APP_ROUTES.ccnaPracticeTestSubscription];

export const metadata: Metadata = buildPageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.route,
  keywords: [
    "CCNA practice test subscription",
    "CCNA practice exam subscription",
    "CCNA practice tests with explanations",
    "CCNA mock test subscription"
  ]
});

export default function CcnaPracticeTestSubscriptionPage() {
  return <CcnaCommercialPage page={page} />;
}
