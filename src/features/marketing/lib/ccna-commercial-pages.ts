import { APP_ROUTES } from "@/lib/auth/redirects";

export interface CommercialLink {
  route: string;
  title: string;
  description: string;
}

interface CommercialBenefit {
  title: string;
  description: string;
}

interface CommercialCoverageSection {
  title: string;
  description: string;
  bullets: string[];
}

interface CommercialFaq {
  question: string;
  answer: string;
}

export interface CcnaCommercialPageContent {
  route: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  schemaType: "Product" | "Course";
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroProofPoints: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  valueHeading: string;
  valueIntro: string;
  valueProps: CommercialBenefit[];
  coverageHeading: string;
  coverageIntro: string;
  coverageSections: CommercialCoverageSection[];
  objectionsHeading: string;
  objectionsIntro: string;
  objections: CommercialFaq[];
  trustHeading: string;
  trustDescription: string;
  trustPoints: string[];
  proofHeading: string;
  proofIntro: string;
  proofLinks: CommercialLink[];
  ctaTitle: string;
  ctaDescription: string;
}

export const ccnaCommercialSupportLinks = {
  pricing: {
    route: APP_ROUTES.pricing,
    title: "CCNA Pricing",
    description:
      "Compare Free, Premium, and Tutor Plan access for lessons, labs, practice tests, and guided study tools."
  },
  topicsHub: {
    route: APP_ROUTES.ccnaExamTopicsExplained,
    title: "CCNA Exam Topics Explained",
    description:
      "See how the CCNA 200-301 v1.1 domains fit together before choosing a subscription path."
  },
  practiceExams: {
    route: APP_ROUTES.ccnaPracticeExams,
    title: "CCNA Practice Exams",
    description:
      "Review timed, original CCNA-style practice with explanations that point back to weak domains."
  },
  labs: {
    route: APP_ROUTES.ccnaLabs,
    title: "CCNA Labs",
    description:
      "Explore guided labs that reinforce switching, routing, services, security, and troubleshooting."
  },
  subnetting: {
    route: APP_ROUTES.ccnaSubnettingPractice,
    title: "CCNA Subnetting Practice",
    description:
      "Build IPv4 speed and accuracy with original subnetting drills and explanation-driven review."
  },
  fundamentals: {
    route: APP_ROUTES.ccnaNetworkFundamentals,
    title: "CCNA Network Fundamentals",
    description:
      "See how the platform supports models, addressing, Ethernet, IPv6, and verification skills."
  }
} as const;

