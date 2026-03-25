import { ccnaCommercialSupportLinks } from "@/features/marketing/lib/ccna-commercial-pages";
import { ccnaLabSupportLinks } from "@/features/marketing/lib/ccna-lab-cluster-pages";
import { ccnaPracticeSupportLinks } from "@/features/marketing/lib/ccna-practice-cluster-pages";
import { APP_ROUTES } from "@/lib/auth/redirects";

export interface TrustPageLink {
  route: string;
  title: string;
  description: string;
}

export interface TrustPageCard {
  title: string;
  description: string;
  bullets: string[];
}

export interface TrustPageComparisonRow {
  label: string;
  values: string[];
}

interface TrustPageFaq {
  question: string;
  answer: string;
}

export interface CcnaTrustPageContent {
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
  evidenceHeading: string;
  evidenceIntro: string;
  evidenceBullets: string[];
  riskHeading: string;
  riskIntro: string;
  riskCards: TrustPageCard[];
  allowedHeading: string;
  allowedIntro: string;
  allowedColumns: string[];
  allowedRows: TrustPageComparisonRow[];
  alternativeHeading: string;
  alternativeIntro: string;
  alternativeCards: TrustPageCard[];
  trustHeading: string;
  trustDescription: string;
  trustPoints: string[];
  ethicalHeading: string;
  ethicalIntro: string;
  ethicalPoints: string[];
  proofHeading: string;
  proofIntro: string;
  proofLinks: TrustPageLink[];
  funnelHeading: string;
  funnelIntro: string;
  funnelLinks: TrustPageLink[];
  relatedHeading: string;
  relatedIntro: string;
  relatedLinks: TrustPageLink[];
  faqHeading: string;
  faqIntro: string;
  faqs: TrustPageFaq[];
  ctaTitle: string;
  ctaDescription: string;
}

export const ccnaTrustSupportLinks = {
  pricing: ccnaCommercialSupportLinks.pricing,
  practiceSubscription: ccnaPracticeSupportLinks.practiceSubscription,
  courseWithPracticeTests: ccnaPracticeSupportLinks.courseWithPracticeTests,
  freeTrial: ccnaPracticeSupportLinks.freeTrial,
  practiceHub: ccnaPracticeSupportLinks.practiceHub,
  mockExam: ccnaPracticeSupportLinks.mockExam,
  questionBank: ccnaPracticeSupportLinks.questionBank,
  labsHub: ccnaLabSupportLinks.labsHub,
  labSubscription: ccnaLabSupportLinks.labSubscription,
  labsWithAnswers: ccnaLabSupportLinks.labsWithAnswers,
  packetTracerLabsDownload: ccnaLabSupportLinks.packetTracerLabsDownload,
  topicsHub: ccnaCommercialSupportLinks.topicsHub,
  practiceQuestionsNotDump: {
    route: APP_ROUTES.ccnaPracticeQuestionsNotExamDump,
    title: "CCNA Practice Questions, Not Exam Dump",
    description:
      "Use the anti-dump trust page when you want original practice positioned clearly against risky dump-style claims."
  },
  pastQuestionsAlternative: {
    route: APP_ROUTES.ccnaPastQuestionsEthicalAlternative,
    title: "CCNA Past Questions Ethical Alternative",
    description:
      "See the ethical-alternative page for a safer answer to searches asking for past questions or real exam content."
  },
  allowedPractice: {
    route: APP_ROUTES.whatIsAllowedForCcnaPractice,
    title: "What Is Allowed for CCNA Practice",
    description:
      "Read the allowed-practice page for a clean explanation of what study behaviors are safer and what crosses the line."
  }
} as const;

const sharedEvidenceBullets = [
  "Cisco's exam registration page says Cisco and Pearson VUE protect the value of certifications in a secure, proctored environment.",
  "Cisco's official certification prep page recommends hands-on labs, simulation tools, Packet Tracer, and practice exams as legitimate ways to prepare.",
  "These pages are built to steer users toward original questions, guided labs, and mock exams instead of risky 'real exam question' claims."
];

