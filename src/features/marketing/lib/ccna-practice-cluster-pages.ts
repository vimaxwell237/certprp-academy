import { ccnaCommercialSupportLinks } from "@/features/marketing/lib/ccna-commercial-pages";
import { APP_ROUTES } from "@/lib/auth/redirects";

export interface PracticeClusterLink {
  route: string;
  title: string;
  description: string;
}

interface PracticeClusterCard {
  title: string;
  description: string;
}

interface PracticeClusterComparisonCard extends PracticeClusterCard {
  bullets: string[];
}

interface PracticeClusterFaq {
  question: string;
  answer: string;
}

export interface CcnaPracticeClusterPageContent {
  route: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroPoints: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  intentHeading: string;
  intentDescription: string;
  intentCards: PracticeClusterCard[];
  comparisonHeading: string;
  comparisonIntro: string;
  comparisonCards: PracticeClusterComparisonCard[];
  trustHeading: string;
  trustDescription: string;
  trustPoints: string[];
  objectionsHeading: string;
  objectionsIntro: string;
  objections: PracticeClusterFaq[];
  proofHeading: string;
  proofIntro: string;
  proofLinks: PracticeClusterLink[];
  conversionHeading: string;
  conversionIntro: string;
  conversionLinks: PracticeClusterLink[];
  clusterHeading: string;
  clusterIntro: string;
  clusterLinks: PracticeClusterLink[];
  ctaTitle: string;
  ctaDescription: string;
}

export const ccnaPracticeSupportLinks = {
  practiceHub: {
    route: APP_ROUTES.ccnaPracticeExams,
    title: "CCNA Practice Exams",
    description:
      "Use the broader practice-exam hub when you want a high-level view of timed review, pacing, and readiness."
  },
  practiceSubscription: {
    route: APP_ROUTES.ccnaPracticeTestSubscription,
    title: "CCNA Practice Test Subscription",
    description:
      "Move into original, exam-like practice questions with explanations, mixed-domain review, and stronger scoring feedback."
  },
  freeTrial: {
    route: APP_ROUTES.ccnaCourseFreeTrial,
    title: "CCNA Course Free Trial",
    description:
      "Start with the low-risk free account path before deciding whether full practice-test access is the right fit."
  },
  courseWithPracticeTests: {
    route: APP_ROUTES.ccnaCourseWithPracticeTests,
    title: "CCNA Course With Practice Tests",
    description:
      "See the combined course-plus-practice offer if you want lessons, labs, and review in one workflow."
  },
  bestPracticeTests: {
    route: APP_ROUTES.bestCcnaPracticeTests,
    title: "Best CCNA Practice Tests",
    description:
      "Compare what makes a CCNA practice test worth using before you commit to a study platform."
  },
  timedPracticeTest: {
    route: APP_ROUTES.ccnaTimedPracticeTest,
    title: "CCNA Timed Practice Test",
    description:
      "Focus on pacing, timer pressure, and mixed-domain speed when you need short exam-like runs."
  },
  mockExam: {
    route: APP_ROUTES.ccnaMockExam200301,
    title: "CCNA Mock Exam 200-301",
    description:
      "Choose the mock-exam path when you want a fuller CCNA 200-301 style rehearsal rather than a shorter drill."
  },
  questionBank: {
    route: APP_ROUTES.ccnaQuestionBankWithExplanations,
    title: "CCNA Question Bank With Explanations",
    description:
      "Use the question-bank page when explanation depth matters more than full-exam simulation."
  },
  freeVsPaid: {
    route: APP_ROUTES.ccnaPracticeTestFreeVsPaid,
    title: "CCNA Practice Test Free vs Paid",
    description:
      "Compare free and paid practice paths if you are deciding how much practice depth you actually need."
  },
  pricing: ccnaCommercialSupportLinks.pricing,
  topicsHub: ccnaCommercialSupportLinks.topicsHub,
  labs: ccnaCommercialSupportLinks.labs,
  subnetting: ccnaCommercialSupportLinks.subnetting
} as const;

