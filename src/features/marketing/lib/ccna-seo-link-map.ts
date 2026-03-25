import { ccnaAuthorityPageLinks } from "@/features/marketing/lib/ccna-authority-pages"
import { ccnaCommercialComparisonSupportLinks } from "@/features/marketing/lib/ccna-commercial-comparison-pages"
import { ccnaCommercialSupportLinks } from "@/features/marketing/lib/ccna-commercial-pages"
import { ccnaLabSupportLinks } from "@/features/marketing/lib/ccna-lab-cluster-pages"
import { ccnaPracticeSupportLinks } from "@/features/marketing/lib/ccna-practice-cluster-pages"
import { APP_ROUTES } from "@/lib/auth/redirects"

export interface CcnaSeoLinkItem {
  route: string
  title: string
  description: string
  ctaLabel?: string
}

export interface CcnaSeoLinkGroup {
  id: string
  title: string
  intro: string
  columns: 1 | 2 | 3 | 4
  links: CcnaSeoLinkItem[]
}

function withCtaLabel(link: {
  route: string
  title: string
  description: string
}, ctaLabel: string): CcnaSeoLinkItem {
  return {
    ...link,
    ctaLabel
  }
}

const domainHubLinks = ccnaAuthorityPageLinks.filter(
  (page) => page.route !== APP_ROUTES.ccnaExamTopicsExplained
).map((page) => withCtaLabel(page, `Open ${page.title}`))

const pillarAndDomainLinks = [
  withCtaLabel(
    {
      route: APP_ROUTES.ccnaExamTopicsExplained,
      title: "CCNA Exam Topics Explained",
      description:
        "Use the pillar page to understand how the CCNA 200-301 v1.1 blueprint fits together before drilling deeper."
    },
    "Open the CCNA exam topics hub"
  ),
  ...domainHubLinks
]

const practiceAndLabLinks = [
  withCtaLabel(ccnaPracticeSupportLinks.practiceHub, "Review CCNA practice exams"),
  withCtaLabel(ccnaPracticeSupportLinks.bestPracticeTests, "Compare the best CCNA practice tests"),
  withCtaLabel(ccnaPracticeSupportLinks.mockExam, "Take the CCNA mock exam path"),
  withCtaLabel(ccnaLabSupportLinks.labsHub, "Explore CCNA labs"),
  withCtaLabel(ccnaLabSupportLinks.labsWithAnswers, "Use CCNA labs with answers"),
  withCtaLabel(ccnaLabSupportLinks.packetTracerLabsDownload, "Open the Packet Tracer lab download page")
]

const comparisonLinks = [
  withCtaLabel(
    ccnaCommercialComparisonSupportLinks.bestWebsite,
    "Compare the best website options for CCNA practice"
  ),
  withCtaLabel(
    ccnaCommercialComparisonSupportLinks.bestPracticeTests,
    "Compare the best CCNA practice-test pages"
  ),
  withCtaLabel(ccnaCommercialComparisonSupportLinks.bestLabs, "Compare the best CCNA lab pages"),
  withCtaLabel(
    ccnaCommercialComparisonSupportLinks.bosonVsMeasureup,
    "Compare Boson vs MeasureUp for CCNA"
  ),
  withCtaLabel(ccnaCommercialComparisonSupportLinks.bosonReview, "Read the Boson ExSim CCNA review"),
  withCtaLabel(
    ccnaCommercialComparisonSupportLinks.measureupReview,
    "Read the MeasureUp CCNA practice-test review"
  )
]

const subscriptionLinks = [
  withCtaLabel(ccnaCommercialSupportLinks.pricing, "Compare CCNA pricing and plans"),
  withCtaLabel(
    {
      route: APP_ROUTES.ccnaCourseSubscription,
      title: "CCNA Course Subscription",
      description:
        "Choose the all-in-one course subscription when you want lessons, labs, and practice in one workflow."
    },
    "Explore the CCNA course subscription"
  ),
  withCtaLabel(
    ccnaPracticeSupportLinks.practiceSubscription,
    "Explore the CCNA practice-test subscription"
  ),
  withCtaLabel(
    ccnaPracticeSupportLinks.courseWithPracticeTests,
    "See the course with practice tests"
  ),
  withCtaLabel(ccnaLabSupportLinks.labSubscription, "Explore the CCNA lab subscription"),
  withCtaLabel(ccnaPracticeSupportLinks.freeTrial, "Start the CCNA free-trial path")
]

const ccnaSeoLinkGroups: CcnaSeoLinkGroup[] = [
  {
    id: "foundation",
    title: "Map The Blueprint",
    intro:
      "Use the pillar page and domain hubs to keep every lesson, lab, and practice block tied back to the CCNA blueprint.",
    columns: 3,
    links: pillarAndDomainLinks
  },
  {
    id: "practice-and-labs",
    title: "Practice And Labs",
    intro:
      "Move from reading into timed review, mock exams, Packet Tracer workflows, and guided lab walkthroughs.",
    columns: 3,
    links: practiceAndLabLinks
  },
  {
    id: "comparisons",
    title: "Comparison Pages",
    intro:
      "Use these pages when you are comparing practice platforms, exam engines, and lab-focused study options before buying.",
    columns: 3,
    links: comparisonLinks
  },
  {
    id: "subscriptions",
    title: "Subscription Paths",
    intro:
      "These pages connect research intent to a specific plan, free-start option, or focused subscription path.",
    columns: 3,
    links: subscriptionLinks
  }
]

export function getCcnaSeoLinkGroups(currentRoute: string) {
  return ccnaSeoLinkGroups
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => link.route !== currentRoute)
    }))
    .filter((group) => group.links.length > 0)
}