export const ccnaTrustPages: CcnaTrustPageContent[] = [
  {
    route: APP_ROUTES.ccnaPracticeQuestionsNotExamDump,
    title: "CCNA Practice Questions, Not Exam Dump",
    metaTitle: "CCNA Practice Questions, Not Exam Dump: A Safer Prep Alternative",
    metaDescription:
      "Learn why CCNA exam dumps and real exam question claims are risky, and choose original CCNA practice questions, labs, and mock exams instead.",
    primaryKeyword: "CCNA practice questions not exam dump",
    secondaryKeywords: [
      "CCNA practice questions not dumps",
      "ethical CCNA practice questions",
      "CCNA exam dump alternative",
      "original CCNA practice questions"
    ],
    heroEyebrow: "CCNA Practice Questions, Not Exam Dump",
    heroTitle: "The safest CCNA practice questions are original, exam-like questions, not dump claims dressed up as help.",
    heroDescription:
      "This page is for searchers who want practice questions without crossing into risky dump territory. The goal is simple: explain why 'real exam question' claims are a bad bet and point you toward ethical prep that still feels challenging and useful.",
    heroPoints: [
      "Dump-style offers create exam-integrity risk and can undermine real learning.",
      "Cisco's official prep guidance points candidates toward practice exams, labs, and simulation tools instead.",
      "CertPrep is positioned around original questions, guided labs, and mock exams that support real skill growth."
    ],
    primaryCtaLabel: "See Practice Test Subscription",
    primaryCtaHref: APP_ROUTES.ccnaPracticeTestSubscription,
    secondaryCtaLabel: "Start Free Trial Path",
    secondaryCtaHref: APP_ROUTES.ccnaCourseFreeTrial,
    evidenceHeading: "Why this page takes a hard line on dumps",
    evidenceIntro:
      "This is not generic moralizing. It follows Cisco's own certification security and preparation guidance.",
    evidenceBullets: [...sharedEvidenceBullets],
    riskHeading: "Why dump-style practice is risky",
    riskIntro:
      "Searchers often think dumps are just a faster version of practice. They are not. The risks are about both compliance and low-quality learning.",
    riskCards: [
      {
        title: "Exam-integrity risk",
        description:
          "Claims about real exam questions or leaked content create unnecessary compliance exposure because certification programs treat exam content as protected.",
        bullets: [
          "The safest study posture is to avoid providers claiming real exam content.",
          "Shortcuts that rely on leaked or recalled items can put certification value at risk.",
          "Even when a site sounds casual, the claim itself is the problem."
        ]
      },
      {
        title: "Weak learning transfer",
        description:
          "Dump-style prep trains recognition, not durable networking reasoning.",
        bullets: [
          "It does less to improve configuration judgment, troubleshooting, and verification habits.",
          "It can hide domain weaknesses instead of fixing them.",
          "It usually performs badly when the exam asks for applied understanding."
        ]
      },
      {
        title: "Low-trust buying signal",
        description:
          "If a provider markets 'real exam questions,' it is telling you something about how it thinks about study ethics and quality.",
        bullets: [
          "That is usually the wrong trust signal for serious professional prep.",
          "Clear original-question positioning is a better sign.",
          "Good platforms explain their study philosophy instead of hinting at leaked access."
        ]
      }
    ],
    allowedHeading: "Better choices than dump-style practice",
    allowedIntro:
      "A clean CCNA prep stack is not hard to understand. Replace risky content claims with legitimate practice formats that still pressure your knowledge.",
    allowedColumns: ["Approach", "Risk or value", "Better move"],
    allowedRows: [
      {
        label: "Real exam question claims",
        values: [
          "High-risk and low-trust because they rely on protected-content positioning.",
          "Skip them and use original practice questions instead."
        ]
      },
      {
        label: "Original practice questions",
        values: [
          "Safer and more useful when they are written to feel exam-like without pretending to be the real exam.",
          "Use these for concept retention and domain diagnosis."
        ]
      },
      {
        label: "Guided labs and Packet Tracer work",
        values: [
          "Strong for turning knowledge into hands-on skill and verification confidence.",
          "Pair labs with original question review and mock exams."
        ]
      },
      {
        label: "Mock exams",
        values: [
          "Useful for readiness checks when they are original and explanation-driven.",
          "Use them late in the study cycle after topic and lab reinforcement."
        ]
      }
    ],
    alternativeHeading: "What to use instead on CertPrep",
    alternativeIntro:
      "These are the ethical substitutes for risky search intent. They give you pressure, repetition, and real correction paths without leaning on dump claims.",
    alternativeCards: [
      {
        title: "Original question practice",
        description:
          "Use original practice questions when you want exam-like review that still teaches and diagnoses weak areas.",
        bullets: [
          "Built for explanation-driven review.",
          "Safer than any 'real exam questions' pitch.",
          "Works well alongside topic study and labs."
        ]
      },
      {
        title: "Guided labs",
        description:
          "Labs are where abstract CCNA knowledge becomes operational skill, especially for switching, routing, and troubleshooting.",
        bullets: [
          "Useful for building verification habits.",
          "Better than memorizing isolated answers.",
          "A strong ethical counterweight to dump-style intent."
        ]
      },
      {
        title: "Mock exams",
        description:
          "Mock exams help you rehearse timing and mixed-domain recall without pretending to give you the real exam.",
        bullets: [
          "Good for readiness checks.",
          "Best used with explanations and follow-up study links.",
          "Stronger long-term value than memorized dumps."
        ]
      }
    ],
    trustHeading: "How CertPrep builds trust on this topic",
    trustDescription:
      "The core trust message is simple: we do not market dumps, leaked questions, or real exam content. We market original practice and practical reinforcement.",
    trustPoints: [
      "Original CCNA-style questions instead of real-exam claims.",
      "Guided labs and Packet Tracer-friendly workflows for hands-on practice.",
      "Mock exams, subscription pages, and proof pages that explain what the platform actually offers."
    ],
    ethicalHeading: "The ethical prep lane is still strong prep",
    ethicalIntro:
      "Choosing the safe lane does not mean choosing weak prep. It means choosing a prep system that can hold up under actual exam pressure and professional expectations.",
    ethicalPoints: [
      "Original questions improve reasoning instead of encouraging memorized recall.",
      "Labs and simulation tools build the practical confidence Cisco itself recommends.",
      "Mock exams let you check readiness without relying on protected exam content."
    ],
    proofHeading: "Proof pages behind the ethical alternative",
    proofIntro:
      "These pages show the actual practice, lab, and mock-exam paths behind the trust messaging.",
    proofLinks: [
      ccnaTrustSupportLinks.practiceHub,
      ccnaTrustSupportLinks.questionBank,
      ccnaTrustSupportLinks.labsWithAnswers,
      ccnaTrustSupportLinks.mockExam
    ],
    funnelHeading: "Ethical funnel links from risky search intent",
    funnelIntro:
      "These are the strongest next steps if you want a clean replacement for dump-style search intent.",
    funnelLinks: [
      ccnaTrustSupportLinks.practiceSubscription,
      ccnaTrustSupportLinks.courseWithPracticeTests,
      ccnaTrustSupportLinks.labSubscription,
      ccnaTrustSupportLinks.pricing
    ],
    relatedHeading: "Related trust pages",
    relatedIntro:
      "Use these pages if your question is really about past questions, rules, or what is allowed in CCNA preparation.",
    relatedLinks: [
      ccnaTrustSupportLinks.pastQuestionsAlternative,
      ccnaTrustSupportLinks.allowedPractice,
      ccnaTrustSupportLinks.packetTracerLabsDownload,
      ccnaTrustSupportLinks.topicsHub
    ],
    faqHeading: "Questions people ask when they want safe CCNA practice questions",
    faqIntro:
      "These answers keep the page clear and reduce ambiguity around what this site does and does not offer.",
    faqs: [
      {
        question: "Are practice questions okay for CCNA if they are not dumps?",
        answer:
          "Yes. Original practice questions are a standard and safer preparation method. The issue is not practice itself. The issue is when a provider claims to offer real exam questions or leaked exam content."
      },
      {
        question: "Why not just use dumps if they seem faster?",
        answer:
          "Because they create unnecessary compliance and trust risk while also weakening real understanding. A better path is original questions plus labs and mock exams."
      },
      {
        question: "What does CertPrep use instead of dump-style content?",
        answer:
          "CertPrep emphasizes original questions, guided labs, Packet Tracer-friendly workflows, and mock exams that support actual skill development."
      }
    ],
    ctaTitle: "Choose original CCNA practice questions and keep your prep clean",
    ctaDescription:
      "Open the practice-test subscription if you want original question review now, or start with the free trial if you want to inspect the platform before upgrading."
  },
  {
    route: APP_ROUTES.ccnaPastQuestionsEthicalAlternative,
    title: "CCNA Past Questions Ethical Alternative",
    metaTitle: "CCNA Past Questions Ethical Alternative for Safer Exam Prep",
    metaDescription:
      "Looking for CCNA past questions? Learn why that search is risky and use an ethical alternative built around original questions, labs, and mock exams instead.",
    primaryKeyword: "CCNA past questions ethical alternative",
    secondaryKeywords: [
      "CCNA past questions alternative",
      "ethical alternative to CCNA past questions",
      "CCNA real questions alternative",
      "CCNA original practice questions"
    ],
    heroEyebrow: "CCNA Past Questions Ethical Alternative",
    heroTitle: "If you are searching for CCNA past questions, the safer move is to switch from recall-seeking to original practice.",
    heroDescription:
      "Many learners use 'past questions' as shorthand for hard practice. The problem is that the phrase also pulls toward risky real-exam-content intent. This page redirects that search toward a safer, more credible study path.",
    heroPoints: [
      "Past-question searches often blur into real-exam-content expectations.",
      "Cisco's official preparation guidance points candidates toward labs, simulation tools, and practice exams instead.",
      "CertPrep is the ethical alternative: original questions, labs, and mock exams without 'real exam' promises."
    ],
    primaryCtaLabel: "See Course With Practice Tests",
    primaryCtaHref: APP_ROUTES.ccnaCourseWithPracticeTests,
    secondaryCtaLabel: "View Pricing",
    secondaryCtaHref: APP_ROUTES.pricing,
    evidenceHeading: "Why this page reframes the search",
    evidenceIntro:
      "The compliance-safe move is not to shame the searcher. It is to explain the risk and show a better route that still feels practical and strong.",
    evidenceBullets: [...sharedEvidenceBullets],
    riskHeading: "Why 'past questions' searches can go sideways",
    riskIntro:
      "The phrase sounds harmless, but it often leads to providers implying access to protected exam content. That is exactly the trust problem these pages are designed to avoid.",
    riskCards: [
      {
        title: "Ambiguous search intent",
        description:
          "Some people mean 'good practice questions' when they say past questions, but many sites exploit that phrase to market risky material.",
        bullets: [
          "That makes the search intent commercially risky.",
          "A safer page needs to decode the phrase instead of echoing it.",
          "Trust starts by naming the ambiguity clearly."
        ]
      },
      {
        title: "Real-exam implication risk",
        description:
          "Once a provider implies real exam content, the search stops being about normal practice and starts becoming an integrity problem.",
        bullets: [
          "That is the main policy and trust risk.",
          "It is a bad fit for professional certification prep.",
          "It is not necessary to pass the CCNA anyway."
        ]
      },
      {
        title: "Study-quality risk",
        description:
          "Even when the material feels accurate, recall-first prep often creates brittle results and weak troubleshooting confidence.",
        bullets: [
          "It does less to build durable understanding.",
          "It rarely improves lab judgment the way guided practice does.",
          "It can leave you exposed when question wording changes."
        ]
      }
    ],
    allowedHeading: "How to reinterpret 'past questions' safely",
    allowedIntro:
      "A compliance-safe trust page should not leave the user empty-handed. It should translate risky search language into acceptable study actions.",
    allowedColumns: ["What the search may mean", "Safer interpretation", "Best next move"],
    allowedRows: [
      {
        label: "I want hard CCNA questions",
        values: [
          "Use original, exam-like practice questions with explanations.",
          "Go to the practice subscription or question-bank route."
        ]
      },
      {
        label: "I want to know what the exam feels like",
        values: [
          "Use original mock exams and timed practice rather than real-question claims.",
          "Go to the mock exam and practice-exam pages."
        ]
      },
      {
        label: "I want proof I can actually do the tasks",
        values: [
          "Use guided labs and Packet Tracer-style work instead of answer memorization.",
          "Go to the labs subscription and lab proof pages."
        ]
      },
      {
        label: "I want the safest allowed path",
        values: [
          "Stay with original questions, simulation tools, labs, and practice exams.",
          "Read the allowed-practice trust page and then choose the right funnel page."
        ]
      }
    ],
    alternativeHeading: "The ethical alternative on CertPrep",
    alternativeIntro:
      "These are the three main substitutes for past-question search intent when you want to study hard without leaning on risky claims.",
    alternativeCards: [
      {
        title: "Original question sets",
        description:
          "Original questions let you practice hard concepts without pretending to mirror protected exam content.",
        bullets: [
          "Good for domain diagnosis.",
          "Good for explanation-led retention.",
          "Cleaner trust signal than any past-question pitch."
        ]
      },
      {
        title: "Labs and Packet Tracer workflows",
        description:
          "Labs are often the better answer when a searcher is really asking for confidence, not just more items to memorize.",
        bullets: [
          "Great for switching, routing, and troubleshooting habits.",
          "Better proof of learning than memorized answers.",
          "Supports the practical side Cisco officially recommends."
        ]
      },
      {
        title: "Mock exams",
        description:
          "Mock exams help with pressure and pacing while staying on the right side of exam integrity.",
        bullets: [
          "Useful for late-stage readiness.",
          "Best when paired with explanations.",
          "A far better substitute than chasing supposed past papers."
        ]
      }
    ],
    trustHeading: "What trust-building copy looks like here",
    trustDescription:
      "The site earns trust by making a narrower, cleaner promise: original practice and practical reinforcement, not access to real or past exam content.",
    trustPoints: [
      "No claims about real exam questions, leaked material, or dumps.",
      "Clear positioning around original questions, labs, and mock exams.",
      "Subscription and proof pages that explain the actual study experience."
    ],
    ethicalHeading: "Strong prep does not require risky shortcuts",
    ethicalIntro:
      "An ethical alternative still has to feel useful. That is why these pages keep pointing toward pressure-tested substitutes instead of vague advice.",
    ethicalPoints: [
      "Original questions preserve difficulty without borrowing protected content.",
      "Labs give you the practical confidence that answer memorization cannot.",
      "Mock exams and timed practice make the readiness check honest."
    ],
    proofHeading: "Proof pages behind the alternative",
    proofIntro:
      "These pages show the real alternatives behind the trust message: practice, labs, and mock-exam routes you can inspect directly.",
    proofLinks: [
      ccnaTrustSupportLinks.practiceHub,
      ccnaTrustSupportLinks.mockExam,
      ccnaTrustSupportLinks.labsHub,
      ccnaTrustSupportLinks.packetTracerLabsDownload
    ],
    funnelHeading: "Funnels that replace past-question intent",
    funnelIntro:
      "These are the best internal routes when a user is ready to move from risky intent into ethical paid or trial-ready study.",
    funnelLinks: [
      ccnaTrustSupportLinks.courseWithPracticeTests,
      ccnaTrustSupportLinks.practiceSubscription,
      ccnaTrustSupportLinks.labSubscription,
      ccnaTrustSupportLinks.pricing
    ],
    relatedHeading: "Related trust pages",
    relatedIntro:
      "Use these pages if you want the anti-dump message in a different form or a more direct explanation of what is allowed.",
    relatedLinks: [
      ccnaTrustSupportLinks.practiceQuestionsNotDump,
      ccnaTrustSupportLinks.allowedPractice,
      ccnaTrustSupportLinks.freeTrial,
      ccnaTrustSupportLinks.topicsHub
    ],
    faqHeading: "Questions people ask when searching for CCNA past questions",
    faqIntro:
      "These answers help reframe the intent without sounding evasive.",
    faqs: [
      {
        question: "Are past questions the same as practice questions?",
        answer:
          "Not safely. 'Practice questions' can be original and ethical. 'Past questions' often drifts toward real-exam-content claims, which is the problem these pages are trying to avoid."
      },
      {
        question: "What should I use instead of CCNA past questions?",
        answer:
          "Use original question banks, guided labs, Packet Tracer practice, and mock exams. Those routes still prepare you well without leaning on risky content claims."
      },
      {
        question: "Why does CertPrep avoid real-question claims?",
        answer:
          "Because trust, exam integrity, and durable learning matter more than clickbait. CertPrep is positioned around original material and hands-on reinforcement instead."
      }
    ],
    ctaTitle: "Replace past-question searching with original CCNA prep that you can trust",
    ctaDescription:
      "Start with the course-plus-practice route if you want an integrated study path, or go straight to the practice subscription if original question review is your main need."
  },
  {
    route: APP_ROUTES.whatIsAllowedForCcnaPractice,
    title: "What Is Allowed for CCNA Practice",
    metaTitle: "What Is Allowed for CCNA Practice: Safer Study Rules and Alternatives",
    metaDescription:
      "Understand what is allowed for CCNA practice, why dump and real-exam-question claims are risky, and which ethical alternatives are safer for serious prep.",
    primaryKeyword: "what is allowed for CCNA practice",
    secondaryKeywords: [
      "allowed CCNA practice",
      "CCNA practice exam rules",
      "CCNA exam dump risk",
      "ethical CCNA study methods"
    ],
    heroEyebrow: "What Is Allowed for CCNA Practice",
    heroTitle: "Allowed CCNA practice is easier to understand when you separate legitimate preparation from protected-content claims.",
    heroDescription:
      "This page answers the rule-focused version of the question. It explains why dumps and real exam question claims are risky, then points you toward the practice methods Cisco itself publicly recommends: hands-on tools, labs, simulation, and practice exams.",
    heroPoints: [
      "Cisco publicly recommends practice exams, Packet Tracer, labs, and simulation tools as normal prep methods.",
      "The main line not to cross is claiming or seeking real exam content.",
      "CertPrep is designed to sit on the allowed side of that line with original questions, labs, and mock exams."
    ],
    primaryCtaLabel: "Read Practice Exam Options",
    primaryCtaHref: APP_ROUTES.ccnaPracticeExams,
    secondaryCtaLabel: "See Subscription Plans",
    secondaryCtaHref: APP_ROUTES.pricing,
    evidenceHeading: "Official prep guidance behind this page",
    evidenceIntro:
      "This page is built around Cisco's own public exam-security and preparation messaging, not around speculation.",
    evidenceBullets: [...sharedEvidenceBullets],
    riskHeading: "What crosses the line and why",
    riskIntro:
      "The easiest way to think about allowed practice is to separate normal study tools from any claim that you are using real exam material.",
    riskCards: [
      {
        title: "Allowed: original practice and simulation",
        description:
          "Practice exams, labs, simulation tools, Packet Tracer work, and original question sets all fit the normal preparation lane.",
        bullets: [
          "These methods are compatible with real learning.",
          "They are also aligned with Cisco's public prep guidance.",
          "They help you build skill instead of chasing leaked recall."
        ]
      },
      {
        title: "Risky: real-exam-content claims",
        description:
          "The problem starts when a site markets real exam questions, recalled content, or dump-style access.",
        bullets: [
          "That is the integrity risk these pages are trying to intercept.",
          "It is also a major trust warning sign.",
          "You do not need that approach to prepare effectively."
        ]
      },
      {
        title: "Best practice: build a clean study stack",
        description:
          "A strong CCNA prep stack uses original questions, mock exams, labs, and topic reinforcement together.",
        bullets: [
          "That gives you both theory and application.",
          "It is safer and more transferable.",
          "It keeps your study posture easy to defend."
        ]
      }
    ],
    allowedHeading: "Allowed practice versus risky practice",
    allowedIntro:
      "Use this as a quick decision table when you are unsure whether a prep method sounds normal or questionable.",
    allowedColumns: ["Method", "Safer or risky", "Recommendation"],
    allowedRows: [
      {
        label: "Original practice questions",
        values: [
          "Safer",
          "Use them, especially when paired with explanations and domain review."
        ]
      },
      {
        label: "Practice exams and mock exams",
        values: [
          "Safer",
          "Use them for readiness checks and pacing once you have baseline topic coverage."
        ]
      },
      {
        label: "Labs, Packet Tracer, and simulation tools",
        values: [
          "Safer",
          "Use them heavily because Cisco publicly recommends hands-on practice."
        ]
      },
      {
        label: "Claims about real exam questions or dumps",
        values: [
          "Risky",
          "Avoid them and switch to original practice or lab-based prep instead."
        ]
      }
    ],
    alternativeHeading: "What to do if you want to stay on the allowed side",
    alternativeIntro:
      "If your goal is strong prep without integrity concerns, these are the main CertPrep routes to use instead.",
    alternativeCards: [
      {
        title: "Practice-test path",
        description:
          "Use original practice tests when you want question-driven review without real-exam-content claims.",
        bullets: [
          "Best for explanation-led review.",
          "Good for domain diagnosis.",
          "A clean replacement for risky question searches."
        ]
      },
      {
        title: "Lab path",
        description:
          "Use guided labs when you want confidence that transfers beyond multiple-choice performance.",
        bullets: [
          "Strong for switching, routing, and troubleshooting.",
          "Good for Packet Tracer-based repetition.",
          "Aligned with Cisco's public hands-on guidance."
        ]
      },
      {
        title: "Mock-exam path",
        description:
          "Use mock exams when you want realistic pressure without pretending to access the real test.",
        bullets: [
          "Good for late-stage readiness.",
          "Supports timing and mixed-domain recall.",
          "Works best with follow-up explanations and proof links."
        ]
      }
    ],
    trustHeading: "How this site stays on the safer side",
    trustDescription:
      "The trust promise is clear: original questions, guided labs, and mock exams. No dump language, no 'real exam content' claims, and no attempt to blur the line.",
    trustPoints: [
      "Original practice instead of real-question marketing.",
      "Labs and Packet Tracer-friendly routes for hands-on reinforcement.",
      "Clear subscription, practice, and proof pages so users know what they are buying."
    ],
    ethicalHeading: "Allowed prep is still serious prep",
    ethicalIntro:
      "Staying compliant does not mean preparing lightly. It means preparing with tools that actually build the skill set the certification is supposed to represent.",
    ethicalPoints: [
      "Use labs and simulation to build genuine task confidence.",
      "Use original questions and mock exams to measure readiness ethically.",
      "Use subscriptions and proof pages that describe the offer honestly."
    ],
    proofHeading: "Proof pages for the allowed-practice path",
    proofIntro:
      "These pages show the concrete routes behind the trust messaging so the user can act immediately.",
    proofLinks: [
      ccnaTrustSupportLinks.practiceHub,
      ccnaTrustSupportLinks.mockExam,
      ccnaTrustSupportLinks.labsHub,
      ccnaTrustSupportLinks.labsWithAnswers
    ],
    funnelHeading: "Funnel links for users who want the safer path",
    funnelIntro:
      "These are the best commercial next steps if you want original questions, labs, and mock exams instead of risky content claims.",
    funnelLinks: [
      ccnaTrustSupportLinks.practiceSubscription,
      ccnaTrustSupportLinks.courseWithPracticeTests,
      ccnaTrustSupportLinks.labSubscription,
      ccnaTrustSupportLinks.pricing
    ],
    relatedHeading: "Related trust pages",
    relatedIntro:
      "Use these pages if your question is more specifically about dumps, past-question searches, or ethical alternatives.",
    relatedLinks: [
      ccnaTrustSupportLinks.practiceQuestionsNotDump,
      ccnaTrustSupportLinks.pastQuestionsAlternative,
      ccnaTrustSupportLinks.freeTrial,
      ccnaTrustSupportLinks.topicsHub
    ],
    faqHeading: "Questions people ask about allowed CCNA practice",
    faqIntro:
      "These answers make the trust boundary concrete without turning the page into legalese.",
    faqs: [
      {
        question: "Are practice exams allowed for CCNA prep?",
        answer:
          "Yes. Practice exams are part of normal certification preparation, especially when they are original and do not claim to reproduce protected exam content."
      },
      {
        question: "Are labs and Packet Tracer allowed?",
        answer:
          "Yes. Cisco's public prep guidance explicitly points candidates toward hands-on practice, labs, and simulation tools such as Packet Tracer."
      },
      {
        question: "What should I avoid?",
        answer:
          "Avoid providers claiming real exam questions, leaked items, or exam dumps. A safer path is original questions, guided labs, and mock exams."
      }
    ],
    ctaTitle: "Stay on the allowed side and still prep hard for the CCNA",
    ctaDescription:
      "Open the practice-exam and subscription pages if you want the ethical question path, or move into labs if hands-on reinforcement is your next priority."
  }
];

export const ccnaTrustPageMap = Object.fromEntries(
  ccnaTrustPages.map((page) => [page.route, page])
) as Record<string, CcnaTrustPageContent>;
