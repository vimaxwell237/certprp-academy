import type { Metadata } from "next";

import { CcnaCommercialPage } from "@/features/marketing/components/ccna-commercial-page";
import { ccnaCommercialPageMap } from "@/features/marketing/lib/ccna-commercial-pages";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { buildPageMetadata } from "@/lib/seo/metadata";

const page = ccnaCommercialPageMap[APP_ROUTES.ccnaCourseFreeTrial];

export const metadata: Metadata = buildPageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.route,
  keywords: [
    "CCNA course free trial",
    "CCNA free trial",
    "free CCNA course preview",
    "start CCNA course free"
  ]
});

export default function CcnaCourseFreeTrialPage() {
  return <CcnaCommercialPage page={page} />;
}
