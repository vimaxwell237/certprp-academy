import type { MetadataRoute } from "next";

import { ccnaAuthorityPages } from "@/features/marketing/lib/ccna-authority-pages";
import { ccnaCommercialComparisonPages } from "@/features/marketing/lib/ccna-commercial-comparison-pages";
import { ccnaCommercialPages } from "@/features/marketing/lib/ccna-commercial-pages";
import { ccnaLabClusterPages } from "@/features/marketing/lib/ccna-lab-cluster-pages";
import { ccnaPracticeClusterPages } from "@/features/marketing/lib/ccna-practice-cluster-pages";
import { ccnaTrustPages } from "@/features/marketing/lib/ccna-trust-pages";
import { marketingTopicPages } from "@/features/marketing/lib/seo-topics";
import { APP_ROUTES } from "@/lib/auth/redirects";

type SitemapEntry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const PRIORITY_BY_GROUP = {
  home: 1,
  pricing: 0.85,
  authority: 0.8,
  topic: 0.78,
  commercial: 0.78,
  practice: 0.77,
  labs: 0.76,
  trust: 0.76,
  comparison: 0.75
} as const;

const CHANGE_FREQUENCY_BY_GROUP = {
  home: "weekly",
  pricing: "weekly",
  authority: "weekly",
  topic: "weekly",
  commercial: "weekly",
  practice: "weekly",
  labs: "weekly",
  trust: "monthly",
  comparison: "monthly"
} as const satisfies Record<
  keyof typeof PRIORITY_BY_GROUP,
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

function createSitemapEntry(
  path: string,
  group: keyof typeof PRIORITY_BY_GROUP
): SitemapEntry {
  return {
    path,
    changeFrequency: CHANGE_FREQUENCY_BY_GROUP[group],
    priority: PRIORITY_BY_GROUP[group]
  };
}

function buildIndexableMarketingPages() {
  const pages = new Map<string, SitemapEntry>();

  const addPages = (
    paths: string[],
    group: keyof typeof PRIORITY_BY_GROUP
  ) => {
    paths.forEach((path) => {
      if (pages.has(path)) {
        return;
      }

      pages.set(path, createSitemapEntry(path, group));
    });
  };

  addPages([APP_ROUTES.home], "home");
  addPages([APP_ROUTES.pricing], "pricing");
  addPages(ccnaAuthorityPages.map((page) => page.route), "authority");
  addPages(marketingTopicPages.map((page) => page.route), "topic");
  addPages(ccnaCommercialPages.map((page) => page.route), "commercial");
  addPages(ccnaPracticeClusterPages.map((page) => page.route), "practice");
  addPages(ccnaLabClusterPages.map((page) => page.route), "labs");
  addPages(ccnaTrustPages.map((page) => page.route), "trust");
  addPages(
    ccnaCommercialComparisonPages.map((page) => page.route),
    "comparison"
  );

  return Array.from(pages.values());
}

export const INDEXABLE_MARKETING_PAGES = buildIndexableMarketingPages();

export const ROBOT_ALLOW_PATHS = ["/"];

export const ROBOT_DISALLOW_PATHS: string[] = [
  "/admin",
  "/api",
  "/auth",
  APP_ROUTES.aiTutor,
  APP_ROUTES.billing,
  APP_ROUTES.bookSession,
  "/checkout",
  APP_ROUTES.checkoutCancel,
  APP_ROUTES.checkoutSuccess,
  APP_ROUTES.cliPractice,
  APP_ROUTES.community,
  APP_ROUTES.courses,
  APP_ROUTES.dashboard,
  APP_ROUTES.examSimulator,
  APP_ROUTES.labs,
  APP_ROUTES.login,
  APP_ROUTES.notifications,
  APP_ROUTES.quizzes,
  APP_ROUTES.recommendations,
  APP_ROUTES.sessions,
  "/settings",
  APP_ROUTES.signup,
  APP_ROUTES.studyPlan,
  APP_ROUTES.subnettingPractice,
  APP_ROUTES.subnettingCalculator,
  APP_ROUTES.support,
  APP_ROUTES.tutorRoot,
  APP_ROUTES.tutors
];