export const ccnaCommercialPages: CcnaCommercialPageContent[] = [
  {
    route: APP_ROUTES.ccnaCourseSubscription,
    title: "CCNA Course Subscription",
    metaTitle: "CCNA Course Subscription With Labs and Practice Tests",
    metaDescription:
      "Subscribe to a CCNA study platform with structured lessons, labs, practice tests, explanations, and ethical original CCNA-style preparation.",
    schemaType: "Course",
    heroEyebrow: "CCNA Course Subscription",
    heroTitle: "A CCNA course subscription built around labs, practice tests, and explanations.",
    heroDescription:
      "This is the all-in-one commercial path for learners who want structured CCNA 200-301 v1.1 coverage, original practice, and a cleaner study workflow than scattered videos and disconnected tools.",
    heroProofPoints: [
      "Labs, practice tests, and explanations in one study system",
      "Coverage across network fundamentals, access, connectivity, services, security, and automation",
      "Original CCNA-style practice designed for ethical, non-dump preparation"
    ],
    primaryCtaLabel: "Compare Subscription Plans",
    primaryCtaHref: APP_ROUTES.pricing,
    secondaryCtaLabel: "Start Free Account",
    secondaryCtaHref: APP_ROUTES.signup,
    valueHeading: "What this subscription is designed to solve",
    valueIntro:
      "Serious learners usually do not need more disconnected content. They need a study system that helps them understand a topic, practice it, and verify progress without guesswork.",
    valueProps: [
      {
        title: "Study and practice stay connected",
        description:
          "Lessons, labs, and practice tests reinforce each other so you can move from concept review into application without switching platforms."
      },
      {
        title: "Explanations support retention",
        description:
          "Original CCNA-style practice is paired with explanations that help you understand why an answer or workflow is correct, not just whether it is correct."
      },
      {
        title: "The full blueprint stays visible",
        description:
          "You can keep domain coverage in view while still drilling into subnetting, labs, services, security, and mixed review."
      }
    ],
    coverageHeading: "Coverage that supports the whole CCNA study path",
    coverageIntro:
      "The subscription is meant to support more than one narrow topic. It is designed around the broader CCNA 200-301 v1.1 learning journey.",
    coverageSections: [
      {
        title: "Core domain coverage",
        description:
          "Use the platform to work across the six main CCNA domains instead of treating each topic as a disconnected island.",
        bullets: [
          "Network fundamentals, network access, and IP connectivity",
          "IP services, security fundamentals, and automation awareness",
          "Topic guides that help you see how domains connect"
        ]
      },
      {
        title: "Original practice formats",
        description:
          "The subscription combines multiple practice modes so you can reinforce knowledge in more than one way.",
        bullets: [
          "Guided labs and Packet Tracer style workflows",
          "Original practice tests with explanations",
          "Targeted drills such as subnetting and verification practice"
        ]
      },
      {
        title: "Progress-ready learning flow",
        description:
          "It is easier to keep momentum when you can review, practice, and revisit weak areas inside one experience.",
        bullets: [
          "Move from explanation to practice without context loss",
          "Use proof pages to decide where to focus next",
          "Escalate from topic learning into timed review when ready"
        ]
      }
    ],
    objectionsHeading: "Common reasons learners hesitate before subscribing",
    objectionsIntro:
      "The highest-friction questions usually come down to value, ethics, and whether the course actually supports real exam preparation.",
    objections: [
      {
        question: "Is this built around real exam questions or dumps?",
        answer:
          "No. The platform emphasizes ethical preparation with original CCNA-style practice, explanations, and labs aligned to the public CCNA 200-301 v1.1 topic outline."
      },
      {
        question: "Do I need separate tools for labs and practice tests?",
        answer:
          "The goal is to reduce that fragmentation. The subscription combines structured topic coverage, original practice tests, labs, and supporting explanations in one place."
      },
      {
        question: "Will this still help if I am weak in only one or two domains?",
        answer:
          "Yes. You can use the topic guides and proof pages to focus on a specific domain first, then expand into broader review as your confidence grows."
      }
    ],
    trustHeading: "Built for ethical CCNA preparation, not shortcut culture",
    trustDescription:
      "This experience is positioned around original study material, original CCNA-style practice, and transparent alignment to the public exam blueprint.",
    trustPoints: [
      "Aligned to the public CCNA 200-301 v1.1 outline",
      "Original practice, explanations, and lab workflows",
      "Designed to help learners build durable understanding instead of memorize dumps"
    ],
    proofHeading: "Proof pages that support the subscription decision",
    proofIntro:
      "Use these pages to inspect the actual study experience before choosing a plan.",
    proofLinks: [
      ccnaCommercialSupportLinks.topicsHub,
      ccnaCommercialSupportLinks.labs,
      ccnaCommercialSupportLinks.practiceExams,
      ccnaCommercialSupportLinks.subnetting
    ],
    ctaTitle: "Choose the plan that fits your CCNA study intensity",
    ctaDescription:
      "Compare subscription options if you are ready for the full experience, or start with a free account if you want to evaluate the platform first."
  },
  {
    route: APP_ROUTES.ccnaPracticeTestSubscription,
    title: "CCNA Practice Test Subscription",
    metaTitle: "CCNA Practice Test Subscription With Explanations",
    metaDescription:
      "Get a CCNA practice test subscription with original CCNA-style review, explanations, domain coverage support, and ethical non-dump preparation.",
    schemaType: "Product",
    heroEyebrow: "CCNA Practice Test Subscription",
    heroTitle: "A CCNA practice test subscription that goes beyond answer checking.",
    heroDescription:
      "Use this path when your main goal is better review, better explanations, and better coverage across the CCNA domains without relying on recalled exam content.",
    heroProofPoints: [
      "Original CCNA-style practice tests with explanations",
      "Practice tied back to domain coverage and study gaps",
      "Ethical non-dump preparation designed for long-term retention"
    ],
    primaryCtaLabel: "View Pricing",
    primaryCtaHref: APP_ROUTES.pricing,
    secondaryCtaLabel: "Start Free Account",
    secondaryCtaHref: APP_ROUTES.signup,
    valueHeading: "Why this converts better than a bare question bank",
    valueIntro:
      "Many learners do not need more random questions. They need practice that helps them identify weak domains, understand mistakes, and return to the right supporting material.",
    valueProps: [
      {
        title: "Explanations turn review into learning",
        description:
          "Each practice workflow is meant to reinforce why a concept is right, not just whether you guessed correctly."
      },
      {
        title: "Domain signals reduce wasted study time",
        description:
          "Instead of reviewing blindly, you can connect practice performance back to specific CCNA domains and topic pages."
      },
      {
        title: "Original practice keeps prep ethical",
        description:
          "The value proposition is built around original CCNA-style review rather than recycled or unethical exam content."
      }
    ],
    coverageHeading: "What this subscription supports",
    coverageIntro:
      "Practice tests convert best when they are surrounded by domain context, explanation quality, and related proof pages.",
    coverageSections: [
      {
        title: "Mixed-domain readiness",
        description:
          "The subscription helps you review across the broader CCNA scope instead of staying trapped in one topic silo.",
        bullets: [
          "Coverage signals across the main CCNA domains",
          "Support for topic-to-topic review transitions",
          "A smoother move from targeted study into timed practice"
        ]
      },
      {
        title: "Explanation-driven review",
        description:
          "Questions are more useful when the follow-up explains the networking logic behind the result.",
        bullets: [
          "Answer explanations that reinforce understanding",
          "A better loop between missed items and related study",
          "Cleaner reinforcement for services, security, and routing logic"
        ]
      },
      {
        title: "Proof links into the broader platform",
        description:
          "If a practice session shows a gap, you can move into supporting topic pages, labs, and drills instead of starting over elsewhere.",
        bullets: [
          "Related study links for weaker domains",
          "Internal paths to labs and subnetting practice",
          "A better bridge from review into correction"
        ]
      }
    ],
    objectionsHeading: "Objections this page needs to answer clearly",
    objectionsIntro:
      "Transactional intent is high here, so the page should address the difference between ethical review and low-value question banks.",
    objections: [
      {
        question: "Are these real CCNA exam questions?",
        answer:
          "No. The subscription emphasizes original CCNA-style practice designed to be ethical, instructive, and aligned to the public topic outline."
      },
      {
        question: "Do I get explanations or only scores?",
        answer:
          "The value proposition here depends on explanations. Practice is intended to help you learn from mistakes, not just record them."
      },
      {
        question: "Will this help if my weak areas are different from someone else’s?",
        answer:
          "Yes. Practice tests are most useful when paired with domain-level support, so you can review the specific areas where you are losing points."
      }
    ],
    trustHeading: "A better alternative to low-trust CCNA practice sources",
    trustDescription:
      "The page positions the subscription around explanation quality, original CCNA-style practice, and ethical preparation rather than shortcut claims.",
    trustPoints: [
      "Original practice tests rather than dumps",
      "Explanations that support actual concept retention",
      "Internal links back to topic pages, labs, and review tools"
    ],
    proofHeading: "Supporting pages worth checking before you buy",
    proofIntro:
      "These proof pages show how the practice-test workflow fits into the wider study platform.",
    proofLinks: [
      ccnaCommercialSupportLinks.practiceExams,
      ccnaCommercialSupportLinks.topicsHub,
      ccnaCommercialSupportLinks.fundamentals,
      ccnaCommercialSupportLinks.subnetting
    ],
    ctaTitle: "Upgrade into explanation-driven CCNA practice",
    ctaDescription:
      "Open pricing if you want full review access, or create a free account first if you want to see the platform before upgrading."
  },
  {
    route: APP_ROUTES.ccnaCourseFreeTrial,
    title: "CCNA Course Free Trial",
    metaTitle: "CCNA Course Free Trial and Free Start Option",
    metaDescription:
      "Start a CCNA course free trial style experience with free account access, topic guides, selected preview content, and a clean path into paid study when ready.",
    schemaType: "Course",
    heroEyebrow: "CCNA Course Free Trial",
    heroTitle: "Start your CCNA course path with a free account and preview access.",
    heroDescription:
      "This page is for learners who want a low-risk starting point. You can begin with a free account, review the domain structure, explore selected content, and decide later whether full subscription access is worth it.",
    heroProofPoints: [
      "Free-start path before committing to paid access",
      "Preview the platform structure, topic guides, and selected study content",
      "Move into full labs and practice when you are ready"
    ],
    primaryCtaLabel: "Start Free Account",
    primaryCtaHref: APP_ROUTES.signup,
    secondaryCtaLabel: "Compare Paid Plans",
    secondaryCtaHref: APP_ROUTES.pricing,
    valueHeading: "Why a free-start page matters for conversion",
    valueIntro:
      "Many learners are willing to subscribe, but only after they understand the platform, trust the study philosophy, and see whether the experience feels organized enough to use consistently.",
    valueProps: [
      {
        title: "You can evaluate the study flow first",
        description:
          "A free start gives you space to see the domain structure, platform quality, and supporting proof pages before deciding on a plan."
      },
      {
        title: "The learning path is still structured",
        description:
          "Even the free entry point is framed around the CCNA blueprint, original study material, and connected supporting pages."
      },
      {
        title: "Upgrading later stays simple",
        description:
          "If the platform fits your study style, you can move from free access into plans that unlock broader labs, practice tests, and exam review."
      }
    ],
    coverageHeading: "What the free-start path is meant to show you",
    coverageIntro:
      "This page should set clear expectations: free access is a starting point, while fuller subscription value appears when you need more practice depth.",
    coverageSections: [
      {
        title: "Blueprint visibility first",
        description:
          "You can understand the overall exam scope before deciding how deep you want to go with paid preparation.",
        bullets: [
          "Start with the topic hub and domain guides",
          "See how the six CCNA domains connect",
          "Use proof pages to decide where to begin"
        ]
      },
      {
        title: "Preview before paid commitment",
        description:
          "The free path is designed to reduce hesitation while staying honest about where paid access creates more value.",
        bullets: [
          "Selected preview content for evaluation",
          "A clear path to pricing when you want more",
          "No need to commit before seeing the platform"
        ]
      },
      {
        title: "Natural path into full practice",
        description:
          "Once you are ready for more depth, the paid experience adds the heavier practice loop that many learners actually need.",
        bullets: [
          "Labs plus practice tests plus explanations",
          "Better reinforcement for weaker domains",
          "A more complete study system for exam readiness"
        ]
      }
    ],
    objectionsHeading: "Questions a free-trial page should answer honestly",
    objectionsIntro:
      "This page converts best when it reduces uncertainty without overstating what free access includes.",
    objections: [
      {
        question: "Is this a full paid plan for free?",
        answer:
          "No. The free-start experience is meant to help you evaluate the platform and begin learning, while broader lab and practice access lives inside paid plans."
      },
      {
        question: "Can I still learn something useful before upgrading?",
        answer:
          "Yes. The free path is still structured around the CCNA 200-301 v1.1 topic outline, original study material, and proof pages that help you orient quickly."
      },
      {
        question: "What happens if I want more practice later?",
        answer:
          "You can compare plans and upgrade when you want deeper access to labs, practice tests, and fuller self-study support."
      }
    ],
    trustHeading: "A transparent free-start path builds more trust than aggressive trial claims",
    trustDescription:
      "This page is intentionally careful about claims. It positions the offer as a free start into a real study system, not as a promise of unethical shortcuts or vague access.",
    trustPoints: [
      "Transparent about free versus paid value",
      "Aligned to original, ethical CCNA study material",
      "Connected to proof pages that show the real platform"
    ],
    proofHeading: "Pages to review before you decide whether to upgrade",
    proofIntro:
      "These supporting pages help free users inspect the platform from multiple angles.",
    proofLinks: [
      ccnaCommercialSupportLinks.topicsHub,
      ccnaCommercialSupportLinks.fundamentals,
      ccnaCommercialSupportLinks.labs,
      ccnaCommercialSupportLinks.pricing
    ],
    ctaTitle: "Start free now and upgrade only when the value is clear",
    ctaDescription:
      "Create a free account to enter the platform, then compare subscription options when you are ready for deeper practice and broader coverage."
  },
  {
    route: APP_ROUTES.ccnaCourseWithPracticeTests,
    title: "CCNA Course With Practice Tests",
    metaTitle: "CCNA Course With Practice Tests and Explanations",
    metaDescription:
      "Find a CCNA course with practice tests, labs, explanations, and domain coverage support built for ethical original CCNA-style preparation.",
    schemaType: "Course",
    heroEyebrow: "CCNA Course With Practice Tests",
    heroTitle: "A CCNA course with practice tests works best when the explanations are part of the course.",
    heroDescription:
      "This page targets learners who want more than passive lessons. The value comes from pairing instruction with original CCNA-style practice tests, supporting labs, and internal links back to the right proof pages.",
    heroProofPoints: [
      "Lessons plus practice tests plus explanations",
      "Domain coverage that supports the full blueprint",
      "Original CCNA-style preparation without dump content"
    ],
    primaryCtaLabel: "See Pricing",
    primaryCtaHref: APP_ROUTES.pricing,
    secondaryCtaLabel: "Start Free Account",
    secondaryCtaHref: APP_ROUTES.signup,
    valueHeading: "Why this offer converts for course-first buyers",
    valueIntro:
      "Course buyers usually want confidence that instruction and assessment live together. That is the core promise of this page.",
    valueProps: [
      {
        title: "The practice reinforces the teaching",
        description:
          "Instead of learning in one place and testing somewhere else, the course pairs topic coverage with original CCNA-style review."
      },
      {
        title: "Explanations reduce shallow memorization",
        description:
          "Practice tests are more valuable when they explain the networking logic, not just the final answer choice."
      },
      {
        title: "The wider study system remains available",
        description:
          "Learners can move from course sections into labs, subnetting drills, and proof pages as needed."
      }
    ],
    coverageHeading: "How the course and practice layers work together",
    coverageIntro:
      "This is not meant to be a lesson-only page. It should make the combined course-plus-practice value obvious.",
    coverageSections: [
      {
        title: "Course structure",
        description:
          "The course side keeps the blueprint organized and easier to follow from one topic family to the next.",
        bullets: [
          "Topic coverage across the six main CCNA domains",
          "Guides that explain what each domain is really asking",
          "Clear internal paths into follow-up study pages"
        ]
      },
      {
        title: "Practice-test reinforcement",
        description:
          "The practice layer helps turn reading into recall, diagnosis, and correction.",
        bullets: [
          "Original CCNA-style practice tests",
          "Explanations that support concept retention",
          "A better loop between missed items and review"
        ]
      },
      {
        title: "Hands-on reinforcement",
        description:
          "The platform becomes stronger when knowledge checks and practical practice support each other.",
        bullets: [
          "Lab access for switching, routing, services, and troubleshooting",
          "Targeted subnetting and fundamentals reinforcement",
          "A more credible path toward real exam readiness"
        ]
      }
    ],
    objectionsHeading: "What prospective buyers want to know before subscribing",
    objectionsIntro:
      "A course page with practice-test intent should handle quality concerns quickly and clearly.",
    objections: [
      {
        question: "Is this just a video course with a few extra questions?",
        answer:
          "No. The positioning here is broader: structured course coverage, original CCNA-style practice tests, explanations, and linked proof pages across the platform."
      },
      {
        question: "Are the practice tests ethical?",
        answer:
          "Yes. The study philosophy is explicitly ethical and explanation-driven, with original practice rather than recalled exam content or dumps."
      },
      {
        question: "Will I still need a separate lab resource?",
        answer:
          "The platform is designed to reduce that need by linking course learning with labs and other reinforcement pages inside one experience."
      }
    ],
    trustHeading: "A course is more credible when its practice layer is original and transparent",
    trustDescription:
      "This page reinforces that the course is aligned to the public blueprint, supported by original CCNA-style practice, and meant to build actual skill rather than brittle memorization.",
    trustPoints: [
      "Original practice tests and supporting labs",
      "Transparent alignment to CCNA 200-301 v1.1 topic coverage",
      "A non-dump study approach built for durable understanding"
    ],
    proofHeading: "Supporting pages that show the course in action",
    proofIntro:
      "These proof pages make the practical and evaluative parts of the platform easier to inspect.",
    proofLinks: [
      ccnaCommercialSupportLinks.practiceExams,
      ccnaCommercialSupportLinks.labs,
      ccnaCommercialSupportLinks.topicsHub,
      ccnaCommercialSupportLinks.pricing
    ],
    ctaTitle: "Get the course plus the practice layer that makes it stick",
    ctaDescription:
      "Open pricing to compare plans, or start with a free account if you want to inspect the course and proof pages before upgrading."
  },
  {
    route: APP_ROUTES.ccnaLabSubscription,
    title: "CCNA Lab Subscription",
    metaTitle: "CCNA Lab Subscription With Guided Practice",
    metaDescription:
      "Choose a CCNA lab subscription with guided labs, explanations, domain support, and ethical original CCNA-style preparation tied to the wider study platform.",
    schemaType: "Product",
    heroEyebrow: "CCNA Lab Subscription",
    heroTitle: "A CCNA lab subscription should do more than hand you a topology file.",
    heroDescription:
      "This page focuses on learners who know hands-on practice matters and want a subscription that connects labs with explanations, domain coverage, and broader CCNA review.",
    heroProofPoints: [
      "Guided labs plus explanations and expected outcomes",
      "Links back to domain study pages and practice tests",
      "Original ethical practice aligned to the public CCNA blueprint"
    ],
    primaryCtaLabel: "Compare Plans",
    primaryCtaHref: APP_ROUTES.pricing,
    secondaryCtaLabel: "Start Free Account",
    secondaryCtaHref: APP_ROUTES.signup,
    valueHeading: "Why a lab subscription converts when it is part of a full study workflow",
    valueIntro:
      "Lab buyers are usually looking for practical confidence, but practical confidence grows faster when the labs are supported by explanations, topic structure, and related review tools.",
    valueProps: [
      {
        title: "Labs are tied to learning outcomes",
        description:
          "Each lab subscription path is meant to reinforce why the task matters, what you should verify, and how the exercise fits into CCNA study."
      },
      {
        title: "Hands-on work does not stay isolated",
        description:
          "You can move from lab activity into supporting topic pages, subnetting drills, and practice tests when a weakness shows up."
      },
      {
        title: "Original practice keeps the value clean",
        description:
          "The offer focuses on original practical reinforcement, not shortcut content or questionable exam claims."
      }
    ],
    coverageHeading: "What the lab subscription is meant to cover",
    coverageIntro:
      "The lab angle is practical, but the page still needs to show that the labs connect back to the wider blueprint and not just isolated tasks.",
    coverageSections: [
      {
        title: "Practical domain reinforcement",
        description:
          "Labs support the parts of the blueprint where configuration, verification, and troubleshooting habits matter most.",
        bullets: [
          "Hands-on reinforcement for switching, routing, and services",
          "Practical review for security and access-layer behavior",
          "Operational context for automation and structured validation"
        ]
      },
      {
        title: "Explanation-backed lab work",
        description:
          "Strong labs tell you what success looks like and why the workflow matters.",
        bullets: [
          "Objectives, instructions, and expected outcomes",
          "Verification-oriented lab flow rather than blind clicking",
          "A better bridge from theory into practical reasoning"
        ]
      },
      {
        title: "Connected follow-up study",
        description:
          "When a lab exposes a gap, you should be able to continue learning without leaving the ecosystem.",
        bullets: [
          "Internal links to topic guides and practice tests",
          "Support for targeted fundamentals review",
          "A smoother route from lab friction into correction"
        ]
      }
    ],
    objectionsHeading: "Objections a lab subscription page should remove",
    objectionsIntro:
      "Learners often worry about setup friction, value depth, and whether labs actually connect to exam preparation.",
    objections: [
      {
        question: "Do I need expensive hardware to benefit from this?",
        answer:
          "No. The lab offer is framed around guided practical workflows and platform-based reinforcement, not around requiring a rack of hardware."
      },
      {
        question: "Are the labs separate from the rest of the course?",
        answer:
          "The goal is the opposite. Labs are connected to domain study, explanations, and related proof pages so the practice fits into a coherent learning path."
      },
      {
        question: "Is this only useful for advanced learners?",
        answer:
          "No. The lab library is positioned as guided reinforcement, which is valuable for learners building confidence as well as those sharpening existing skills."
      }
    ],
    trustHeading: "Hands-on credibility comes from guidance, not hype",
    trustDescription:
      "This page uses trust language that keeps the offer grounded: original practical reinforcement, aligned to the public blueprint, and explicitly positioned away from dump-style shortcuts.",
    trustPoints: [
      "Original guided labs tied to clear objectives",
      "Ethical preparation language and non-dump positioning",
      "Links into broader course, topic, and practice-test support"
    ],
    proofHeading: "Proof pages that show the practical side of the platform",
    proofIntro:
      "Review these pages if you want to inspect how labs connect to the rest of the CCNA experience.",
    proofLinks: [
      ccnaCommercialSupportLinks.labs,
      ccnaCommercialSupportLinks.fundamentals,
      ccnaCommercialSupportLinks.practiceExams,
      ccnaCommercialSupportLinks.pricing
    ],
    ctaTitle: "Unlock lab access that fits into a real CCNA study system",
    ctaDescription:
      "Compare paid plans if you want deeper hands-on access, or start free if you want to review the platform and supporting proof pages first."
  }
];

export const ccnaCommercialPageMap = Object.fromEntries(
  ccnaCommercialPages.map((page) => [page.route, page])
) as Record<string, CcnaCommercialPageContent>;
