import type { SeoRelatedLinkItem } from "@/features/marketing/components/ccna-seo-shared";
import { APP_ROUTES } from "@/lib/auth/redirects";

export const PRICING_SEO_LINK_ITEM: SeoRelatedLinkItem = {
  route: APP_ROUTES.pricing,
  title: "Compare CCNA Pricing",
  description:
    "Review CertPrep Academy plans to see which study path fits lessons, labs, practice exams, and guided support.",
  ctaLabel: "View pricing and plans"
};

export function dedupeSeoRelatedLinkItems(items: SeoRelatedLinkItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.route)) {
      return false;
    }

    seen.add(item.route);
    return true;
  });
}
