import { APP_ROUTES } from "@/lib/auth/redirects";

export interface MarketingTopicLink {
  route: string;
  title: string;
  description: string;
}

export interface MarketingLandingPageContent {
  route: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  keyPoints: {
    title: string;
    description: string;
  }[];
  certPrepSupport: {
    title: string;
    description: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const marketingTopicLinks: MarketingTopicLink[] = [
  {
    route: APP_ROUTES.ccnaSubnettingPractice,
    title: "CCNA Subnetting Practice",
    description:
      "Build faster subnetting confidence with guided practice, clearer explanations, and a dedicated path into addressing-focused CCNA review."
  },
  {
    route: APP_ROUTES.ccnaLabs,
    title: "CCNA Labs",
    description:
      "Practice CCNA labs with guided networking tasks, configuration workflows, and hands-on learning built for real exam preparation."
  },
  {
    route: APP_ROUTES.ccnaPracticeExams,
    title: "CCNA Practice Exams",
    description:
      "Explore the broader CCNA practice exams hub for mixed-domain review, pacing support, and readiness planning before you move into narrower mock-exam or question-bank formats."
  }
];

export const marketingTopicPages: MarketingLandingPageContent[] = [
  {
    route: APP_ROUTES.ccnaLabs,
    title: "CCNA Labs",
    metaTitle: "CCNA Labs",
    metaDescription:
      "Practice CCNA labs with guided networking tasks, configuration workflows, and hands-on learning built for real exam preparation.",
    heroEyebrow: "CCNA Labs",
    heroTitle: "CCNA labs that connect theory to real networking practice.",
    heroDescription:
      "Study switching, routing, addressing, and troubleshooting through practical lab work that helps you apply what you learn instead of only reading it.",
    primaryKeyword: "CCNA labs",
    secondaryKeywords: [
      "Cisco CCNA labs",
      "CCNA practice labs",
      "networking labs for CCNA",
      "CCNA hands-on practice"
    ],
    keyPoints: [
      {
        title: "Apply configuration knowledge",
        description:
          "Hands-on lab work helps you move from memorizing commands into understanding why network configurations behave the way they do."
      },
      {
        title: "Practice troubleshooting in context",
        description:
          "Labs give you a realistic place to verify interfaces, VLANs, routes, and services when something is not working as expected."
      },
      {
        title: "Build confidence before the exam",
        description:
          "Regular CCNA lab practice makes exam objectives feel more familiar because you have already seen the technologies in action."
      }
    ],
    certPrepSupport: [
      {
        title: "Structured lab progression",
        description:
          "Move through labs that align with the lesson flow, so each practice session reinforces the module you are already studying."
      },
      {
        title: "Clear learner guidance",
        description:
          "Use an easier workflow for opening labs, tracking progress, and returning to the next practical task inside your study path."
      },
      {
        title: "Integrated study tools",
        description:
          "Support lab learning with related lessons, quizzes, and guided explanations so practice fits into a complete CCNA routine."
      }
    ],
    faqs: [
      {
        question: "Are CCNA labs necessary for exam prep?",
        answer:
          "CCNA labs are one of the best ways to build confidence because they help you apply switching, routing, and troubleshooting concepts in a practical way."
      },
      {
        question: "What topics should CCNA labs cover?",
        answer:
          "Good CCNA labs should cover VLANs, trunks, routing, addressing, network services, security basics, and verification commands."
      },
      {
        question: "How often should I practice CCNA labs?",
        answer:
          "Short, regular sessions usually work best. Practicing a few focused labs each week helps concepts stick better than occasional long cram sessions."
      }
    ]
  },
  {
    route: APP_ROUTES.ccnaPracticeExams,
    title: "CCNA Practice Exams",
    metaTitle: "CCNA Practice Exams",
    metaDescription:
      "Explore the broader CCNA practice exams hub for mixed-domain review, pacing support, and readiness planning before you move into narrower mock-exam or question-bank formats.",
    heroEyebrow: "CCNA Practice Exams",
    heroTitle: "CCNA practice exams that help you organize mixed-domain review before test day.",
    heroDescription:
      "Use this broader practice-exam hub to strengthen pacing, topic retention, and confidence across routing, switching, subnetting, security, and IP services before you choose a narrower practice format.",
    primaryKeyword: "CCNA practice exams",
    secondaryKeywords: [
      "CCNA practice exam hub",
      "Cisco CCNA exam practice",
      "CCNA readiness practice",
      "CCNA mixed-domain review"
    ],
    keyPoints: [
      {
        title: "Review the full exam scope",
        description:
          "Practice exams help you revisit multiple blueprint areas in one session instead of studying each topic in isolation."
      },
      {
        title: "Improve pacing and exam control",
        description:
          "Timed practice teaches you how to move through questions steadily and spot where you tend to overthink or slow down."
      },
      {
        title: "Find weak areas early",
        description:
          "Results make it easier to identify whether you need more work on subnetting, routing, security, automation, or other CCNA topics."
      }
    ],
    certPrepSupport: [
      {
        title: "Exam simulator access",
        description:
          "Use simulated exam workflows to practice under conditions that feel closer to the real CCNA testing experience."
      },
      {
        title: "Quiz and lesson reinforcement",
        description:
          "Move from full practice exams back into lessons and quizzes so weak areas can be reviewed quickly."
      },
      {
        title: "Progress-aware study support",
        description:
          "Combine practice exam results with your broader study path so your prep stays organized and easier to manage."
      }
    ],
    faqs: [
      {
        question: "Do CCNA practice exams help with readiness?",
        answer:
          "Yes. Practice exams are useful for checking topic retention, pacing, and confidence before taking the real exam."
      },
      {
        question: "What should a good CCNA practice exam include?",
        answer:
          "A strong CCNA practice exam should reflect the blueprint, cover multiple topic areas, and help you review both accuracy and time management."
      },
      {
        question: "When should I start taking CCNA practice exams?",
        answer:
          "Start once you have covered a meaningful portion of the curriculum, then increase frequency as you get closer to exam day."
      }
    ]
  }
];

export const marketingTopicPageMap = Object.fromEntries(
  marketingTopicPages.map((page) => [page.route, page])
) as Record<string, MarketingLandingPageContent>;
