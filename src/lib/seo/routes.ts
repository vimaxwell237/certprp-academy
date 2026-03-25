import type { MetadataRoute } from "next";

import { APP_ROUTES } from "@/lib/auth/redirects";

type SitemapEntry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

export const INDEXABLE_MARKETING_PAGES: SitemapEntry[] = [
  {
    path: APP_ROUTES.home,
    changeFrequency: "weekly",
    priority: 1
  },
  {
    path: APP_ROUTES.pricing,
    changeFrequency: "weekly",
    priority: 0.8
  },
  {
    path: APP_ROUTES.ccnaCourseSubscription,
    changeFrequency: "weekly",
    priority: 0.78
  },
  {
    path: APP_ROUTES.ccnaPracticeTestSubscription,
    changeFrequency: "weekly",
    priority: 0.78
  },
  {
    path: APP_ROUTES.ccnaCourseFreeTrial,
    changeFrequency: "weekly",
    priority: 0.78
  },
  {
    path: APP_ROUTES.ccnaCourseWithPracticeTests,
    changeFrequency: "weekly",
    priority: 0.78
  },
  {
    path: APP_ROUTES.ccnaLabSubscription,
    changeFrequency: "weekly",
    priority: 0.78
  },
  {
    path: APP_ROUTES.ccnaPracticeQuestionsNotExamDump,
    changeFrequency: "weekly",
    priority: 0.77
  },
  {
    path: APP_ROUTES.ccnaPastQuestionsEthicalAlternative,
    changeFrequency: "weekly",
    priority: 0.77
  },
  {
    path: APP_ROUTES.whatIsAllowedForCcnaPractice,
    changeFrequency: "weekly",
    priority: 0.77
  },
  {
    path: APP_ROUTES.bosonExsimCcnaReview,
    changeFrequency: "weekly",
    priority: 0.77
  },
  {
    path: APP_ROUTES.measureupCcnaPracticeTestReview,
    changeFrequency: "weekly",
    priority: 0.77
  },
  {
    path: APP_ROUTES.bosonVsMeasureupCcna,
    changeFrequency: "weekly",
    priority: 0.77
  },
  {
    path: APP_ROUTES.bestWebsiteForCcnaPractice,
    changeFrequency: "weekly",
    priority: 0.77
  },
  {
    path: APP_ROUTES.bestCcnaLabs,
    changeFrequency: "weekly",
    priority: 0.77
  },
  {
    path: APP_ROUTES.bestCcnaPracticeTests,
    changeFrequency: "weekly",
    priority: 0.77
  },
  {
    path: APP_ROUTES.ccnaTimedPracticeTest,
    changeFrequency: "weekly",
    priority: 0.77
  },
  {
    path: APP_ROUTES.ccnaMockExam200301,
    changeFrequency: "weekly",
    priority: 0.77
  },
  {
    path: APP_ROUTES.ccnaQuestionBankWithExplanations,
    changeFrequency: "weekly",
    priority: 0.77
  },
  {
    path: APP_ROUTES.ccnaPracticeTestFreeVsPaid,
    changeFrequency: "weekly",
    priority: 0.77
  },
  {
    path: APP_ROUTES.ccnaLabsWithAnswers,
    changeFrequency: "weekly",
    priority: 0.76
  },
  {
    path: APP_ROUTES.ccnaLabsForBeginners,
    changeFrequency: "weekly",
    priority: 0.76
  },
  {
    path: APP_ROUTES.ccnaPacketTracerLabsDownload,
    changeFrequency: "weekly",
    priority: 0.76
  },
  {
    path: APP_ROUTES.ccnaExamTopicsExplained,
    changeFrequency: "weekly",
    priority: 0.8
  },
  {
    path: APP_ROUTES.ccnaNetworkFundamentals,
    changeFrequency: "weekly",
    priority: 0.76
  },
  {
    path: APP_ROUTES.ccnaNetworkAccess,
    changeFrequency: "weekly",
    priority: 0.76
  },
  {
    path: APP_ROUTES.ccnaIpConnectivity,
    changeFrequency: "weekly",
    priority: 0.76
  },
  {
    path: APP_ROUTES.ccnaIpServices,
    changeFrequency: "weekly",
    priority: 0.76
  },
  {
    path: APP_ROUTES.ccnaSecurityFundamentals,
    changeFrequency: "weekly",
    priority: 0.76
  },
  {
    path: APP_ROUTES.ccnaAutomationAndProgrammability,
    changeFrequency: "weekly",
    priority: 0.76
  },
  {
    path: APP_ROUTES.ccnaSubnettingPractice,
    changeFrequency: "weekly",
    priority: 0.75
  },
  {
    path: APP_ROUTES.ccnaLabs,
    changeFrequency: "weekly",
    priority: 0.75
  },
  {
    path: APP_ROUTES.ccnaVlanLab,
    changeFrequency: "weekly",
    priority: 0.75
  },
  {
    path: APP_ROUTES.ccnaTrunkingExplained,
    changeFrequency: "weekly",
    priority: 0.75
  },
  {
    path: APP_ROUTES.ccnaOspfSingleAreaExplained,
    changeFrequency: "weekly",
    priority: 0.75
  },
  {
    path: APP_ROUTES.ccnaAclExplained,
    changeFrequency: "weekly",
    priority: 0.75
  },
  {
    path: APP_ROUTES.ccnaNatExplained,
    changeFrequency: "weekly",
    priority: 0.75
  },
  {
    path: APP_ROUTES.ccnaSshConfiguration,
    changeFrequency: "weekly",
    priority: 0.75
  },
  {
    path: APP_ROUTES.ccnaPortSecurityConfiguration,
    changeFrequency: "weekly",
    priority: 0.75
  },
  {
    path: APP_ROUTES.ccnaPracticeExams,
    changeFrequency: "weekly",
    priority: 0.75
  }
];

export const ROBOT_ALLOW_PATHS = INDEXABLE_MARKETING_PAGES.map((page) => page.path);

export const ROBOT_DISALLOW_PATHS: string[] = [
  "/admin",
  "/api",
  APP_ROUTES.aiTutor,
  APP_ROUTES.billing,
  APP_ROUTES.bookSession,
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
  APP_ROUTES.signup,
  APP_ROUTES.studyPlan,
  APP_ROUTES.subnettingPractice,
  APP_ROUTES.subnettingCalculator,
  APP_ROUTES.support,
  APP_ROUTES.tutorRoot,
  APP_ROUTES.tutors
];
