import { SeoRelatedContentCards } from "@/features/marketing/components/ccna-seo-shared";
import { PRICING_SEO_LINK_ITEM } from "@/features/marketing/lib/internal-linking";
import { APP_ROUTES } from "@/lib/auth/redirects";

const nextStepCards = [
  PRICING_SEO_LINK_ITEM,
  {
    route: APP_ROUTES.ccnaExamTopicsExplained,
    title: "See the CCNA Exam Topic Hub",
    description:
      "Start with the main CCNA topic guide when you want a structured overview before moving into labs or timed practice.",
    ctaLabel: "Open the topic hub"
  },
  {
    route: APP_ROUTES.ccnaPracticeExams,
    title: "Jump into CCNA Practice Exams",
    description:
      "Use exam-style review pages to move from reading into timed questions, mock exams, and focused reinforcement.",
    ctaLabel: "Explore practice exam pages"
  },
  {
    route: APP_ROUTES.ccnaLabs,
    title: "Explore Guided CCNA Labs",
    description:
      "Open the labs hub when you want hands-on Packet Tracer workflows, verification steps, and troubleshooting practice.",
    ctaLabel: "Explore original lab guides"
  }
];

export function HomeNextStepsSection() {
  return (
    <SeoRelatedContentCards
      intro="Use these visible next-step links to move from the homepage into pricing, the main CCNA topic hub, practice pages, and hands-on labs without dead ends."
      items={nextStepCards}
      sectionClassName="rounded-[1.5rem] border border-white/70 bg-white/90 px-4 py-6 shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:px-10"
      title="Plan the next step in your CCNA study path"
    />
  );
}
