import { ccnaCommercialSupportLinks } from "@/features/marketing/lib/ccna-commercial-pages";
import { ccnaPracticeSupportLinks } from "@/features/marketing/lib/ccna-practice-cluster-pages";
import { APP_ROUTES } from "@/lib/auth/redirects";

export interface LabClusterLink {
  route: string;
  title: string;
  description: string;
}

interface LabClusterBlock {
  title: string;
  description: string;
}

interface LabClusterStep {
  title: string;
  description: string;
}

interface LabClusterTroubleshootingItem {
  issue: string;
  fix: string;
}

interface LabClusterFaq {
  question: string;
  answer: string;
}

export interface CcnaLabClusterPageContent {
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
  labGoal: string;
  totalTime: string;
  objectiveMapping: LabClusterBlock[];
  prerequisites: string[];
  steps: LabClusterStep[];
  verification: string[];
  troubleshooting: LabClusterTroubleshootingItem[];
  trustHeading: string;
  trustDescription: string;
  trustPoints: string[];
  practiceLinks: LabClusterLink[];
  relatedLinks: LabClusterLink[];
  conversionLinks: LabClusterLink[];
  faqs: LabClusterFaq[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  ctaTitle: string;
  ctaDescription: string;
}

export const ccnaLabSupportLinks = {
  labsHub: {
    route: APP_ROUTES.ccnaLabs,
    title: "CCNA Labs",
    description:
      "Use the broader labs hub when you want a higher-level view of guided hands-on practice across the CCNA blueprint."
  },
  labSubscription: {
    route: APP_ROUTES.ccnaLabSubscription,
    title: "CCNA Lab Subscription",
    description:
      "Unlock more guided Packet Tracer labs, clearer verification workflows, and deeper hands-on access."
  },
  practiceHub: ccnaPracticeSupportLinks.practiceHub,
  practiceSubscription: ccnaPracticeSupportLinks.practiceSubscription,
  freeTrial: ccnaPracticeSupportLinks.freeTrial,
  pricing: ccnaCommercialSupportLinks.pricing,
  topicsHub: ccnaCommercialSupportLinks.topicsHub,
  subnetting: {
    route: APP_ROUTES.ccnaSubnettingPractice,
    title: "CCNA Subnetting Practice",
    description:
      "Practice CIDR, host ranges, and verification logic when addressing mistakes are slowing down your labs."
  },
  labsWithAnswers: {
    route: APP_ROUTES.ccnaLabsWithAnswers,
    title: "CCNA Labs With Answers",
    description:
      "Use guided answer-focused labs when you want walkthrough help, verification, and troubleshooting together."
  },
  labsForBeginners: {
    route: APP_ROUTES.ccnaLabsForBeginners,
    title: "CCNA Labs for Beginners",
    description:
      "Start with lower-friction labs if you are still building confidence with basic switching, addressing, and verification."
  },
  packetTracerLabsDownload: {
    route: APP_ROUTES.ccnaPacketTracerLabsDownload,
    title: "CCNA Packet Tracer Labs Download",
    description:
      "Open the Packet Tracer download page when you specifically want .pkt workspace intent and setup guidance."
  },
  vlanLab: {
    route: APP_ROUTES.ccnaVlanLab,
    title: "CCNA VLAN Lab",
    description:
      "Practice VLAN creation, access port assignment, and segmentation verification in a focused switching lab."
  },
  trunkingExplained: {
    route: APP_ROUTES.ccnaTrunkingExplained,
    title: "CCNA Trunking Explained",
    description:
      "Review 802.1Q trunking, native VLAN consistency, and allowed VLAN behavior with a step-by-step guide."
  },
  ospfExplained: {
    route: APP_ROUTES.ccnaOspfSingleAreaExplained,
    title: "CCNA OSPF Single Area Explained",
    description:
      "Walk through single-area OSPF setup, adjacency checks, and route verification."
  },
  aclExplained: {
    route: APP_ROUTES.ccnaAclExplained,
    title: "CCNA ACL Explained",
    description:
      "Use the ACL guide for permit/deny logic, placement, and interface application troubleshooting."
  },
  natExplained: {
    route: APP_ROUTES.ccnaNatExplained,
    title: "CCNA NAT Explained",
    description:
      "Review inside and outside roles, PAT behavior, and translation verification in a configuration workflow."
  },
  sshConfiguration: {
    route: APP_ROUTES.ccnaSshConfiguration,
    title: "CCNA SSH Configuration",
    description:
      "Practice secure device management with local users, RSA keys, and SSH-only VTY access."
  },
  portSecurityConfiguration: {
    route: APP_ROUTES.ccnaPortSecurityConfiguration,
    title: "CCNA Port Security Configuration",
    description:
      "Configure sticky MAC learning, violation actions, and interface verification on switch access ports."
  }
} as const;

export const ccnaLabClusterPages: CcnaLabClusterPageContent[] = [
  {
    route: APP_ROUTES.ccnaLabsWithAnswers,
    title: "CCNA Labs With Answers",
    metaTitle: "CCNA Labs With Answers, Verification, and Troubleshooting",
    metaDescription:
      "Practice CCNA labs with answers, verification steps, troubleshooting guidance, and clear CTAs to unlock more hands-on labs and subscriptions.",
    primaryKeyword: "CCNA labs with answers",
    secondaryKeywords: [
      "CCNA labs answers",
      "CCNA labs with solutions",
      "CCNA guided labs",
      "CCNA lab verification"
    ],
    heroEyebrow: "CCNA Labs With Answers",
    heroTitle: "CCNA labs with answers work best when the answer includes verification and troubleshooting, not just final commands.",
    heroDescription:
      "This page targets learners who want guided lab help without losing the learning value. The focus is on objective mapping, worked steps, and what to verify after you finish.",
    heroPoints: [
      "Answer-focused lab support with verification built in",
      "Original hands-on guidance for ethical CCNA preparation",
      "Direct upgrade paths to unlock more labs and deeper practice"
    ],
    labGoal:
      "Use answer-supported labs to understand what the task is asking, complete the configuration in order, and confirm why the result works before moving on.",
    totalTime: "PT45M",
    objectiveMapping: [
      {
        title: "Translate objectives into actions",
        description:
          "Map vague lab wording into concrete tasks like configure, verify, isolate, and document."
      },
      {
        title: "Compare your result against expected behavior",
        description:
          "Use answers as a verification aid so you can see whether the network is behaving correctly, not just whether the commands look familiar."
      },
      {
        title: "Diagnose misses faster",
        description:
          "Troubleshooting notes help you identify where the workflow went wrong before bad habits stick."
      }
    ],
    prerequisites: [
      "Basic Cisco CLI navigation and interface mode familiarity",
      "Packet Tracer or equivalent CCNA lab environment",
      "Comfort with IPv4 addressing and default gateway basics"
    ],
    steps: [
      {
        title: "Read the task and define the expected end state",
        description:
          "Before touching the CLI, decide what the topology should be able to do when the lab is complete."
      },
      {
        title: "Attempt the configuration in your own order first",
        description:
          "Treat the answer section as a checkpoint, not the first move, so you still practice recall and reasoning."
      },
      {
        title: "Compare your work against the guided answer",
        description:
          "Look for missing commands, wrong interface scope, incorrect masks, or skipped verification steps."
      },
      {
        title: "Run the verification checklist",
        description:
          "Confirm the topology behaves correctly with show commands and traffic tests before you mark the lab complete."
      }
    ],
    verification: [
      "Check interface state with `show ip interface brief` or the switch equivalent",
      "Validate feature-specific output such as `show vlan brief`, `show interfaces trunk`, or `show access-lists`",
      "Test expected connectivity with pings from the correct source and destination",
      "Compare the running configuration against the objective instead of only against the answer block"
    ],
    troubleshooting: [
      {
        issue: "The commands match the answer but the lab still fails",
        fix: "Verify interface state, IP addressing, and whether the correct interface or direction was used before assuming the logic is wrong."
      },
      {
        issue: "You copied the answer and still do not understand the result",
        fix: "Walk back through the objective mapping and identify which command changed forwarding, segmentation, routing, or security behavior."
      },
      {
        issue: "Traffic fails even though configuration looks close",
        fix: "Check masks, default gateways, VLAN membership, and missing `no shutdown` commands first because they are common silent blockers."
      }
    ],
    trustHeading: "Answer guidance should still reinforce original, ethical practice",
    trustDescription:
      "These pages are positioned around original hands-on workflows and exam-relevant skill building. They do not claim real exam questions or shortcut content.",
    trustPoints: [
      "Original lab guidance aligned to public CCNA topics",
      "Answer support plus verification instead of blind copying",
      "Non-dump positioning with real hands-on emphasis"
    ],
    practiceLinks: [
      ccnaLabSupportLinks.practiceHub,
      ccnaLabSupportLinks.practiceSubscription,
      ccnaPracticeSupportLinks.questionBank,
      ccnaLabSupportLinks.topicsHub
    ],
    relatedLinks: [
      ccnaLabSupportLinks.labsHub,
      ccnaLabSupportLinks.labsForBeginners,
      ccnaLabSupportLinks.packetTracerLabsDownload,
      ccnaLabSupportLinks.vlanLab
    ],
    conversionLinks: [
      ccnaLabSupportLinks.labSubscription,
      ccnaLabSupportLinks.freeTrial,
      ccnaLabSupportLinks.pricing,
      ccnaPracticeSupportLinks.courseWithPracticeTests
    ],
    faqs: [
      {
        question: "Are CCNA labs with answers still useful if I already know some commands?",
        answer:
          "Yes. The answer layer becomes more valuable when it helps you verify why the network is working and not just what command was entered."
      },
      {
        question: "Should I copy the answer first and then test?",
        answer:
          "No. Try the lab from memory first, then use the answer section as a correction and verification tool."
      },
      {
        question: "Do answer-based labs claim real exam questions?",
        answer:
          "No. These pages focus on original hands-on practice and exam-like skill building, not recalled exam content."
      }
    ],
    primaryCtaLabel: "Unlock More Labs",
    primaryCtaHref: APP_ROUTES.ccnaLabSubscription,
    secondaryCtaLabel: "Start Free Trial Path",
    secondaryCtaHref: APP_ROUTES.ccnaCourseFreeTrial,
    ctaTitle: "Use guided answers as a bridge into deeper hands-on practice",
    ctaDescription:
      "Unlock more labs if you want a larger guided library, or start free first if you want to inspect the platform before subscribing."
  },
  {
    route: APP_ROUTES.ccnaLabsForBeginners,
    title: "CCNA Labs for Beginners",
    metaTitle: "CCNA Labs for Beginners With Clear Steps and Verification",
    metaDescription:
      "Start CCNA labs for beginners with low-friction objectives, Packet Tracer-friendly steps, verification checks, troubleshooting help, and clear upgrade CTAs.",
    primaryKeyword: "CCNA labs for beginners",
    secondaryKeywords: [
      "beginner CCNA labs",
      "easy CCNA labs",
      "CCNA starter labs",
      "Packet Tracer labs for beginners"
    ],
    heroEyebrow: "CCNA Labs for Beginners",
    heroTitle: "Beginner CCNA labs should reduce setup friction without removing the real networking work.",
    heroDescription:
      "This page is built for early-stage learners who need approachable hands-on tasks, clear prerequisites, and verification steps that build confidence instead of confusion.",
    heroPoints: [
      "Low-friction labs for early CCNA study blocks",
      "Packet Tracer-friendly workflows with clear checkpoints",
      "Strong paths into advanced labs and subscription access"
    ],
    labGoal:
      "Help beginners move from reading networking concepts to applying them in small, repeatable labs that are realistic enough to build confidence for later CCNA practice.",
    totalTime: "PT35M",
    objectiveMapping: [
      {
        title: "Learn the lab rhythm",
        description:
          "Beginners need to understand how to read objectives, apply configuration, verify, and troubleshoot in the right order."
      },
      {
        title: "Reinforce core CCNA building blocks",
        description:
          "Starter labs should strengthen interface state, addressing, basic switching, and simple reachability before branching into bigger features."
      },
      {
        title: "Create repeatable confidence",
        description:
          "The goal is not just to finish one lab but to make future labs feel less intimidating."
      }
    ],
    prerequisites: [
      "Packet Tracer installed and opening correctly",
      "Basic understanding of devices, cables, and the Cisco CLI",
      "Simple IPv4 addressing and ping familiarity"
    ],
    steps: [
      {
        title: "Choose one small objective at a time",
        description:
          "Start with a single switching or addressing task instead of a full multi-feature topology."
      },
      {
        title: "Configure only what the lab goal requires",
        description:
          "Avoid adding extra commands so it is easier to see which change fixed the topology and which one introduced noise."
      },
      {
        title: "Verify after each small milestone",
        description:
          "Run interface, VLAN, or reachability checks before moving to the next task so you catch mistakes early."
      },
      {
        title: "Write down the failure and the fix",
        description:
          "Short troubleshooting notes are one of the fastest ways for beginners to improve over multiple labs."
      }
    ],
    verification: [
      "Use `show ip interface brief` to confirm interfaces are up with the expected addresses",
      "Use `show vlan brief` when a switching lab involves VLAN assignment",
      "Ping between the correct endpoints to confirm the lab goal was met",
      "Save or note the final working state so you can repeat the lab later"
    ],
    troubleshooting: [
      {
        issue: "The topology looks connected but traffic still fails",
        fix: "Check addressing, masks, gateways, and whether the interface is administratively down before changing bigger features."
      },
      {
        issue: "You get lost after making one mistake",
        fix: "Roll back to the last verified state and then test one small change at a time instead of rewriting the whole device."
      },
      {
        issue: "The lab feels too advanced for your current pace",
        fix: "Move to a smaller objective first, then return after you can verify interfaces and basic reachability comfortably."
      }
    ],
    trustHeading: "Beginner-friendly does not mean watered down",
    trustDescription:
      "These beginner pages still emphasize original, exam-relevant hands-on practice. The difference is pacing, clarity, and lower setup friction.",
    trustPoints: [
      "Original labs aligned to CCNA starter objectives",
      "Clear steps, verification, and troubleshooting for first-time lab users",
      "Ethical practice positioning without shortcut claims"
    ],
    practiceLinks: [
      ccnaLabSupportLinks.practiceHub,
      ccnaPracticeSupportLinks.freeVsPaid,
      ccnaLabSupportLinks.subnetting,
      ccnaLabSupportLinks.topicsHub
    ],
    relatedLinks: [
      ccnaLabSupportLinks.labsHub,
      ccnaLabSupportLinks.labsWithAnswers,
      ccnaLabSupportLinks.packetTracerLabsDownload,
      ccnaLabSupportLinks.vlanLab
    ],
    conversionLinks: [
      ccnaLabSupportLinks.freeTrial,
      ccnaLabSupportLinks.labSubscription,
      ccnaLabSupportLinks.pricing,
      ccnaPracticeSupportLinks.practiceSubscription
    ],
    faqs: [
      {
        question: "What makes a CCNA lab beginner-friendly?",
        answer:
          "A beginner-friendly lab has a narrow goal, clear prerequisites, verification after each milestone, and troubleshooting guidance that explains common mistakes."
      },
      {
        question: "Should beginners start with routing or switching labs?",
        answer:
          "Most learners improve faster by starting with addressing, interfaces, and switching basics before moving into larger routing workflows."
      },
      {
        question: "Do beginner labs still help with the real CCNA exam?",
        answer:
          "Yes. The best beginner labs build the habits that later CCNA practice depends on, especially verification, device familiarity, and troubleshooting order."
      }
    ],
    primaryCtaLabel: "Start Free Trial Path",
    primaryCtaHref: APP_ROUTES.ccnaCourseFreeTrial,
    secondaryCtaLabel: "Unlock More Labs",
    secondaryCtaHref: APP_ROUTES.ccnaLabSubscription,
    ctaTitle: "Start with lower-friction labs, then scale into broader hands-on practice",
    ctaDescription:
      "Begin with the free-start path if you want to ease in, or unlock more labs when you are ready for a larger guided library."
  },
  {
    route: APP_ROUTES.ccnaPacketTracerLabsDownload,
    title: "CCNA Packet Tracer Labs Download",
    metaTitle: "CCNA Packet Tracer Labs Download With Setup and Verification",
    metaDescription:
      "Download CCNA Packet Tracer labs with setup guidance, objective mapping, verification checks, troubleshooting tips, and CTAs to unlock more labs.",
    primaryKeyword: "CCNA Packet Tracer labs download",
    secondaryKeywords: [
      "Packet Tracer labs download CCNA",
      "CCNA .pkt labs",
      "CCNA Packet Tracer practice labs",
      "download CCNA labs"
    ],
    heroEyebrow: "CCNA Packet Tracer Labs Download",
    heroTitle: "Packet Tracer download intent is strongest when the page explains what to open, what to verify, and what to do next.",
    heroDescription:
      "This page is for learners specifically searching for downloadable CCNA lab workspaces. It keeps the focus on setup, file use, verification, and how the downloaded lab fits into a bigger study system.",
    heroPoints: [
      "Packet Tracer workspace-focused search intent",
      "Guidance for setup, completion, and verification after download",
      "Clear upgrade path into a larger lab subscription"
    ],
    labGoal:
      "Help learners move from download intent into actual hands-on completion by showing how to open the file, work the objective, and verify the topology correctly.",
    totalTime: "PT30M",
    objectiveMapping: [
      {
        title: "Turn a file download into a usable lab",
        description:
          "The workspace should come with enough context to show what success looks like once the file is open."
      },
      {
        title: "Reduce setup mistakes",
        description:
          "Download pages should warn learners about version, saved state, and topology assumptions before frustration sets in."
      },
      {
        title: "Connect download intent to broader study",
        description:
          "The page should move beyond the file itself and show where related labs, practice tests, and subscriptions fit."
      }
    ],
    prerequisites: [
      "Cisco Packet Tracer installed and launching correctly",
      "Basic comfort with opening and saving `.pkt` files",
      "Simple CLI verification knowledge such as interface and ping checks"
    ],
    steps: [
      {
        title: "Download and open the workspace",
        description:
          "Make sure the file opens in a compatible Packet Tracer version and inspect the topology before you start changing anything."
      },
      {
        title: "Read the lab goal and expected end state",
        description:
          "Use the objective mapping and notes to understand whether the task is about VLANs, routing, NAT, or another CCNA skill."
      },
      {
        title: "Complete the configuration workflow",
        description:
          "Apply the required changes deliberately instead of editing every device at once, so troubleshooting stays manageable."
      },
      {
        title: "Verify and save your findings",
        description:
          "Check the feature-specific output and note what passed, what failed, and why before closing the file."
      }
    ],
    verification: [
      "Confirm the workspace matches the expected topology before you configure anything",
      "Run feature-specific checks such as VLAN, trunk, route, NAT, or ACL verification commands",
      "Use end-to-end pings from the intended source and destination devices",
      "Save the lab after it works so you can reopen a known-good state later"
    ],
    troubleshooting: [
      {
        issue: "The Packet Tracer file opens but behaves unexpectedly",
        fix: "Check whether the file was built for a different version or whether devices already contain saved configuration state."
      },
      {
        issue: "The topology looks correct but verification fails",
        fix: "Review interface state, addressing, and whether the right device or interface was configured before assuming the download is broken."
      },
      {
        issue: "You finish the commands but do not know whether the lab is complete",
        fix: "Go back to the objective mapping and compare the final behavior, not just the running configuration text."
      }
    ],
    trustHeading: "Download pages still need real instructional value",
    trustDescription:
      "This page stays grounded in original lab workflows and guided Packet Tracer practice. It does not position downloads as shortcuts or substitutes for understanding.",
    trustPoints: [
      "Original Packet Tracer-oriented lab guidance",
      "Verification-first completion instead of file dumping",
      "Honest upgrade path into a fuller lab library"
    ],
    practiceLinks: [
      ccnaLabSupportLinks.practiceHub,
      ccnaPracticeSupportLinks.bestPracticeTests,
      ccnaLabSupportLinks.topicsHub,
      ccnaLabSupportLinks.subnetting
    ],
    relatedLinks: [
      ccnaLabSupportLinks.labsHub,
      ccnaLabSupportLinks.labsForBeginners,
      ccnaLabSupportLinks.labsWithAnswers,
      ccnaLabSupportLinks.vlanLab
    ],
    conversionLinks: [
      ccnaLabSupportLinks.labSubscription,
      ccnaLabSupportLinks.freeTrial,
      ccnaLabSupportLinks.pricing,
      ccnaPracticeSupportLinks.practiceSubscription
    ],
    faqs: [
      {
        question: "Are Packet Tracer lab downloads enough by themselves for CCNA prep?",
        answer:
          "They help most when they are paired with objectives, verification, troubleshooting notes, and a wider study plan instead of being treated as isolated files."
      },
      {
        question: "Why do downloaded labs still need verification instructions?",
        answer:
          "Because opening the file is only the start. Verification is what confirms that the feature actually works the way the lab intended."
      },
      {
        question: "Does a Packet Tracer download page imply real exam content?",
        answer:
          "No. The value comes from original, exam-relevant hands-on practice rather than real exam questions or recalled exam material."
      }
    ],
    primaryCtaLabel: "Unlock More Labs",
    primaryCtaHref: APP_ROUTES.ccnaLabSubscription,
    secondaryCtaLabel: "Compare Pricing",
    secondaryCtaHref: APP_ROUTES.pricing,
    ctaTitle: "Use download intent as the start of a bigger hands-on workflow",
    ctaDescription:
      "Open the lab subscription if you want more guided Packet Tracer practice, or compare pricing if you are deciding how much depth you need."
  },
  {
    route: APP_ROUTES.ccnaSubnettingPractice,
    title: "CCNA Subnetting Practice",
    metaTitle: "CCNA Subnetting Practice With Workflow, Verification, and Speed Drills",
    metaDescription:
      "Build CCNA subnetting practice with a clear solving workflow, prerequisites, verification checks, troubleshooting help, and CTAs into labs and practice tests.",
    primaryKeyword: "CCNA subnetting practice",
    secondaryKeywords: [
      "subnetting practice for CCNA",
      "CCNA subnetting questions",
      "IPv4 subnetting practice",
      "CIDR practice"
    ],
    heroEyebrow: "CCNA Subnetting Practice",
    heroTitle: "Subnetting practice gets easier when you follow the same solving workflow every time.",
    heroDescription:
      "This page upgrades the old generic topic page into a more practical subnetting workflow with objective mapping, step order, verification, and links into related labs and practice tests.",
    heroPoints: [
      "Step-by-step subnetting workflow for speed and accuracy",
      "Verification guidance so you catch mistakes before they compound",
      "Strong internal paths into labs, practice tests, and broader CCNA study"
    ],
    labGoal:
      "Help learners solve subnetting tasks faster by using a repeatable process for masks, block sizes, network addresses, broadcast addresses, and host ranges.",
    totalTime: "PT25M",
    objectiveMapping: [
      {
        title: "Convert prefix length into usable math",
        description:
          "Move from slash notation to mask, interesting octet, and block size without guessing."
      },
      {
        title: "Identify the correct subnet boundaries",
        description:
          "The goal is to calculate the network and broadcast ranges accurately before you count hosts."
      },
      {
        title: "Build repetition that survives timed review",
        description:
          "Practice should make subnetting faster under exam pressure, not just possible when you have unlimited time."
      }
    ],
    prerequisites: [
      "Comfort with IPv4 addresses and slash notation",
      "Basic binary or block-size awareness",
      "Willingness to verify every answer instead of jumping to the next question"
    ],
    steps: [
      {
        title: "Read the prefix and find the interesting octet",
        description:
          "Determine where the subnet mask changes from full network bits into host bits so you know where the math matters."
      },
      {
        title: "Calculate the block size",
        description:
          "Use the mask value in the interesting octet to determine the increment between subnet boundaries."
      },
      {
        title: "Locate the network and broadcast addresses",
        description:
          "Find the lower and upper boundaries for the subnet before trying to count usable hosts."
      },
      {
        title: "Confirm host range and usable count",
        description:
          "Identify the first host, last host, and usable host total, then check the answer against the prefix rules."
      }
    ],
    verification: [
      "Confirm the network address is the lowest address in the subnet block",
      "Confirm the broadcast address is the highest address in the subnet block",
      "Check that the usable host range sits strictly between network and broadcast",
      "Validate that usable hosts follow the `2^host bits - 2` rule for normal IPv4 subnetting"
    ],
    troubleshooting: [
      {
        issue: "You keep missing the network address",
        fix: "Recheck the interesting octet and block size first. Most subnetting misses start there rather than in the final host math."
      },
      {
        issue: "You forget why the usable host count is off",
        fix: "Make sure you are subtracting the network and broadcast addresses only after calculating the total host space."
      },
      {
        issue: "You get different answers every time",
        fix: "Use the same order on every problem: prefix, interesting octet, block size, network, broadcast, host range, usable count."
      }
    ],
    trustHeading: "Strong subnetting practice builds skill, not memorized trivia",
    trustDescription:
      "This page is positioned around original practice workflows, explanations, and verification. It does not rely on shortcut claims or real exam questions.",
    trustPoints: [
      "Original subnetting practice aligned to CCNA needs",
      "Process-focused solving instead of blind memorization",
      "Connected follow-up paths into labs and practice exams"
    ],
    practiceLinks: [
      ccnaLabSupportLinks.practiceHub,
      ccnaPracticeSupportLinks.questionBank,
      ccnaPracticeSupportLinks.timedPracticeTest,
      ccnaLabSupportLinks.topicsHub
    ],
    relatedLinks: [
      ccnaLabSupportLinks.labsHub,
      ccnaLabSupportLinks.ospfExplained,
      ccnaLabSupportLinks.natExplained,
      ccnaLabSupportLinks.labsForBeginners
    ],
    conversionLinks: [
      ccnaLabSupportLinks.freeTrial,
      ccnaLabSupportLinks.labSubscription,
      ccnaLabSupportLinks.practiceSubscription,
      ccnaLabSupportLinks.pricing
    ],
    faqs: [
      {
        question: "What should CCNA subnetting practice include?",
        answer:
          "Strong subnetting practice should cover prefix length, block size, network and broadcast addresses, usable hosts, and answer verification in the same workflow."
      },
      {
        question: "Why is subnetting still important if I am focusing on labs?",
        answer:
          "Subnetting mistakes often break routing, VLAN, NAT, and ACL labs, so stronger subnetting improves more than one area of CCNA prep."
      },
      {
        question: "Does subnetting practice replace full labs?",
        answer:
          "No. It is one of the highest-leverage supporting skills, but it works best when paired with switching, routing, and services labs."
      }
    ],
    primaryCtaLabel: "Unlock More Labs",
    primaryCtaHref: APP_ROUTES.ccnaLabSubscription,
    secondaryCtaLabel: "Open Practice Test Subscription",
    secondaryCtaHref: APP_ROUTES.ccnaPracticeTestSubscription,
    ctaTitle: "Turn subnetting speed into stronger performance across the rest of CCNA practice",
    ctaDescription:
      "Unlock more labs if addressing errors are slowing you down, or open the practice-test subscription if you want subnetting pressure inside broader exam-style review."
  },
  {
    route: APP_ROUTES.ccnaVlanLab,
    title: "CCNA VLAN Lab",
    metaTitle: "CCNA VLAN Lab With Steps, Verification, and Troubleshooting",
    metaDescription:
      "Practice a CCNA VLAN lab with objective mapping, prerequisites, configuration steps, verification checks, troubleshooting help, and upgrade CTAs.",
    primaryKeyword: "CCNA VLAN lab",
    secondaryKeywords: [
      "VLAN lab CCNA",
      "CCNA VLAN configuration lab",
      "CCNA switch VLAN practice",
      "Packet Tracer VLAN lab"
    ],
    heroEyebrow: "CCNA VLAN Lab",
    heroTitle: "A VLAN lab should show you exactly how segmentation changes switch behavior.",
    heroDescription:
      "This page is built for hands-on VLAN practice. It focuses on creating VLANs, assigning access ports, verifying isolation, and troubleshooting the mistakes that usually appear in early switching labs.",
    heroPoints: [
      "Hands-on VLAN segmentation workflow",
      "Verification focused on what the switch is actually doing",
      "Direct paths into trunking, beginners labs, and subscription pages"
    ],
    labGoal:
      "Configure VLANs on a switch, assign the right access ports, and verify that devices share or separate traffic exactly the way the lab objective expects.",
    totalTime: "PT40M",
    objectiveMapping: [
      {
        title: "Create and name VLANs correctly",
        description:
          "Match switch segmentation to the documented user or management groups the lab wants you to build."
      },
      {
        title: "Assign access ports to the correct segment",
        description:
          "The port-to-VLAN mapping is what makes the segmentation visible in the actual data path."
      },
      {
        title: "Verify same-VLAN and different-VLAN behavior",
        description:
          "The learner should be able to prove why hosts can or cannot communicate before inter-VLAN routing exists."
      }
    ],
    prerequisites: [
      "Basic switch CLI navigation",
      "Host addressing on the correct subnet for each VLAN",
      "Awareness that inter-VLAN routing is separate from VLAN creation"
    ],
    steps: [
      {
        title: "Create the required VLANs",
        description:
          "Add each VLAN on the switch and name it clearly so later verification is easier to read."
      },
      {
        title: "Assign the correct interfaces as access ports",
        description:
          "Place each user-facing interface into the intended VLAN and confirm you are not editing the wrong port range."
      },
      {
        title: "Connect or simulate hosts in each VLAN",
        description:
          "Use host addressing that matches the intended VLAN design so the segmentation test is meaningful."
      },
      {
        title: "Test communication inside and across VLAN boundaries",
        description:
          "Verify that same-VLAN traffic works and that cross-VLAN traffic still needs routing support."
      }
    ],
    verification: [
      "Use `show vlan brief` to confirm VLAN IDs, names, and access-port membership",
      "Use `show interfaces status` or `show running-config interface` to confirm the right ports were changed",
      "Ping between same-VLAN hosts to confirm local switching works",
      "Confirm different-VLAN hosts cannot communicate until routing is added"
    ],
    troubleshooting: [
      {
        issue: "Hosts that should be in the same VLAN cannot ping",
        fix: "Check that both access ports are in the same VLAN and that the host IP settings match the intended subnet."
      },
      {
        issue: "A host appears in the wrong segment",
        fix: "Verify the exact interface number you changed and confirm that the port was not left in the default VLAN."
      },
      {
        issue: "Traffic crosses VLANs unexpectedly",
        fix: "Confirm whether routing exists elsewhere in the topology and review any uplink or SVI configuration that may already be active."
      }
    ],
    trustHeading: "VLAN practice should reinforce behavior, not just commands",
    trustDescription:
      "This VLAN page stays focused on original, hands-on switching practice that helps learners understand segmentation and verification instead of memorizing disconnected command strings.",
    trustPoints: [
      "Original switch lab workflow aligned to CCNA objectives",
      "Verification-driven segmentation practice",
      "Clear upgrade path into more advanced lab work"
    ],
    practiceLinks: [
      ccnaLabSupportLinks.practiceHub,
      ccnaPracticeSupportLinks.questionBank,
      ccnaLabSupportLinks.topicsHub,
      ccnaPracticeSupportLinks.mockExam
    ],
    relatedLinks: [
      ccnaLabSupportLinks.trunkingExplained,
      ccnaLabSupportLinks.labsForBeginners,
      ccnaLabSupportLinks.packetTracerLabsDownload,
      ccnaLabSupportLinks.labsWithAnswers
    ],
    conversionLinks: [
      ccnaLabSupportLinks.labSubscription,
      ccnaLabSupportLinks.freeTrial,
      ccnaLabSupportLinks.pricing,
      ccnaPracticeSupportLinks.practiceSubscription
    ],
    faqs: [
      {
        question: "What should a CCNA VLAN lab verify?",
        answer:
          "A solid VLAN lab should verify VLAN creation, correct access-port membership, and the expected communication behavior within and across VLAN boundaries."
      },
      {
        question: "Why do hosts in different VLANs fail to communicate in a basic VLAN lab?",
        answer:
          "Because VLAN segmentation creates separate Layer 2 broadcast domains. Inter-VLAN communication still requires a routing function."
      },
      {
        question: "Should a VLAN lab include Packet Tracer-style validation?",
        answer:
          "Yes. Packet Tracer or similar tooling is useful because it lets you inspect switch state and repeat the lab until the verification pattern becomes familiar."
      }
    ],
    primaryCtaLabel: "Unlock More Labs",
    primaryCtaHref: APP_ROUTES.ccnaLabSubscription,
    secondaryCtaLabel: "Start Free Trial Path",
    secondaryCtaHref: APP_ROUTES.ccnaCourseFreeTrial,
    ctaTitle: "Use VLAN labs as the entry point into broader switching practice",
    ctaDescription:
      "Unlock more labs if you want deeper switching workflows, or start free if you want to inspect the platform before subscribing."
  },
  {
    route: APP_ROUTES.ccnaTrunkingExplained,
    title: "CCNA Trunking Explained",
    metaTitle: "CCNA Trunking Explained With Configuration and Verification",
    metaDescription:
      "Learn CCNA trunking with clear objectives, prerequisites, configuration steps, verification commands, troubleshooting, and CTAs into more labs.",
    primaryKeyword: "CCNA trunking explained",
    secondaryKeywords: [
      "CCNA trunking",
      "802.1Q trunking explained",
      "CCNA trunk configuration",
      "native VLAN mismatch"
    ],
    heroEyebrow: "CCNA Trunking Explained",
    heroTitle: "Trunking makes more sense when you can see how multiple VLANs share one uplink.",
    heroDescription:
      "This guide targets trunking intent instead of broad VLAN-intro intent. It focuses on 802.1Q behavior, native VLAN consistency, allowed VLANs, and the verification steps that prove the trunk is working.",
    heroPoints: [
      "802.1Q trunking explained with lab-style checks",
      "Focus on native VLAN and allowed VLAN pitfalls",
      "Direct links into VLAN labs and more advanced switching practice"
    ],
    labGoal:
      "Configure and verify a trunk link so multiple VLANs can traverse one inter-switch uplink without breaking expected segmentation behavior.",
    totalTime: "PT35M",
    objectiveMapping: [
      {
        title: "Understand why a trunk exists",
        description:
          "A trunk is what allows multiple VLANs to cross one link instead of requiring one physical uplink per VLAN."
      },
      {
        title: "Control native and allowed VLAN behavior",
        description:
          "The lab should make clear how mismatches or omissions change forwarding and troubleshooting outcomes."
      },
      {
        title: "Verify the link from both ends",
        description:
          "A working trunk should be visible in the switch state, not only assumed because the interfaces are up."
      }
    ],
    prerequisites: [
      "VLAN basics and access-port configuration familiarity",
      "Access to two switches or a simulated inter-switch topology",
      "Hosts placed in VLANs that need to traverse the uplink"
    ],
    steps: [
      {
        title: "Prepare matching VLANs on both switches",
        description:
          "Make sure the VLANs that need to traverse the trunk exist where they are expected to exist."
      },
      {
        title: "Set the uplink to trunk mode",
        description:
          "Configure the inter-switch link to carry multiple VLANs and review any default behavior that could hide a mismatch."
      },
      {
        title: "Set or confirm the native VLAN and allowed VLAN list",
        description:
          "Use explicit settings when the topology needs them so you can see how these controls affect forwarding."
      },
      {
        title: "Verify traffic flow across the trunk",
        description:
          "Test same-VLAN communication across switches and confirm the trunk state using switch show commands."
      }
    ],
    verification: [
      "Use `show interfaces trunk` to confirm operational trunk state",
      "Validate native VLAN and allowed VLAN details on both switches",
      "Confirm same-VLAN hosts across different switches can communicate when the trunk is correct",
      "Inspect `show vlan brief` and running config output for consistency"
    ],
    troubleshooting: [
      {
        issue: "The uplink is up but VLAN traffic still fails",
        fix: "Check whether the required VLANs are allowed on the trunk and whether the VLANs exist on both sides of the link."
      },
      {
        issue: "The trunk works partially or inconsistently",
        fix: "Review native VLAN settings and make sure both ends agree instead of assuming defaults match."
      },
      {
        issue: "A port still behaves like an access link",
        fix: "Confirm you configured the correct interface and that switchport mode trunk actually applied to the intended uplink."
      }
    ],
    trustHeading: "Trunking guides should explain behavior, not just command syntax",
    trustDescription:
      "This page uses original switching explanations and lab-style verification to reinforce how trunks actually behave on a CCNA topology.",
    trustPoints: [
      "Original 802.1Q workflow and verification guidance",
      "Clear explanation of native VLAN and allowed VLAN behavior",
      "Connected path into VLAN labs and additional switching practice"
    ],
    practiceLinks: [
      ccnaLabSupportLinks.practiceHub,
      ccnaPracticeSupportLinks.timedPracticeTest,
      ccnaLabSupportLinks.topicsHub,
      ccnaPracticeSupportLinks.questionBank
    ],
    relatedLinks: [
      ccnaLabSupportLinks.vlanLab,
      ccnaLabSupportLinks.labsHub,
      ccnaLabSupportLinks.portSecurityConfiguration,
      ccnaLabSupportLinks.labsWithAnswers
    ],
    conversionLinks: [
      ccnaLabSupportLinks.labSubscription,
      ccnaLabSupportLinks.freeTrial,
      ccnaLabSupportLinks.pricing,
      ccnaPracticeSupportLinks.practiceSubscription
    ],
    faqs: [
      {
        question: "Why does a trunk matter in a CCNA switching lab?",
        answer:
          "A trunk lets multiple VLANs cross one uplink, which is essential when the same VLAN exists on different switches in the topology."
      },
      {
        question: "What is the most common trunking mistake to troubleshoot first?",
        answer:
          "Check native VLAN consistency and allowed VLAN coverage first because both can break traffic even when the physical link is up."
      },
      {
        question: "Should trunking be practiced separately from VLAN labs?",
        answer:
          "It is best learned with VLAN labs because trunking behavior only makes sense when you can see how it carries segmented traffic between switches."
      }
    ],
    primaryCtaLabel: "Unlock More Labs",
    primaryCtaHref: APP_ROUTES.ccnaLabSubscription,
    secondaryCtaLabel: "Open VLAN Lab",
    secondaryCtaHref: APP_ROUTES.ccnaVlanLab,
    ctaTitle: "Use trunking mastery to unlock stronger multi-switch labs",
    ctaDescription:
      "Unlock more labs if you want additional switching practice, or jump directly into the VLAN lab if you want to apply the concept immediately."
  },
  {
    route: APP_ROUTES.ccnaOspfSingleAreaExplained,
    title: "CCNA OSPF Single Area Explained",
    metaTitle: "CCNA OSPF Single Area Explained With Verification Steps",
    metaDescription:
      "Learn single-area OSPF for CCNA with objective mapping, prerequisites, setup steps, verification commands, troubleshooting, and lab subscription CTAs.",
    primaryKeyword: "CCNA OSPF single area explained",
    secondaryKeywords: [
      "single area OSPF CCNA",
      "OSPF single area explained",
      "CCNA OSPF lab",
      "OSPF neighbor verification"
    ],
    heroEyebrow: "CCNA OSPF Single Area Explained",
    heroTitle: "Single-area OSPF becomes easier when you verify adjacency before you worry about routes.",
    heroDescription:
      "This page targets a core routing explainer intent. It keeps the focus on adjacency, network advertisement, route verification, and the common mismatches that stop OSPF from forming correctly.",
    heroPoints: [
      "Single-area OSPF workflow with adjacency-first verification",
      "Clear routing-focused troubleshooting for CCNA learners",
      "Direct paths into subnetting, practice tests, and deeper labs"
    ],
    labGoal:
      "Configure OSPF in a single area, verify neighbor formation, and confirm that remote routes appear as expected before testing end-to-end reachability.",
    totalTime: "PT45M",
    objectiveMapping: [
      {
        title: "Form an adjacency correctly",
        description:
          "OSPF must agree on key parameters before route exchange can happen, so the first goal is always neighbor formation."
      },
      {
        title: "Advertise the right networks into area 0",
        description:
          "The configuration should cover the intended connected interfaces without accidentally leaving important networks out."
      },
      {
        title: "Verify route learning after adjacency",
        description:
          "The learner should prove that OSPF is not only up but also installing the expected routes into the table."
      }
    ],
    prerequisites: [
      "Working IP addressing on all participating interfaces",
      "Subnetting comfort for matching interfaces to OSPF statements",
      "Basic routing-table and interface verification knowledge"
    ],
    steps: [
      {
        title: "Confirm interface addressing and reachability first",
        description:
          "Before configuring OSPF, make sure the router interfaces are up and able to reach their directly connected neighbors."
      },
      {
        title: "Enable OSPF and advertise the required networks",
        description:
          "Add the router into a single-area design and ensure the correct interfaces participate in area 0."
      },
      {
        title: "Verify neighbor adjacency",
        description:
          "Check whether the routers form the expected neighbor relationship before evaluating routes."
      },
      {
        title: "Confirm learned routes and end-to-end reachability",
        description:
          "Inspect the routing table, then test traffic toward remote networks that should now be reachable."
      }
    ],
    verification: [
      "Use `show ip ospf neighbor` to confirm adjacency state",
      "Use `show ip route ospf` to confirm OSPF-learned routes appear",
      "Use `show ip protocols` to inspect participating networks and process details",
      "Test reachability to remote networks after routes are installed"
    ],
    troubleshooting: [
      {
        issue: "The routers can ping directly but never become OSPF neighbors",
        fix: "Check area assignment, interface participation, timers, passive-interface settings, and whether both sides truly share the same subnet."
      },
      {
        issue: "Neighbors form but routes still do not appear",
        fix: "Review the advertised networks and confirm that the remote router is actually advertising the expected connected interfaces."
      },
      {
        issue: "Only part of the topology works",
        fix: "Check masks, route presence, and whether the missing network was accidentally omitted or advertised incorrectly."
      }
    ],
    trustHeading: "Routing practice earns trust through verification depth",
    trustDescription:
      "This OSPF page emphasizes original configuration logic, adjacency checks, and route-table reasoning instead of shallow command memorization.",
    trustPoints: [
      "Original single-area OSPF walkthrough aligned to CCNA scope",
      "Adjacency, route, and reachability verification in one flow",
      "Strong links into supporting subnetting and practice pages"
    ],
    practiceLinks: [
      ccnaLabSupportLinks.practiceHub,
      ccnaPracticeSupportLinks.mockExam,
      ccnaLabSupportLinks.subnetting,
      ccnaPracticeSupportLinks.questionBank
    ],
    relatedLinks: [
      ccnaLabSupportLinks.labsHub,
      ccnaLabSupportLinks.natExplained,
      ccnaLabSupportLinks.aclExplained,
      ccnaLabSupportLinks.labsWithAnswers
    ],
    conversionLinks: [
      ccnaLabSupportLinks.labSubscription,
      ccnaLabSupportLinks.practiceSubscription,
      ccnaLabSupportLinks.freeTrial,
      ccnaLabSupportLinks.pricing
    ],
    faqs: [
      {
        question: "What should I verify first in a single-area OSPF lab?",
        answer:
          "Verify interface addressing and direct reachability first, then check adjacency with `show ip ospf neighbor` before looking for routes."
      },
      {
        question: "Why do OSPF routes fail to appear even when the devices are connected?",
        answer:
          "The routers may not share the right area, subnet, timers, or network statements, so adjacency and route exchange never complete properly."
      },
      {
        question: "Is OSPF practice more useful after subnetting practice?",
        answer:
          "Yes. Strong subnetting makes it easier to spot whether the interfaces really belong in the same network and whether your route advertisements make sense."
      }
    ],
    primaryCtaLabel: "Unlock More Labs",
    primaryCtaHref: APP_ROUTES.ccnaLabSubscription,
    secondaryCtaLabel: "Open Subnetting Practice",
    secondaryCtaHref: APP_ROUTES.ccnaSubnettingPractice,
    ctaTitle: "Use OSPF verification habits to strengthen the rest of your routing labs",
    ctaDescription:
      "Unlock more labs if you want broader routing practice, or tighten subnetting first if addressing mismatches are still slowing you down."
  },
  {
    route: APP_ROUTES.ccnaAclExplained,
    title: "CCNA ACL Explained",
    metaTitle: "CCNA ACL Explained With Configuration, Verification, and Troubleshooting",
    metaDescription:
      "Learn CCNA ACLs with objective mapping, prerequisites, configuration steps, verification, troubleshooting, and CTAs into more labs and practice tests.",
    primaryKeyword: "CCNA ACL explained",
    secondaryKeywords: [
      "CCNA ACLs explained",
      "CCNA ACL configuration",
      "extended ACL explained",
      "ACL troubleshooting CCNA"
    ],
    heroEyebrow: "CCNA ACL Explained",
    heroTitle: "ACLs make more sense when you treat them as traffic logic instead of just command syntax.",
    heroDescription:
      "This guide targets ACL intent with a practical workflow: define the traffic goal, choose placement, apply the list correctly, and verify that the permit and deny behavior matches the design.",
    heroPoints: [
      "Traffic-logic-first ACL workflow",
      "Verification and testing for permit and deny outcomes",
      "Internal links into SSH, NAT, and broader CCNA practice"
    ],
    labGoal:
      "Write and apply an ACL that controls the intended traffic, verify the result with show commands and tests, and troubleshoot placement or wildcard mistakes before moving on.",
    totalTime: "PT40M",
    objectiveMapping: [
      {
        title: "Match the ACL type to the traffic goal",
        description:
          "Know when a simple source-based standard ACL is enough and when extended matching is required."
      },
      {
        title: "Place the ACL intentionally",
        description:
          "The lab should reinforce why placement near source or destination changes operational behavior."
      },
      {
        title: "Verify the effect, not just the list",
        description:
          "ACL success is measured by what traffic is allowed or denied, not only by what appears in the running configuration."
      }
    ],
    prerequisites: [
      "IPv4 addressing and interface direction familiarity",
      "Basic understanding of source, destination, and protocol fields",
      "Ability to generate test traffic between the right endpoints"
    ],
    steps: [
      {
        title: "Define what traffic should pass and what should fail",
        description:
          "Write the intended policy in plain language before touching the ACL commands."
      },
      {
        title: "Create the ACL entries in the correct order",
        description:
          "Remember that ACLs are processed top down and that the implicit deny still exists at the end."
      },
      {
        title: "Apply the ACL to the correct interface and direction",
        description:
          "Attach the list where it will affect the intended traffic path without breaking unrelated flows."
      },
      {
        title: "Generate test traffic and verify the outcome",
        description:
          "Use show commands and traffic tests to confirm that the ACL is blocking and permitting exactly what the objective expected."
      }
    ],
    verification: [
      "Use `show access-lists` to confirm the ACL contents and hit behavior",
      "Use `show running-config interface` to confirm the ACL is applied in the intended direction",
      "Generate both permitted and denied traffic tests so you verify both sides of the policy",
      "Review reachability after the ACL to make sure the rest of the path still behaves correctly"
    ],
    troubleshooting: [
      {
        issue: "The ACL is present but does not affect traffic",
        fix: "Check whether it was applied to the correct interface and in the correct direction."
      },
      {
        issue: "Too much traffic is blocked",
        fix: "Review entry order, wildcard masks, and whether you accidentally relied on the implicit deny without adding needed permits."
      },
      {
        issue: "The ACL logic looks right but the test still fails",
        fix: "Confirm the traffic is actually traversing the interface where the ACL is applied and that addressing or routing is not the real problem."
      }
    ],
    trustHeading: "ACL practice should feel operational, not abstract",
    trustDescription:
      "This ACL page uses original hands-on logic, verification, and troubleshooting to reinforce how traffic filtering behaves in a real CCNA lab workflow.",
    trustPoints: [
      "Original ACL guidance aligned to CCNA objectives",
      "Permit/deny behavior validated with testing",
      "Connected links into SSH, NAT, and broader practice routes"
    ],
    practiceLinks: [
      ccnaLabSupportLinks.practiceHub,
      ccnaPracticeSupportLinks.questionBank,
      ccnaPracticeSupportLinks.mockExam,
      ccnaLabSupportLinks.topicsHub
    ],
    relatedLinks: [
      ccnaLabSupportLinks.sshConfiguration,
      ccnaLabSupportLinks.natExplained,
      ccnaLabSupportLinks.labsHub,
      ccnaLabSupportLinks.labsWithAnswers
    ],
    conversionLinks: [
      ccnaLabSupportLinks.labSubscription,
      ccnaLabSupportLinks.practiceSubscription,
      ccnaLabSupportLinks.freeTrial,
      ccnaLabSupportLinks.pricing
    ],
    faqs: [
      {
        question: "What is the most important thing to verify after applying an ACL?",
        answer:
          "Verify the effect on real traffic. The ACL is only correct when the intended traffic is permitted or denied exactly as planned."
      },
      {
        question: "Why do ACLs often break more traffic than expected?",
        answer:
          "Common causes are wildcard mistakes, incorrect order, the implicit deny, or applying the ACL to the wrong interface direction."
      },
      {
        question: "Should I learn ACLs before NAT and SSH labs?",
        answer:
          "It helps. ACL reasoning supports both NAT match logic and management-plane protection, so it strengthens later labs too."
      }
    ],
    primaryCtaLabel: "Unlock More Labs",
    primaryCtaHref: APP_ROUTES.ccnaLabSubscription,
    secondaryCtaLabel: "Open SSH Configuration Guide",
    secondaryCtaHref: APP_ROUTES.ccnaSshConfiguration,
    ctaTitle: "Turn ACL logic into stronger security and services labs",
    ctaDescription:
      "Unlock more labs if you want broader hands-on security practice, or jump into the SSH guide if you want the next logical management-plane workflow."
  },
  {
    route: APP_ROUTES.ccnaNatExplained,
    title: "CCNA NAT Explained",
    metaTitle: "CCNA NAT Explained With PAT Setup and Verification",
    metaDescription:
      "Learn CCNA NAT and PAT with objective mapping, prerequisites, setup steps, verification, troubleshooting, and CTAs into more labs and practice tests.",
    primaryKeyword: "CCNA NAT explained",
    secondaryKeywords: [
      "CCNA NAT configuration",
      "PAT explained CCNA",
      "CCNA NAT lab",
      "show ip nat translations"
    ],
    heroEyebrow: "CCNA NAT Explained",
    heroTitle: "NAT clicks faster when you separate inside and outside roles before you type any commands.",
    heroDescription:
      "This guide targets NAT and PAT configuration intent. It focuses on interface roles, translation logic, verification output, and the common missteps that prevent traffic from being translated.",
    heroPoints: [
      "Inside/outside workflow for NAT and PAT",
      "Verification centered on translations and traffic flow",
      "Strong links into ACL, subnetting, and practice-test support"
    ],
    labGoal:
      "Configure NAT or PAT so inside hosts can reach an outside network, then verify translation behavior and fix the common role, ACL, or route mistakes that block the result.",
    totalTime: "PT40M",
    objectiveMapping: [
      {
        title: "Identify inside and outside correctly",
        description:
          "NAT configuration depends on labeling the right interfaces before translation logic can work."
      },
      {
        title: "Match the right traffic for translation",
        description:
          "PAT only works for the traffic you actually define, so the match logic matters as much as the interface roles."
      },
      {
        title: "Verify the translation table and end result",
        description:
          "The lab should show both the translation entries and the user-facing traffic outcome."
      }
    ],
    prerequisites: [
      "Working inside and outside IP connectivity",
      "Basic ACL familiarity for identifying translated traffic",
      "Default route awareness so outside-bound traffic has somewhere to go"
    ],
    steps: [
      {
        title: "Decide which interfaces are inside and outside",
        description:
          "Map the user LAN and the upstream network before touching the NAT commands."
      },
      {
        title: "Define the traffic that should be translated",
        description:
          "Use the correct match logic so only the intended source network is translated."
      },
      {
        title: "Configure NAT or PAT",
        description:
          "Apply the translation rule using the correct interface or address pool approach for the lab objective."
      },
      {
        title: "Generate traffic and inspect translations",
        description:
          "Send traffic from the inside network and confirm the router creates the expected translation entries."
      }
    ],
    verification: [
      "Use `show ip nat translations` to confirm active entries",
      "Use `show ip nat statistics` to confirm NAT is actually processing sessions",
      "Verify inside hosts can reach the outside destination after translation is configured",
      "Inspect the relevant NAT lines in the running configuration to confirm roles and match logic"
    ],
    troubleshooting: [
      {
        issue: "No translations appear at all",
        fix: "Check whether the interfaces were marked inside and outside correctly and whether the traffic match statement actually includes the source network."
      },
      {
        issue: "The NAT config looks correct but traffic still fails",
        fix: "Review default routing, interface state, and ACL logic before assuming the translation engine is the problem."
      },
      {
        issue: "Only some traffic is translated",
        fix: "Confirm the matched subnet, the egress interface, and whether the tested source really belongs to the intended inside network."
      }
    ],
    trustHeading: "NAT guidance should prove the translation, not just recite the syntax",
    trustDescription:
      "This NAT page uses original configuration logic and verification-first checks so learners can see how translations behave in a real lab workflow.",
    trustPoints: [
      "Original NAT and PAT walkthrough aligned to CCNA scope",
      "Translation-table verification and traffic testing",
      "Connected paths into ACL, subnetting, and broader practice"
    ],
    practiceLinks: [
      ccnaLabSupportLinks.practiceHub,
      ccnaPracticeSupportLinks.questionBank,
      ccnaLabSupportLinks.subnetting,
      ccnaPracticeSupportLinks.mockExam
    ],
    relatedLinks: [
      ccnaLabSupportLinks.aclExplained,
      ccnaLabSupportLinks.ospfExplained,
      ccnaLabSupportLinks.labsHub,
      ccnaLabSupportLinks.labsWithAnswers
    ],
    conversionLinks: [
      ccnaLabSupportLinks.labSubscription,
      ccnaLabSupportLinks.practiceSubscription,
      ccnaLabSupportLinks.freeTrial,
      ccnaLabSupportLinks.pricing
    ],
    faqs: [
      {
        question: "What should I verify first in a NAT lab?",
        answer:
          "Verify inside and outside roles, then generate traffic and confirm that translation entries appear in `show ip nat translations`."
      },
      {
        question: "Why does NAT fail even when the syntax looks correct?",
        answer:
          "Common causes are reversed inside and outside interfaces, incorrect match logic, or missing outside reachability."
      },
      {
        question: "Does NAT practice connect to ACL and subnetting practice?",
        answer:
          "Yes. NAT often depends on correct source matching and accurate addressing, so ACL and subnetting strength makes NAT labs much easier."
      }
    ],
    primaryCtaLabel: "Unlock More Labs",
    primaryCtaHref: APP_ROUTES.ccnaLabSubscription,
    secondaryCtaLabel: "Open ACL Guide",
    secondaryCtaHref: APP_ROUTES.ccnaAclExplained,
    ctaTitle: "Use NAT practice as a bridge into stronger services troubleshooting",
    ctaDescription:
      "Unlock more labs if you want broader services practice, or move into the ACL guide if match logic is still the main blocker."
  },
  {
    route: APP_ROUTES.ccnaSshConfiguration,
    title: "CCNA SSH Configuration",
    metaTitle: "CCNA SSH Configuration With Verification and Troubleshooting",
    metaDescription:
      "Practice CCNA SSH configuration with prerequisites, setup steps, verification, troubleshooting, and CTAs into security labs and subscriptions.",
    primaryKeyword: "CCNA SSH configuration",
    secondaryKeywords: [
      "configure SSH on Cisco router CCNA",
      "CCNA SSH lab",
      "VTY SSH configuration",
      "secure remote management CCNA"
    ],
    heroEyebrow: "CCNA SSH Configuration",
    heroTitle: "SSH configuration becomes easier when you treat it as a management workflow, not a one-command fix.",
    heroDescription:
      "This guide targets secure-management configuration intent. It covers local users, domain naming, RSA key generation, VTY restrictions, verification, and the common mistakes that keep SSH from working.",
    heroPoints: [
      "Secure-management workflow for routers and switches",
      "SSH verification that proves login is actually ready",
      "Internal links into ACL and port security follow-up pages"
    ],
    labGoal:
      "Configure SSH-only remote management on a Cisco device, verify that secure access works, and confirm that weaker management paths are no longer available.",
    totalTime: "PT30M",
    objectiveMapping: [
      {
        title: "Prepare the device for secure remote access",
        description:
          "SSH requires more than a single command, so the workflow should reinforce each prerequisite in the right order."
      },
      {
        title: "Restrict management to SSH",
        description:
          "The goal is not just to enable SSH but to stop insecure access methods from remaining available on the VTY lines."
      },
      {
        title: "Verify the management plane end to end",
        description:
          "The lab should confirm the device can actually accept SSH and that the intended credentials and transport settings behave correctly."
      }
    ],
    prerequisites: [
      "Basic device hostname and interface configuration",
      "Reachability to the management IP address from a client",
      "Comfort with local usernames and line configuration mode"
    ],
    steps: [
      {
        title: "Set the hostname and domain name",
        description:
          "SSH key generation depends on the device identity being set correctly first."
      },
      {
        title: "Create the local management account",
        description:
          "Add the local credentials that the VTY lines will use for authentication."
      },
      {
        title: "Generate RSA keys and enable SSH",
        description:
          "Create the cryptographic keys required for SSH and confirm the device is ready to accept secure sessions."
      },
      {
        title: "Restrict the VTY lines to SSH and test login",
        description:
          "Apply login settings, disable Telnet transport, and verify that a client can connect over SSH successfully."
      }
    ],
    verification: [
      "Use `show ip ssh` to confirm the SSH process is available",
      "Use `show running-config | section line vty` to confirm SSH-only transport and login settings",
      "Attempt an SSH login from a reachable client to verify authentication and transport",
      "Confirm that insecure Telnet access is no longer allowed on the VTY lines"
    ],
    troubleshooting: [
      {
        issue: "SSH commands are present but login still fails",
        fix: "Check reachability to the management address, verify the username configuration, and confirm the VTY lines reference local login correctly."
      },
      {
        issue: "The device will not generate SSH keys",
        fix: "Confirm the hostname and domain name are configured before attempting RSA key generation."
      },
      {
        issue: "Telnet still works even though SSH is enabled",
        fix: "Review the VTY transport settings and make sure `transport input ssh` replaced the broader default behavior."
      }
    ],
    trustHeading: "Secure management labs should prove security, not just display the commands",
    trustDescription:
      "This SSH page uses original secure-management guidance and verification steps so learners can confirm the device actually behaves more securely after the walkthrough.",
    trustPoints: [
      "Original SSH configuration workflow aligned to CCNA security basics",
      "Verification of both successful SSH and blocked insecure transport",
      "Connected path into ACL and port security follow-up guides"
    ],
    practiceLinks: [
      ccnaLabSupportLinks.practiceHub,
      ccnaPracticeSupportLinks.questionBank,
      ccnaLabSupportLinks.topicsHub,
      ccnaPracticeSupportLinks.mockExam
    ],
    relatedLinks: [
      ccnaLabSupportLinks.aclExplained,
      ccnaLabSupportLinks.portSecurityConfiguration,
      ccnaLabSupportLinks.labsHub,
      ccnaLabSupportLinks.labsWithAnswers
    ],
    conversionLinks: [
      ccnaLabSupportLinks.labSubscription,
      ccnaLabSupportLinks.practiceSubscription,
      ccnaLabSupportLinks.freeTrial,
      ccnaLabSupportLinks.pricing
    ],
    faqs: [
      {
        question: "What should I verify after configuring SSH on a Cisco device?",
        answer:
          "Verify that SSH is enabled, the VTY lines allow only SSH transport, and a client can log in successfully with the expected credentials."
      },
      {
        question: "Why does SSH configuration often fail the first time?",
        answer:
          "Common causes are missing hostname or domain name settings, incorrect VTY login configuration, or lack of IP reachability to the management address."
      },
      {
        question: "Does SSH configuration connect naturally to ACL practice?",
        answer:
          "Yes. ACLs are often used to control management-plane access, so the two workflows reinforce each other well."
      }
    ],
    primaryCtaLabel: "Unlock More Labs",
    primaryCtaHref: APP_ROUTES.ccnaLabSubscription,
    secondaryCtaLabel: "Open Port Security Guide",
    secondaryCtaHref: APP_ROUTES.ccnaPortSecurityConfiguration,
    ctaTitle: "Use SSH configuration to strengthen the secure-management side of your CCNA prep",
    ctaDescription:
      "Unlock more labs if you want broader security practice, or continue into port security if you want another access-layer hardening workflow."
  },
  {
    route: APP_ROUTES.ccnaPortSecurityConfiguration,
    title: "CCNA Port Security Configuration",
    metaTitle: "CCNA Port Security Configuration With Verification Steps",
    metaDescription:
      "Practice CCNA port security configuration with prerequisites, setup steps, verification, troubleshooting, and CTAs into more switching and security labs.",
    primaryKeyword: "CCNA port security configuration",
    secondaryKeywords: [
      "port security configuration CCNA",
      "CCNA port security lab",
      "sticky MAC port security",
      "switch port security verification"
    ],
    heroEyebrow: "CCNA Port Security Configuration",
    heroTitle: "Port security becomes clearer when you watch the switch learn, count, and react to MAC addresses.",
    heroDescription:
      "This guide targets access-layer hardening intent. It focuses on secure access ports, sticky learning, violation modes, verification output, and the mistakes that leave the interface unprotected or unusable.",
    heroPoints: [
      "Access-layer hardening workflow for switch ports",
      "Verification centered on learned MACs and violations",
      "Internal links into VLAN, trunking, and broader security practice"
    ],
    labGoal:
      "Configure port security on an access port, verify sticky or manual MAC behavior, and confirm the interface responds correctly when a violation occurs.",
    totalTime: "PT35M",
    objectiveMapping: [
      {
        title: "Secure an access port intentionally",
        description:
          "Port security only applies correctly when the interface mode and MAC-learning expectations are configured in the right order."
      },
      {
        title: "Control how many devices can appear",
        description:
          "The lab should show how maximum MAC count and sticky learning affect normal user behavior on the port."
      },
      {
        title: "Verify violation handling",
        description:
          "Learners should be able to prove what happened after a violation and how to interpret the counters or interface state."
      }
    ],
    prerequisites: [
      "Basic switch interface configuration",
      "Understanding of access mode versus trunk mode",
      "Ability to connect or simulate more than one endpoint for testing"
    ],
    steps: [
      {
        title: "Set the interface as an access port",
        description:
          "Port security depends on the port behaving as a user-facing access interface before the feature can be enabled cleanly."
      },
      {
        title: "Enable port security and define the MAC policy",
        description:
          "Choose the maximum MAC count, sticky behavior, and violation action that match the lab objective."
      },
      {
        title: "Generate normal and violation traffic",
        description:
          "Connect or simulate the expected host first, then test what happens when an unexpected MAC appears."
      },
      {
        title: "Inspect switch state after the test",
        description:
          "Review learned addresses, security counters, and any interface shutdown or error behavior after the violation scenario."
      }
    ],
    verification: [
      "Use `show port-security interface` to confirm status, max count, and violation totals",
      "Use `show port-security address` to inspect learned or sticky MAC entries",
      "Use `show running-config interface` to confirm the intended access and security settings are present",
      "Verify whether the interface stayed active, restricted traffic, or shut down according to the chosen violation mode"
    ],
    troubleshooting: [
      {
        issue: "Port security will not enable on the interface",
        fix: "Confirm the interface is in access mode and that the feature prerequisites were applied in the correct order."
      },
      {
        issue: "The port shuts down unexpectedly",
        fix: "Review the configured violation action and the number of learned MAC addresses to see whether the test exceeded the allowed count."
      },
      {
        issue: "Sticky MAC entries do not survive or behave as expected",
        fix: "Check whether sticky learning was enabled correctly and whether the configuration was saved after the addresses were learned."
      }
    ],
    trustHeading: "Port security practice should show the switch reaction, not just the syntax",
    trustDescription:
      "This page stays focused on original access-layer hardening practice with verification of learned MACs, counters, and violation behavior.",
    trustPoints: [
      "Original port security workflow aligned to CCNA switching and security basics",
      "Verification of learned MACs and violation results",
      "Connected links into VLAN, trunking, and secure-management pages"
    ],
    practiceLinks: [
      ccnaLabSupportLinks.practiceHub,
      ccnaPracticeSupportLinks.questionBank,
      ccnaLabSupportLinks.topicsHub,
      ccnaPracticeSupportLinks.mockExam
    ],
    relatedLinks: [
      ccnaLabSupportLinks.vlanLab,
      ccnaLabSupportLinks.trunkingExplained,
      ccnaLabSupportLinks.sshConfiguration,
      ccnaLabSupportLinks.labsHub
    ],
    conversionLinks: [
      ccnaLabSupportLinks.labSubscription,
      ccnaLabSupportLinks.practiceSubscription,
      ccnaLabSupportLinks.freeTrial,
      ccnaLabSupportLinks.pricing
    ],
    faqs: [
      {
        question: "What should I verify after configuring port security?",
        answer:
          "Verify the interface security status, learned MAC addresses, configured maximum count, and the violation result after testing."
      },
      {
        question: "Why does port security sometimes disable the port immediately?",
        answer:
          "The port may already have more MAC addresses than allowed or may be using a violation mode that shuts the interface down on the first breach."
      },
      {
        question: "How does port security connect to VLAN and trunking practice?",
        answer:
          "Port security is an access-port feature, so it makes more sense when you already understand VLAN access ports and the difference between access and trunk roles."
      }
    ],
    primaryCtaLabel: "Unlock More Labs",
    primaryCtaHref: APP_ROUTES.ccnaLabSubscription,
    secondaryCtaLabel: "Open VLAN Lab",
    secondaryCtaHref: APP_ROUTES.ccnaVlanLab,
    ctaTitle: "Turn access-layer hardening into stronger switching and security confidence",
    ctaDescription:
      "Unlock more labs if you want broader switching and security practice, or revisit the VLAN lab if access-port behavior is still the bigger blocker."
  }
];

export const ccnaLabClusterPageMap = Object.fromEntries(
  ccnaLabClusterPages.map((page) => [page.route, page])
) as Record<string, CcnaLabClusterPageContent>;