export const ccnaPracticeClusterPages: CcnaPracticeClusterPageContent[] = [
  {
    route: APP_ROUTES.bestCcnaPracticeTests,
    title: "Best CCNA Practice Tests",
    metaTitle: "Best CCNA Practice Tests for 200-301 Preparation",
    metaDescription:
      "Compare the best CCNA practice tests for 200-301 prep, including timed review, explanations, domain coverage, and ethical original exam-like questions.",
    primaryKeyword: "best CCNA practice tests",
    secondaryKeywords: [
      "best CCNA practice test",
      "CCNA practice tests 200-301",
      "CCNA exam-like practice questions",
      "CCNA practice test with explanations"
    ],
    heroEyebrow: "Best CCNA Practice Tests",
    heroTitle: "The best CCNA practice tests help you measure readiness without turning into a dump hunt.",
    heroDescription:
      "This page is for comparison intent. It highlights the traits that matter most when you are deciding which CCNA 200-301 practice option deserves your time and money.",
    heroPoints: [
      "Original, exam-like practice questions with explanations",
      "Coverage across network fundamentals, access, connectivity, services, security, and automation",
      "Clear links into subscription, pricing, and free-start paths"
    ],
    primaryCtaLabel: "See Practice Test Subscription",
    primaryCtaHref: APP_ROUTES.ccnaPracticeTestSubscription,
    secondaryCtaLabel: "Start Free Trial Path",
    secondaryCtaHref: APP_ROUTES.ccnaCourseFreeTrial,
    intentHeading: "What this page is meant to help you decide",
    intentDescription:
      "Searchers here are usually comparing options, not looking for a single quiz. The page is built to help them evaluate quality, fit, and trust before they subscribe.",
    intentCards: [
      {
        title: "Commercial investigation intent",
        description:
          "This page serves learners comparing providers, features, and study quality rather than looking for one immediate timed run."
      },
      {
        title: "Quality-screening intent",
        description:
          "The focus is on explanation depth, domain coverage, and whether the platform uses original, exam-like practice instead of shortcuts."
      },
      {
        title: "Funnel-entry intent",
        description:
          "The conversion path points searchers toward pricing, subscription, and free-start pages once they understand the offer."
      }
    ],
    comparisonHeading: "How strong CCNA practice tests differ from weaker alternatives",
    comparisonIntro:
      "This section separates the search intent from nearby pages by focusing on evaluation criteria instead of mock-exam delivery or question-bank depth alone.",
    comparisonCards: [
      {
        title: "Best practice-test picks vs random question dumps",
        description:
          "A strong recommendation page should help the reader judge quality, not just promise volume.",
        bullets: [
          "Looks for original, exam-like practice questions rather than recalled exam content",
          "Values explanations, domain balance, and score meaning",
          "Helps buyers avoid low-trust shortcut sources"
        ]
      },
      {
        title: "Best practice-test picks vs a timed drill page",
        description:
          "Timed-practice intent is narrower. This page stays broader and comparative.",
        bullets: [
          "More focused on picking the right platform than on pacing mechanics",
          "Compares explanations, domain coverage, and learning support",
          "Links the reader toward timed practice only when that is the better fit"
        ]
      },
      {
        title: "Best practice-test picks vs free-vs-paid comparison",
        description:
          "Pricing sensitivity matters here, but it is not the whole point of the page.",
        bullets: [
          "Keeps feature quality as the main lens",
          "Touches cost without turning into a pricing-only page",
          "Uses pricing and free-trial pages as next steps, not the main content"
        ]
      }
    ],
    trustHeading: "Trust matters more than question volume",
    trustDescription:
      "The page is intentionally clear about study ethics: the best CCNA practice tests rely on original, exam-like practice questions and never claim to provide real exam questions.",
    trustPoints: [
      "Original, exam-like practice questions built for CCNA 200-301 review",
      "Explanation-driven review that helps you learn from misses",
      "Explicitly positioned away from dumps and recalled exam content"
    ],
    objectionsHeading: "What comparison-focused buyers usually want answered",
    objectionsIntro: "These objections keep the page grounded in trust, not hype.",
    objections: [
      {
        question: "Are the best CCNA practice tests the ones with the most questions?",
        answer:
          "Not by themselves. A better signal is whether the questions are original, exam-like, explained clearly, and spread across the main CCNA domains in a useful way."
      },
      {
        question: "Should a best-of page promise real exam questions?",
        answer:
          "No. Real value comes from original practice that feels exam-like while staying ethical and aligned to the public exam objectives."
      },
      {
        question: "What should I check before paying for CCNA practice?",
        answer:
          "Look for explanation quality, timed options, domain coverage, and whether the platform gives you a path back into lessons, labs, or other proof pages when you miss questions."
      }
    ],
    proofHeading: "Proof pages that support the recommendation angle",
    proofIntro:
      "These supporting pages help a buyer validate that the platform has real study depth behind the comparison copy.",
    proofLinks: [
      ccnaPracticeSupportLinks.practiceHub,
      ccnaPracticeSupportLinks.topicsHub,
      ccnaPracticeSupportLinks.labs,
      ccnaPracticeSupportLinks.subnetting
    ],
    conversionHeading: "Best next steps if you like the practice philosophy",
    conversionIntro:
      "These are the strongest commercial paths from this comparison page.",
    conversionLinks: [
      ccnaPracticeSupportLinks.practiceSubscription,
      ccnaPracticeSupportLinks.freeTrial,
      ccnaPracticeSupportLinks.pricing,
      ccnaPracticeSupportLinks.courseWithPracticeTests
    ],
    clusterHeading: "More specific CCNA practice intents",
    clusterIntro:
      "Use a narrower page if you already know the kind of practice experience you want.",
    clusterLinks: [
      ccnaPracticeSupportLinks.timedPracticeTest,
      ccnaPracticeSupportLinks.mockExam,
      ccnaPracticeSupportLinks.questionBank,
      ccnaPracticeSupportLinks.freeVsPaid
    ],
    ctaTitle: "Move from comparison into original CCNA practice",
    ctaDescription:
      "Open the practice-test subscription if you are ready for explanation-driven review, or start with the free trial path if you want to inspect the platform first."
  },
  {
    route: APP_ROUTES.ccnaTimedPracticeTest,
    title: "CCNA Timed Practice Test",
    metaTitle: "CCNA Timed Practice Test for Pacing and Exam Control",
    metaDescription:
      "Use a CCNA timed practice test to improve pacing, question control, and mixed-domain performance with original exam-like practice questions and explanations.",
    primaryKeyword: "CCNA timed practice test",
    secondaryKeywords: [
      "timed CCNA practice test",
      "CCNA timed mock test",
      "CCNA exam pacing practice",
      "CCNA practice test timer"
    ],
    heroEyebrow: "CCNA Timed Practice Test",
    heroTitle: "Timed CCNA practice is where pacing issues become obvious before exam day.",
    heroDescription:
      "This page is for learners who already want timer pressure. It focuses on shorter exam-like runs, pacing control, and what a timed practice test should actually help you improve.",
    heroPoints: [
      "Built around timer pressure and pacing control",
      "Original, exam-like practice questions with explanations after review",
      "Clear path into paid timed access or a free-start option"
    ],
    primaryCtaLabel: "Open Timed Practice Options",
    primaryCtaHref: APP_ROUTES.ccnaPracticeTestSubscription,
    secondaryCtaLabel: "Start Free Trial Path",
    secondaryCtaHref: APP_ROUTES.ccnaCourseFreeTrial,
    intentHeading: "What this page is meant to solve",
    intentDescription:
      "The user intent here is narrower than a general practice-test search. The page exists for learners who already know they need timer-based rehearsal.",
    intentCards: [
      {
        title: "Pacing-first intent",
        description:
          "The central job is helping searchers improve speed, question control, and confidence under time pressure."
      },
      {
        title: "Mixed-domain drill intent",
        description:
          "Timed practice is most useful when it pulls from multiple blueprint areas instead of repeating one tiny topic."
      },
      {
        title: "Readiness-check intent",
        description:
          "The page should guide users toward timed review without pretending a short drill replaces a full mock exam."
      }
    ],
    comparisonHeading: "How a timed practice page differs from nearby practice pages",
    comparisonIntro:
      "The content is intentionally focused on pacing mechanics so it does not cannibalize the broader mock-exam or question-bank pages.",
    comparisonCards: [
      {
        title: "Timed practice vs full mock exam",
        description:
          "Timed drills are shorter and more repeatable than a mock exam.",
        bullets: [
          "Better for frequent pacing checks during the week",
          "Useful when you want timer pressure without a full-length session",
          "Should feed into a mock exam later, not replace it entirely"
        ]
      },
      {
        title: "Timed practice vs question bank review",
        description:
          "Question banks emphasize volume and explanation depth. Timed sessions emphasize clock management.",
        bullets: [
          "Highlights speed and answer discipline",
          "Uses explanations after the run, not as the primary in-session experience",
          "Works well once you already know the basics of a topic"
        ]
      },
      {
        title: "Timed practice vs best-of comparison page",
        description:
          "This page assumes the user already wants a timed test and now cares about how that mode helps.",
        bullets: [
          "Less platform-comparison copy and more use-case clarity",
          "Explains why timer pressure improves readiness",
          "Links back to the broader comparison page only when needed"
        ]
      }
    ],
    trustHeading: "Good timed practice should feel exam-like, not unethical",
    trustDescription:
      "The trust copy here keeps the promise narrow: original, exam-like practice questions, useful explanations after review, and no claim of real exam questions.",
    trustPoints: [
      "Original timed sets that feel exam-like without pretending to be the real test",
      "Explanations that help fix pacing mistakes and content mistakes",
      "Support for domain coverage instead of one-note drilling"
    ],
    objectionsHeading: "Common questions about timed CCNA practice",
    objectionsIntro:
      "These answers separate the pacing page from the mock-exam and question-bank pages.",
    objections: [
      {
        question: "Is a timed practice test the same as a full CCNA mock exam?",
        answer:
          "No. Timed practice is usually shorter and more repeatable. It is best for pacing and pressure control, while a full mock exam is the stronger full-rehearsal option."
      },
      {
        question: "Do timed tests still need explanations?",
        answer:
          "Yes. The timer helps reveal pacing problems, but explanations are still what turn the review into learning after the run is over."
      },
      {
        question: "Should timed practice claim to use real exam questions?",
        answer:
          "No. Ethical timed practice should use original, exam-like questions and never claim to provide real exam questions."
      }
    ],
    proofHeading: "Supporting pages that reinforce timed review",
    proofIntro:
      "Use these proof pages to connect timed practice back to broader study and readiness work.",
    proofLinks: [
      ccnaPracticeSupportLinks.practiceHub,
      ccnaPracticeSupportLinks.mockExam,
      ccnaPracticeSupportLinks.topicsHub,
      ccnaPracticeSupportLinks.subnetting
    ],
    conversionHeading: "Commercial paths from timed practice intent",
    conversionIntro:
      "These routes match the likely next step for someone who wants timer-based review.",
    conversionLinks: [
      ccnaPracticeSupportLinks.practiceSubscription,
      ccnaPracticeSupportLinks.freeTrial,
      ccnaPracticeSupportLinks.pricing,
      ccnaPracticeSupportLinks.courseWithPracticeTests
    ],
    clusterHeading: "Other CCNA practice pages if your need is different",
    clusterIntro:
      "Move to one of these pages when timer pressure is not the main thing you are trying to solve.",
    clusterLinks: [
      ccnaPracticeSupportLinks.bestPracticeTests,
      ccnaPracticeSupportLinks.mockExam,
      ccnaPracticeSupportLinks.questionBank,
      ccnaPracticeSupportLinks.freeVsPaid
    ],
    ctaTitle: "Start timing your CCNA review before the real exam times you",
    ctaDescription:
      "Open the practice-test subscription for stronger timed review, or start free if you want to inspect the study flow before upgrading."
  },
  {
    route: APP_ROUTES.ccnaMockExam200301,
    title: "CCNA Mock Exam 200-301",
    metaTitle: "CCNA Mock Exam 200-301 With Original Exam-Like Practice",
    metaDescription:
      "Prepare with a CCNA mock exam for 200-301 using original exam-like practice questions, full-domain coverage, explanations, and ethical non-dump prep.",
    primaryKeyword: "CCNA mock exam 200-301",
    secondaryKeywords: [
      "CCNA 200-301 mock exam",
      "CCNA practice mock exam",
      "CCNA full mock test",
      "CCNA exam simulator practice"
    ],
    heroEyebrow: "CCNA Mock Exam 200-301",
    heroTitle: "A CCNA 200-301 mock exam should feel like a rehearsal, not a random quiz.",
    heroDescription:
      "This page targets full-rehearsal intent. It is for learners who want a broader mixed-domain run that feels closer to exam conditions than a short timed drill or a browseable question bank.",
    heroPoints: [
      "Closer to full-exam rehearsal than a short timed drill",
      "Mixed-domain coverage across the current CCNA blueprint",
      "Original, exam-like practice questions with post-run explanations"
    ],
    primaryCtaLabel: "Open Mock Exam Access",
    primaryCtaHref: APP_ROUTES.ccnaPracticeTestSubscription,
    secondaryCtaLabel: "Compare Pricing",
    secondaryCtaHref: APP_ROUTES.pricing,
    intentHeading: "What this page is built for",
    intentDescription:
      "The searcher here usually wants a fuller practice run, not a shopping guide or a topic-by-topic bank. The page is tuned to that full-mock expectation.",
    intentCards: [
      {
        title: "Full-rehearsal intent",
        description:
          "The user wants something that feels closer to sitting for a complete exam-style session."
      },
      {
        title: "Coverage-confidence intent",
        description:
          "A mock exam is useful when you need to see how multiple domains hold up together under pressure."
      },
      {
        title: "Score-meaning intent",
        description:
          "The page should make it clear that explanations and domain feedback matter after the session, not just the raw score."
      }
    ],
    comparisonHeading: "How a CCNA mock exam differs from nearby practice formats",
    comparisonIntro:
      "The copy keeps this page from overlapping with the timed-drill, question-bank, and comparison pages.",
    comparisonCards: [
      {
        title: "Mock exam vs timed practice test",
        description:
          "Both use a clock, but a mock exam is the wider rehearsal format.",
        bullets: [
          "Longer and closer to a true readiness check",
          "Better for seeing how domains hold up together",
          "Usually done less often than shorter timed drills"
        ]
      },
      {
        title: "Mock exam vs question bank with explanations",
        description:
          "A question bank lets you study item by item. A mock exam asks whether you can perform across a larger session.",
        bullets: [
          "Emphasizes session endurance and exam control",
          "Uses explanations after the run rather than during browsing",
          "Better for late-stage readiness checks"
        ]
      },
      {
        title: "Mock exam vs free-vs-paid comparison",
        description:
          "This page is about the rehearsal format itself, not budget tradeoffs.",
        bullets: [
          "Keeps the focus on exam simulation and mixed-domain pressure",
          "Uses pricing pages as a next step instead of the main topic",
          "Stays aligned to mock-exam intent to reduce overlap"
        ]
      }
    ],
    trustHeading: "A credible mock exam stays ethical and transparent",
    trustDescription:
      "The promise here is original, exam-like practice questions that support readiness. The page never suggests that the mock exam contains real exam questions.",
    trustPoints: [
      "Original, exam-like question sets aligned to the public CCNA blueprint",
      "Explanations and performance signals after the session",
      "Non-dump positioning that keeps the offer credible"
    ],
    objectionsHeading: "Questions a mock-exam page needs to answer clearly",
    objectionsIntro:
      "These are the practical concerns that usually block conversion from full-rehearsal searchers.",
    objections: [
      {
        question: "Will a mock exam tell me exactly if I will pass the real CCNA?",
        answer:
          "No single mock exam can guarantee that. Its value is in helping you rehearse pacing, mixed-domain recall, and post-run diagnosis so you can tighten weak areas before test day."
      },
      {
        question: "Is a mock exam better than a question bank for every study stage?",
        answer:
          "Not always. Mock exams are strongest when you already have baseline knowledge and want a fuller readiness check. Earlier in prep, explanation-rich question-bank review can be more efficient."
      },
      {
        question: "Should a CCNA mock exam claim to match the real exam questions?",
        answer:
          "No. Ethical CCNA prep uses original, exam-like practice questions and avoids claims about real exam questions."
      }
    ],
    proofHeading: "Proof pages that support the mock-exam angle",
    proofIntro:
      "These links help a searcher validate that the mock exam sits inside a wider study system.",
    proofLinks: [
      ccnaPracticeSupportLinks.practiceHub,
      ccnaPracticeSupportLinks.timedPracticeTest,
      ccnaPracticeSupportLinks.topicsHub,
      ccnaPracticeSupportLinks.labs
    ],
    conversionHeading: "Where to go if the mock-exam path fits you",
    conversionIntro:
      "These pages are the strongest conversion steps from full-rehearsal intent.",
    conversionLinks: [
      ccnaPracticeSupportLinks.practiceSubscription,
      ccnaPracticeSupportLinks.pricing,
      ccnaPracticeSupportLinks.freeTrial,
      ccnaPracticeSupportLinks.courseWithPracticeTests
    ],
    clusterHeading: "Other practice pages if you want a narrower format",
    clusterIntro:
      "Use one of these pages when a full mock exam is more than you need right now.",
    clusterLinks: [
      ccnaPracticeSupportLinks.bestPracticeTests,
      ccnaPracticeSupportLinks.timedPracticeTest,
      ccnaPracticeSupportLinks.questionBank,
      ccnaPracticeSupportLinks.freeVsPaid
    ],
    ctaTitle: "Rehearse the CCNA with a fuller exam-like run",
    ctaDescription:
      "Open the practice-test subscription if you are ready for full mock-exam style review, or compare pricing first if you want to evaluate plan depth."
  },
  {
    route: APP_ROUTES.ccnaQuestionBankWithExplanations,
    title: "CCNA Question Bank With Explanations",
    metaTitle: "CCNA Question Bank With Explanations and Domain Review",
    metaDescription:
      "Study with a CCNA question bank that includes original exam-like practice questions, detailed explanations, and domain coverage support for 200-301 prep.",
    primaryKeyword: "CCNA question bank with explanations",
    secondaryKeywords: [
      "CCNA question bank",
      "CCNA questions with explanations",
      "CCNA practice questions explained",
      "CCNA topic question bank"
    ],
    heroEyebrow: "CCNA Question Bank With Explanations",
    heroTitle: "A CCNA question bank becomes useful when the explanations are strong enough to teach.",
    heroDescription:
      "This page targets learners who want depth after each answer. The intent is explanation-first review, not a full mock-exam rehearsal or a pricing comparison.",
    heroPoints: [
      "Original, exam-like practice questions with teaching value after each result",
      "Useful for domain-by-domain reinforcement and weak-area cleanup",
      "Links into subscription, trial, and course-plus-practice options"
    ],
    primaryCtaLabel: "See Practice Test Subscription",
    primaryCtaHref: APP_ROUTES.ccnaPracticeTestSubscription,
    secondaryCtaLabel: "Start Free Trial Path",
    secondaryCtaHref: APP_ROUTES.ccnaCourseFreeTrial,
    intentHeading: "What this page is trying to capture",
    intentDescription:
      "Searchers here usually want a bank of review questions with enough explanation to improve understanding, not just produce a score.",
    intentCards: [
      {
        title: "Explanation-first intent",
        description:
          "The page serves learners who care about why an answer is correct and how it connects back to a CCNA domain."
      },
      {
        title: "Targeted-review intent",
        description:
          "A question bank is often used to revisit specific weak areas, not only to rehearse a full exam session."
      },
      {
        title: "Study-loop intent",
        description:
          "The strongest version of this page should connect questions back to topic guides, labs, or other proof pages when a learner misses an item."
      }
    ],
    comparisonHeading: "How this page differs from other practice-test pages",
    comparisonIntro:
      "The content stays anchored to explanation depth so it does not cannibalize the timed and mock-exam pages.",
    comparisonCards: [
      {
        title: "Question bank vs mock exam",
        description:
          "A question bank is more flexible and explanation-driven than a full rehearsal format.",
        bullets: [
          "Better for targeted cleanup after missed concepts",
          "Easier to use between lessons and labs",
          "Less focused on endurance and exam pacing"
        ]
      },
      {
        title: "Question bank vs timed practice",
        description:
          "Timed review is about pace. This page is about understanding and correction.",
        bullets: [
          "Encourages deeper review after each item or set",
          "Supports domain-specific reinforcement",
          "Works well earlier in the prep cycle"
        ]
      },
      {
        title: "Question bank vs free-vs-paid page",
        description:
          "The conversion links matter here, but the main job is still educational fit.",
        bullets: [
          "Centers on explanation quality and usefulness",
          "Keeps budget comparison as a secondary step",
          "Gives searchers a clear reason to choose this page over pricing content"
        ]
      }
    ],
    trustHeading: "Explanations are where trust gets earned",
    trustDescription:
      "The trust copy here emphasizes original, exam-like practice questions and clear rationales. It never implies access to real exam questions.",
    trustPoints: [
      "Original, exam-like questions with clear rationales",
      "Support for domain review instead of shallow answer chasing",
      "Explicit non-dump positioning and ethical prep language"
    ],
    objectionsHeading: "Questions users ask before trusting a CCNA question bank",
    objectionsIntro:
      "These objections keep the page focused on explanation quality and study value.",
    objections: [
      {
        question: "Why do explanations matter so much in a CCNA question bank?",
        answer:
          "Because explanations are what turn missed items into better understanding. Without them, a question bank mostly tells you that you were wrong without helping you fix the underlying concept."
      },
      {
        question: "Is a question bank enough by itself for CCNA prep?",
        answer:
          "Usually not. It works best when paired with topic guides, labs, and broader practice formats so you can reinforce both knowledge and application."
      },
      {
        question: "Should a CCNA question bank promise real exam questions?",
        answer:
          "No. A credible CCNA question bank should use original, exam-like practice questions and make that distinction clear."
      }
    ],
    proofHeading: "Proof pages that make the question bank more credible",
    proofIntro:
      "These links show the study support around the question bank rather than leaving it as an isolated bank of items.",
    proofLinks: [
      ccnaPracticeSupportLinks.practiceHub,
      ccnaPracticeSupportLinks.topicsHub,
      ccnaPracticeSupportLinks.labs,
      ccnaPracticeSupportLinks.subnetting
    ],
    conversionHeading: "Commercial routes that fit explanation-first searchers",
    conversionIntro:
      "These pages match the next step for learners who want more than a bare bank of questions.",
    conversionLinks: [
      ccnaPracticeSupportLinks.practiceSubscription,
      ccnaPracticeSupportLinks.courseWithPracticeTests,
      ccnaPracticeSupportLinks.freeTrial,
      ccnaPracticeSupportLinks.pricing
    ],
    clusterHeading: "Other practice pages when explanations are not the main need",
    clusterIntro:
      "Move to one of these pages if you are looking for a different kind of practice experience.",
    clusterLinks: [
      ccnaPracticeSupportLinks.bestPracticeTests,
      ccnaPracticeSupportLinks.timedPracticeTest,
      ccnaPracticeSupportLinks.mockExam,
      ccnaPracticeSupportLinks.freeVsPaid
    ],
    ctaTitle: "Choose a question bank that teaches while it tests",
    ctaDescription:
      "Open the practice-test subscription for explanation-driven review, or start free if you want to inspect the platform before upgrading."
  },
  {
    route: APP_ROUTES.ccnaPracticeTestFreeVsPaid,
    title: "CCNA Practice Test Free vs Paid",
    metaTitle: "CCNA Practice Test Free vs Paid: What Actually Changes",
    metaDescription:
      "Compare free vs paid CCNA practice tests, including explanation depth, domain coverage, timed access, and when paid practice is worth it for 200-301 prep.",
    primaryKeyword: "CCNA practice test free vs paid",
    secondaryKeywords: [
      "free vs paid CCNA practice test",
      "CCNA free practice test vs paid",
      "CCNA practice test pricing comparison",
      "best paid CCNA practice test"
    ],
    heroEyebrow: "CCNA Practice Test Free vs Paid",
    heroTitle: "Free CCNA practice can help you start, but paid practice usually changes the depth of feedback.",
    heroDescription:
      "This page targets cost-comparison intent. It helps searchers decide when a free practice path is enough, when paid practice adds real value, and which next step makes sense.",
    heroPoints: [
      "Clear free-vs-paid comparison without pretending more is always necessary",
      "Strong links into the free-trial path, pricing page, and practice subscription",
      "Trust copy centered on original, exam-like practice questions rather than dumps"
    ],
    primaryCtaLabel: "Start Free Trial Path",
    primaryCtaHref: APP_ROUTES.ccnaCourseFreeTrial,
    secondaryCtaLabel: "Compare Paid Plans",
    secondaryCtaHref: APP_ROUTES.pricing,
    intentHeading: "What this comparison page is built to answer",
    intentDescription:
      "Searchers here are cost-aware and decision-ready. The page needs to be honest about what free practice can do and where paid access becomes meaningfully better.",
    intentCards: [
      {
        title: "Budget-comparison intent",
        description:
          "The main question is not whether practice matters. It is whether the extra paid depth is worth the cost right now."
      },
      {
        title: "Expectation-setting intent",
        description:
          "The page should reduce friction by explaining what free access is good for and what it usually cannot provide in the same depth."
      },
      {
        title: "Upgrade-readiness intent",
        description:
          "This is a strong conversion page when it gives searchers an honest bridge from free exploration into paid practice."
      }
    ],
    comparisonHeading: "What usually changes between free and paid CCNA practice",
    comparisonIntro:
      "This section is deliberately comparison-led so the page does not overlap with the best-of, mock-exam, or question-bank pages.",
    comparisonCards: [
      {
        title: "Free practice",
        description:
          "Free access is often best for sampling the platform and confirming the study style fits you.",
        bullets: [
          "Good for low-risk exploration and early orientation",
          "Useful when you want to inspect topic flow before committing",
          "Usually lighter on timed depth and broader review access"
        ]
      },
      {
        title: "Paid practice",
        description:
          "Paid practice starts to matter when you need more repetition, stronger explanations, and fuller mixed-domain review.",
        bullets: [
          "More practice volume and stronger review loops",
          "Better support for timed sessions and broader coverage",
          "Easier to connect missed items back to labs, lessons, and proof pages"
        ]
      },
      {
        title: "How this differs from the best-of page",
        description:
          "This page is less about ranking providers and more about matching spend to study need.",
        bullets: [
          "Keeps budget and value tradeoffs at the center",
          "Uses trust and fit language instead of broad provider comparison",
          "Directs users into either free-start or paid paths depending on readiness"
        ]
      }
    ],
    trustHeading: "Free vs paid should still stay anchored to ethical prep",
    trustDescription:
      "Both free and paid study paths should rely on original, exam-like practice questions. The page makes that distinction explicit and never claims real exam questions.",
    trustPoints: [
      "Original, exam-like practice questions across the study funnel",
      "Clear explanation of what free access is and is not",
      "Paid value tied to depth, feedback, and coverage rather than hype"
    ],
    objectionsHeading: "Questions that usually block the free-to-paid decision",
    objectionsIntro:
      "These answers help the page convert without overselling paid access.",
    objections: [
      {
        question: "Can free CCNA practice still be useful?",
        answer:
          "Yes. Free practice is useful for evaluating the platform, reviewing the study structure, and starting with a low-risk path. It just may not provide the same volume or depth of review as paid access."
      },
      {
        question: "When is paid CCNA practice worth it?",
        answer:
          "Paid practice is usually worth it when you need more timed review, stronger explanations, broader domain coverage, and a more connected study loop back into lessons or labs."
      },
      {
        question: "Does paid practice mean access to real exam questions?",
        answer:
          "No. Paid value should come from original, exam-like practice questions, explanations, and study support, not from unethical claims about real exam questions."
      }
    ],
    proofHeading: "Proof pages that help with the free-vs-paid decision",
    proofIntro:
      "These supporting pages show what the broader study platform looks like before you choose a path.",
    proofLinks: [
      ccnaPracticeSupportLinks.practiceHub,
      ccnaPracticeSupportLinks.topicsHub,
      ccnaPracticeSupportLinks.labs,
      ccnaPracticeSupportLinks.questionBank
    ],
    conversionHeading: "Next steps from the free-vs-paid comparison",
    conversionIntro:
      "Use the path below that matches your budget confidence and study urgency.",
    conversionLinks: [
      ccnaPracticeSupportLinks.freeTrial,
      ccnaPracticeSupportLinks.pricing,
      ccnaPracticeSupportLinks.practiceSubscription,
      ccnaPracticeSupportLinks.courseWithPracticeTests
    ],
    clusterHeading: "Other practice pages when price comparison is not your main question",
    clusterIntro:
      "Pick a narrower page if you already know the practice format you want.",
    clusterLinks: [
      ccnaPracticeSupportLinks.bestPracticeTests,
      ccnaPracticeSupportLinks.timedPracticeTest,
      ccnaPracticeSupportLinks.mockExam,
      ccnaPracticeSupportLinks.questionBank
    ],
    ctaTitle: "Start free if you need proof first, upgrade when deeper practice becomes necessary",
    ctaDescription:
      "Use the free-start path if you are still evaluating, or compare paid plans now if you already know you need more timed, mixed-domain, explanation-driven practice."
  }
];

export const ccnaPracticeClusterPageMap = Object.fromEntries(
  ccnaPracticeClusterPages.map((page) => [page.route, page])
) as Record<string, CcnaPracticeClusterPageContent>;
