import type { Metadata } from "next";

import { CcnaCommercialPage } from "@/features/marketing/components/ccna-commercial-page";
import { ccnaCommercialPageMap } from "@/features/marketing/lib/ccna-commercial-pages";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { buildPageMetadata } from "@/lib/seo/metadata";

const page = ccnaCommercialPageMap[APP_ROUTES.ccnaCourseSubscription];

export const metadata: Metadata = buildPageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.route,
  keywords: [
    "CCNA course subscription",
    "CCNA subscription",
    "CCNA labs and practice tests",
    "CCNA course with explanations"
  ]
});

export default function CcnaCourseSubscriptionPage() {
  return <CcnaCommercialPage page={page} />;
}
