import { APP_ROUTES } from "@/lib/auth/redirects";

export interface AuthorityLink {
  route: string;
  title: string;
  description: string;
}

interface AuthorityFocusArea {
  title: string;
  description: string;
  bullets: string[];
}

interface AuthorityStudyStep {
  title: string;
  description: string;
  link: AuthorityLink;
}

export interface CcnaAuthorityPageContent {
  route: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  schemaType: "Article" | "CollectionPage";
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  overviewHeading: string;
  overviewIntro: string;
  focusAreas: AuthorityFocusArea[];
  studyHeading: string;
  studyIntro: string;
  studySteps: AuthorityStudyStep[];
  ctaTitle: string;
  ctaDescription: string;
  relatedHeading: string;
  relatedIntro: string;
  relatedLinks: AuthorityLink[];
}

const practiceLinks = {
  topicsHub: {
    route: APP_ROUTES.ccnaExamTopicsExplained,
    title: "CCNA Exam Topics Explained",
    description:
      "See how the six CCNA 200-301 v1.1 domains fit together and choose the guide you should study next."
  },
  subnetting: {
    route: APP_ROUTES.ccnaSubnettingPractice,
    title: "CCNA Subnetting Practice",
    description:
      "Reinforce IPv4 addressing, masks, host ranges, and subnetting speed with original practice workflows."
  },
  labs: {
    route: APP_ROUTES.ccnaLabs,
    title: "CCNA Labs",
    description:
      "Use guided Packet Tracer style labs and structured walkthroughs to turn theory into practical skill."
  },
  practiceExams: {
    route: APP_ROUTES.ccnaPracticeExams,
    title: "CCNA Practice Exams",
    description:
      "Review multiple domains, improve pacing, and measure readiness with original timed practice."
  }
} as const;

export const ccnaAuthorityPages: CcnaAuthorityPageContent[] = [
  {
    route: APP_ROUTES.ccnaExamTopicsExplained,
    title: "CCNA Exam Topics Explained",
    metaTitle: "CCNA Exam Topics Explained for 200-301 v1.1",
    metaDescription:
      "Understand the CCNA 200-301 v1.1 domains with clear explanations, internal study paths, and original CertPrep Academy lessons, labs, and practice workflows.",
    primaryKeyword: "CCNA exam topics explained",
    secondaryKeywords: [
      "CCNA 200-301 v1.1 topics",
      "CCNA blueprint explained",
      "CCNA domains explained",
      "how to study CCNA 200-301"
    ],
    schemaType: "CollectionPage",
    heroEyebrow: "CCNA 200-301 v1.1 Guide",
    heroTitle: "CCNA exam topics explained for the 200-301 v1.1 blueprint.",
    heroDescription:
      "Use this guide to understand what each CCNA domain is testing, how the topics connect, and where to focus your next lesson, lab, or practice session.",
    overviewHeading: "What the CCNA 200-301 v1.1 blueprint is really asking you to know",
    overviewIntro:
      "The CCNA blueprint blends foundational theory, hands-on reasoning, device configuration awareness, troubleshooting habits, and modern networking concepts across six connected domains. This hub keeps the scope organized and points you toward original CertPrep Academy study material for each area.",
    focusAreas: [
      {
        title: "Network Fundamentals",
        description:
          "Build the base layer: models, addressing, Ethernet behavior, wireless basics, and the language used across the rest of the exam.",
        bullets: [
          "OSI and TCP/IP models, device roles, and traffic flow",
          "IPv4, IPv6, subnetting, and basic verification",
          "LAN, WAN, cabling, and interface behavior"
        ]
      },
      {
        title: "Network Access",
        description:
          "Understand how switching, VLANs, trunking, and access-layer behavior segment and move traffic inside local networks.",
        bullets: [
          "Switching concepts and MAC-based forwarding",
          "VLAN segmentation and trunk links",
          "Inter-VLAN design awareness and access-layer troubleshooting"
        ]
      },
      {
        title: "IP Connectivity",
        description:
          "Learn how routers move traffic between networks and how static routing and OSPF support predictable reachability.",
        bullets: [
          "Static routes and default routes",
          "Single-area OSPF behavior",
          "Path verification and route troubleshooting"
        ]
      },
      {
        title: "IP Services",
        description:
          "Cover the supporting services that keep enterprise networks usable, scalable, and easier to operate.",
        bullets: [
          "DHCP, NAT, PAT, DNS, and NTP concepts",
          "First-hop service awareness and operational verification",
          "How service issues affect end-user connectivity"
        ]
      },
      {
        title: "Security Fundamentals",
        description:
          "Review secure management, basic hardening, and traffic control ideas that appear repeatedly in CCNA labs and troubleshooting.",
        bullets: [
          "SSH, secure credentials, and management plane basics",
          "ACL placement and traffic filtering logic",
          "Security-first habits for device setup and operations"
        ]
      },
      {
        title: "Automation and Programmability",
        description:
          "Understand the modern networking layer of controllers, APIs, JSON, and repeatable automation workflows.",
        bullets: [
          "Controller-based networking concepts",
          "APIs, JSON, and structured data",
          "Automation workflows and idempotent thinking"
        ]
      }
    ],
    studyHeading: "How to study the blueprint without getting lost",
    studyIntro:
      "A strong CCNA study plan keeps the blueprint connected. Start with domain understanding, reinforce it with original practice, and then move into timed review once the major concepts begin to link together.",
    studySteps: [
      {
        title: "Start with the domain guides",
        description:
          "Use the six topic guides to understand what each area covers and what you should be able to explain in plain language.",
        link: {
          route: APP_ROUTES.ccnaNetworkFundamentals,
          title: "Open the first domain guide",
          description: "Begin with the network fundamentals guide."
        }
      },
      {
        title: "Use original practice and labs",
        description:
          "After reading a topic guide, reinforce the ideas with original CertPrep Academy labs, subnetting drills, and hands-on study workflows.",
        link: practiceLinks.labs
      },
      {
        title: "Check timing and retention later",
        description:
          "Once the blueprint feels familiar, switch into timed mixed review to spot weak areas before the real exam date gets close.",
        link: practiceLinks.practiceExams
      }
    ],
    ctaTitle: "Turn the blueprint into a study plan you can actually follow",
    ctaDescription:
      "Create a free account to start with original CCNA lessons and topic guides, or compare plans to unlock the full lab and practice workflow.",
    relatedHeading: "Core guides and practice pages",
    relatedIntro:
      "Use these links to move from high-level blueprint understanding into specific domains and original CertPrep Academy practice tools.",
    relatedLinks: [
      {
        route: APP_ROUTES.ccnaNetworkFundamentals,
        title: "CCNA Network Fundamentals",
        description:
          "Start with models, addressing, subnetting, media, and interface behavior."
      },
      {
        route: APP_ROUTES.ccnaNetworkAccess,
        title: "CCNA Network Access",
        description:
          "Review switching, VLANs, trunks, and access-layer design concepts."
      },
      {
        route: APP_ROUTES.ccnaIpConnectivity,
        title: "CCNA IP Connectivity",
        description:
          "Learn how static routes and OSPF support routed communication."
      },
      practiceLinks.subnetting,
      practiceLinks.labs,
      practiceLinks.practiceExams
    ]
  },
  {
    route: APP_ROUTES.ccnaNetworkFundamentals,
    title: "CCNA Network Fundamentals",
    metaTitle: "CCNA Network Fundamentals Explained for 200-301 v1.1",
    metaDescription:
      "Learn what CCNA network fundamentals covers in the 200-301 v1.1 blueprint, from models and addressing to Ethernet, IPv6, and subnetting.",
    primaryKeyword: "CCNA network fundamentals",
    secondaryKeywords: [
      "CCNA network fundamentals explained",
      "CCNA 200-301 network fundamentals",
      "CCNA subnetting and addressing",
      "CCNA IPv6 fundamentals"
    ],
    schemaType: "Article",
    heroEyebrow: "CCNA Domain Guide",
    heroTitle: "CCNA network fundamentals explained for 200-301 v1.1.",
    heroDescription:
      "This domain gives you the language of networking: how devices communicate, how addresses work, how frames and packets move, and how to verify the basics before troubleshooting deeper problems.",
    overviewHeading: "What network fundamentals covers in CCNA 200-301 v1.1",
    overviewIntro:
      "Network fundamentals is where the rest of the CCNA starts making sense. It covers the models, addressing concepts, interface behavior, Ethernet and wireless basics, and the verification habits that show up again in switching, routing, security, and services.",
    focusAreas: [
      {
        title: "Models, devices, and traffic flow",
        description:
          "You should be able to describe what endpoints, switches, routers, firewalls, and protocols are doing as traffic moves across a network.",
        bullets: [
          "OSI and TCP/IP models in simple operational language",
          "Device roles, local delivery, and routed delivery",
          "Encapsulation, decapsulation, and protocol awareness"
        ]
      },
      {
        title: "Addressing and verification",
        description:
          "Addressing is a high-leverage area because it touches design, configuration, and troubleshooting at the same time.",
        bullets: [
          "IPv4 structure, subnet masks, network and broadcast logic",
          "Subnetting, VLSM, and host calculations",
          "IPv6 notation, address types, and basic neighbor behavior"
        ]
      },
      {
        title: "Media, Ethernet, and access basics",
        description:
          "This domain also expects you to understand the physical and local-network foundations that support real connectivity.",
        bullets: [
          "Copper, fiber, connectors, and interface characteristics",
          "LAN and WAN architecture basics",
          "Wireless access points, controllers, and client fundamentals"
        ]
      }
    ],
    studyHeading: "How to build confidence in network fundamentals",
    studyIntro:
      "The fastest way to improve here is to combine explanation with repetition. Read the concept, verify it with a short lab or command check, and repeat until addressing, interface status, and traffic flow feel natural.",
    studySteps: [
      {
        title: "Use subnetting drills early",
        description:
          "Subnetting is one of the most reusable skills in the whole blueprint, so it deserves frequent short practice sessions from the start.",
        link: practiceLinks.subnetting
      },
      {
        title: "Connect the theory to hands-on labs",
        description:
          "Even simple labs help you understand device roles, interfaces, addressing plans, and verification commands in context.",
        link: practiceLinks.labs
      },
      {
        title: "Keep the full blueprint in view",
        description:
          "Once this domain feels solid, use the topic hub to decide whether network access or IP connectivity should be your next step.",
        link: practiceLinks.topicsHub
      }
    ],
    ctaTitle: "Build a stronger networking foundation before you move deeper",
    ctaDescription:
      "Start free to review original lessons and guided practice, or compare plans to unlock the full lab and timed review workflow.",
    relatedHeading: "Related CCNA pages for this domain",
    relatedIntro:
      "These pages help you move from core theory into subnetting, switching, routing, and hands-on practice.",
    relatedLinks: [
      practiceLinks.subnetting,
      {
        route: APP_ROUTES.ccnaNetworkAccess,
        title: "CCNA Network Access",
        description:
          "Apply foundational knowledge to switching, VLANs, and trunking."
      },
      {
        route: APP_ROUTES.ccnaIpConnectivity,
        title: "CCNA IP Connectivity",
        description:
          "Build on addressing and traffic flow with routing and OSPF."
      },
      practiceLinks.labs,
      practiceLinks.practiceExams
    ]
  },
  {
    route: APP_ROUTES.ccnaNetworkAccess,
    title: "CCNA Network Access",
    metaTitle: "CCNA Network Access Explained for 200-301 v1.1",
    metaDescription:
      "Understand the CCNA network access domain for 200-301 v1.1, including switching, VLANs, trunking, inter-VLAN awareness, and local network segmentation.",
    primaryKeyword: "CCNA network access",
    secondaryKeywords: [
      "CCNA network access explained",
      "CCNA VLANs and trunking",
      "CCNA switching fundamentals",
      "CCNA inter-VLAN routing"
    ],
    schemaType: "Article",
    heroEyebrow: "CCNA Domain Guide",
    heroTitle: "CCNA network access explained for 200-301 v1.1.",
    heroDescription:
      "This domain focuses on how traffic moves inside local networks, how switches segment users with VLANs, and how trunk links and inter-VLAN design keep campus communication organized.",
    overviewHeading: "What network access covers in CCNA 200-301 v1.1",
    overviewIntro:
      "Network access is where switching concepts become practical. You need to understand how switches learn and forward traffic, how VLANs create separation, and how trunks carry multiple VLANs between devices without losing control of the design.",
    focusAreas: [
      {
        title: "Switching behavior and local forwarding",
        description:
          "Start with how switches learn MAC addresses, forward frames, and handle unknown destinations inside a LAN.",
        bullets: [
          "MAC learning and frame forwarding basics",
          "Broadcast domains and local delivery",
          "Why verification commands matter at Layer 2"
        ]
      },
      {
        title: "VLAN segmentation and trunks",
        description:
          "VLANs organize users and services into separate local segments, while trunk links carry those segments across shared switch links.",
        bullets: [
          "Access ports versus trunk ports",
          "VLAN segmentation and traffic isolation",
          "Native VLAN consistency and allowed VLAN awareness"
        ]
      },
      {
        title: "How local segments reach routed networks",
        description:
          "The exam expects you to understand that Layer 2 segmentation and routed communication must work together.",
        bullets: [
          "Inter-VLAN routing awareness",
          "How access-layer design supports the broader campus network",
          "Common misconfigurations that break local connectivity"
        ]
      }
    ],
    studyHeading: "How to practice the network access domain",
    studyIntro:
      "This is one of the best domains for hands-on reinforcement. VLANs, access ports, trunk links, and verification commands become easier once you build and troubleshoot them in a lab instead of only reading about them.",
    studySteps: [
      {
        title: "Use labs to make VLAN behavior visible",
        description:
          "A guided switching lab helps you see broadcast boundaries, trunk behavior, and why inter-VLAN traffic still needs routing.",
        link: practiceLinks.labs
      },
      {
        title: "Connect back to the fundamentals",
        description:
          "If switching terminology feels fuzzy, return to the fundamentals guide before pushing further into access-layer design.",
        link: {
          route: APP_ROUTES.ccnaNetworkFundamentals,
          title: "Review network fundamentals",
          description: "Reconnect switching work to the underlying models and traffic flow."
        }
      },
      {
        title: "Check retention with mixed review",
        description:
          "Once VLAN and trunking workflows feel familiar, use timed review to confirm you can recognize the right answer under pressure.",
        link: practiceLinks.practiceExams
      }
    ],
    ctaTitle: "Move from switching theory into practical VLAN confidence",
    ctaDescription:
      "Create a free account to start learning with original CertPrep Academy material, or compare plans to unlock the full labs and practice set.",
    relatedHeading: "Related pages for switching and segmentation",
    relatedIntro:
      "Use these links to connect network access study with fundamentals, labs, routing, and timed review.",
    relatedLinks: [
      {
        route: APP_ROUTES.ccnaNetworkFundamentals,
        title: "CCNA Network Fundamentals",
        description:
          "Refresh the base concepts that support switching and verification."
      },
      practiceLinks.labs,
      {
        route: APP_ROUTES.ccnaIpConnectivity,
        title: "CCNA IP Connectivity",
        description:
          "See how local VLAN design connects into routing and OSPF."
      },
      practiceLinks.practiceExams,
      practiceLinks.topicsHub
    ]
  },
  {
    route: APP_ROUTES.ccnaIpConnectivity,
    title: "CCNA IP Connectivity",
    metaTitle: "CCNA IP Connectivity Explained for 200-301 v1.1",
    metaDescription:
      "Study the CCNA IP connectivity domain for 200-301 v1.1, including static routing, default routes, OSPF, and practical path verification.",
    primaryKeyword: "CCNA IP connectivity",
    secondaryKeywords: [
      "CCNA IP connectivity explained",
      "CCNA static routes",
      "CCNA OSPF single area",
      "CCNA routing fundamentals"
    ],
    schemaType: "Article",
    heroEyebrow: "CCNA Domain Guide",
    heroTitle: "CCNA IP connectivity explained for 200-301 v1.1.",
    heroDescription:
      "IP connectivity is where addressing turns into routed reachability. This domain centers on how routers learn paths, choose next hops, and keep traffic moving between networks.",
    overviewHeading: "What IP connectivity covers in CCNA 200-301 v1.1",
    overviewIntro:
      "This domain is about making traffic leave one network and reach another predictably. You need to understand static routes, default routes, single-area OSPF behavior, and the verification habits that prove whether routing is working or failing.",
    focusAreas: [
      {
        title: "Static and default routing",
        description:
          "Static routes and default routes are core CCNA skills because they teach intentional path selection and clean route verification.",
        bullets: [
          "Next-hop logic and recursive route resolution",
          "When default routes simplify the design",
          "How routing mistakes show up during testing"
        ]
      },
      {
        title: "Single-area OSPF",
        description:
          "OSPF introduces dynamic routing behavior without requiring enterprise-scale complexity at the CCNA level.",
        bullets: [
          "Neighbor formation and adjacency basics",
          "LSA flooding and topology awareness",
          "Router IDs, costs, and practical troubleshooting order"
        ]
      },
      {
        title: "Verification and path analysis",
        description:
          "The exam expects you to recognize whether traffic is failing because of routing, interfaces, addressing, or an earlier design issue.",
        bullets: [
          "show ip route and interface verification habits",
          "Traceroute and end-to-end reasoning",
          "How routing fits with switching and service configuration"
        ]
      }
    ],
    studyHeading: "How to practice IP connectivity effectively",
    studyIntro:
      "Routing becomes much easier once you build small topologies and validate them step by step. Configure interfaces, add routes, verify the table, then test the path. That sequence builds the habit the exam rewards.",
    studySteps: [
      {
        title: "Build small routing labs first",
        description:
          "A simple two-router scenario is enough to make route tables, next hops, and verification output much easier to understand.",
        link: practiceLinks.labs
      },
      {
        title: "Keep subnetting sharp",
        description:
          "Many routing errors are really addressing errors, so subnetting speed still matters even when the topic looks more advanced.",
        link: practiceLinks.subnetting
      },
      {
        title: "Return to timed practice after labs",
        description:
          "Once you can read routes and verify reachability in context, use mixed review to spot whether you still hesitate on OSPF or path questions.",
        link: practiceLinks.practiceExams
      }
    ],
    ctaTitle: "Build routing confidence with original practice and guided review",
    ctaDescription:
      "Start free to explore the platform, or compare plans to unlock the full lesson, lab, and practice workflow for routing topics.",
    relatedHeading: "Related CCNA pages for routing study",
    relatedIntro:
      "Use these links to connect routing work with earlier fundamentals, services, labs, and timed review.",
    relatedLinks: [
      {
        route: APP_ROUTES.ccnaNetworkFundamentals,
        title: "CCNA Network Fundamentals",
        description:
          "Reconnect routing work to addressing, models, and core verification concepts."
      },
      {
        route: APP_ROUTES.ccnaIpServices,
        title: "CCNA IP Services",
        description:
          "See how DHCP, NAT, and other services depend on healthy routed connectivity."
      },
      practiceLinks.labs,
      practiceLinks.practiceExams,
      practiceLinks.topicsHub
    ]
  },
  {
    route: APP_ROUTES.ccnaIpServices,
    title: "CCNA IP Services",
    metaTitle: "CCNA IP Services Explained for 200-301 v1.1",
    metaDescription:
      "Learn the CCNA IP services domain for 200-301 v1.1, including DHCP, NAT, PAT, DNS, NTP, and the operational ideas behind service delivery.",
    primaryKeyword: "CCNA IP services",
    secondaryKeywords: [
      "CCNA IP services explained",
      "CCNA DHCP NAT NTP",
      "CCNA PAT basics",
      "CCNA service fundamentals"
    ],
    schemaType: "Article",
    heroEyebrow: "CCNA Domain Guide",
    heroTitle: "CCNA IP services explained for 200-301 v1.1.",
    heroDescription:
      "IP services covers the support systems that make networks usable day to day: address assignment, translation, naming, timing, and the logic behind operational service delivery.",
    overviewHeading: "What IP services covers in CCNA 200-301 v1.1",
    overviewIntro:
      "A network can have perfect switching and routing and still feel broken if the supporting services are misconfigured. That is why the CCNA includes DHCP, NAT, PAT, NTP, DNS, and related service concepts in its blueprint.",
    focusAreas: [
      {
        title: "Addressing and translation services",
        description:
          "These topics explain how users receive addresses and how private networks reach upstream destinations in controlled ways.",
        bullets: [
          "DHCP scopes, exclusions, and default-router behavior",
          "NAT and PAT translation logic",
          "Inside and outside interface awareness"
        ]
      },
      {
        title: "Name resolution and time services",
        description:
          "DNS and NTP often look simple on paper, but they shape usability, troubleshooting, and operational trust.",
        bullets: [
          "Why DNS matters to end-user experience",
          "How NTP supports logs, correlation, and authentication",
          "What service misconfiguration looks like in practice"
        ]
      },
      {
        title: "Operational verification",
        description:
          "The exam expects you to reason about what happens when services are missing, misapplied, or not aligned with the routed design.",
        bullets: [
          "Lease verification and translation table checks",
          "How services depend on healthy connectivity",
          "Troubleshooting from user symptom back to the service layer"
        ]
      }
    ],
    studyHeading: "How to study IP services without turning it into memorization only",
    studyIntro:
      "Service topics make more sense when you link each configuration to a user outcome. Ask what the service is solving, what output proves it is working, and what symptom shows up when it fails.",
    studySteps: [
      {
        title: "Use labs for service logic",
        description:
          "Original labs make DHCP scopes, PAT translations, and verification output easier to understand than memorizing isolated facts.",
        link: practiceLinks.labs
      },
      {
        title: "Review routing alongside services",
        description:
          "If services feel inconsistent, step back into the IP connectivity guide because many service failures are really path or interface problems.",
        link: {
          route: APP_ROUTES.ccnaIpConnectivity,
          title: "Review IP connectivity",
          description: "Reconnect service behavior to routed reachability."
        }
      },
      {
        title: "Check your weak spots with timed review",
        description:
          "Practice exams help you see whether service questions are failing because of recall, reasoning, or broader troubleshooting gaps.",
        link: practiceLinks.practiceExams
      }
    ],
    ctaTitle: "Make service behavior easier to reason about",
    ctaDescription:
      "Create a free account to start the study path, or compare plans to unlock the full original lesson, lab, and practice workflow.",
    relatedHeading: "Related CCNA pages for service topics",
    relatedIntro:
      "Use these pages to connect service behavior with routing, security, labs, and full-exam review.",
    relatedLinks: [
      {
        route: APP_ROUTES.ccnaIpConnectivity,
        title: "CCNA IP Connectivity",
        description:
          "Review the routed foundation that DHCP, NAT, and other services rely on."
      },
      {
        route: APP_ROUTES.ccnaSecurityFundamentals,
        title: "CCNA Security Fundamentals",
        description:
          "See how service design and secure management fit together operationally."
      },
      practiceLinks.labs,
      practiceLinks.practiceExams,
      practiceLinks.topicsHub
    ]
  },
  {
    route: APP_ROUTES.ccnaSecurityFundamentals,
    title: "CCNA Security Fundamentals",
    metaTitle: "CCNA Security Fundamentals Explained for 200-301 v1.1",
    metaDescription:
      "Study the CCNA security fundamentals domain for 200-301 v1.1, including secure management, hardening basics, ACLs, and traffic control logic.",
    primaryKeyword: "CCNA security fundamentals",
    secondaryKeywords: [
      "CCNA security fundamentals explained",
      "CCNA SSH and ACLs",
      "CCNA device hardening",
      "CCNA access control lists"
    ],
    schemaType: "Article",
    heroEyebrow: "CCNA Domain Guide",
    heroTitle: "CCNA security fundamentals explained for 200-301 v1.1.",
    heroDescription:
      "Security fundamentals focuses on safe device management, basic hardening, and traffic filtering logic so you can reason about protection without losing operational clarity.",
    overviewHeading: "What security fundamentals covers in CCNA 200-301 v1.1",
    overviewIntro:
      "The CCNA security domain is about practical security habits, not deep specialization. You should understand how to protect management access, reduce unnecessary exposure, and place filtering logic in the right place without breaking normal traffic flow.",
    focusAreas: [
      {
        title: "Secure management access",
        description:
          "Management plane security is one of the clearest ways the exam tests practical judgment.",
        bullets: [
          "SSH versus insecure remote access methods",
          "Credential handling and basic device hardening",
          "Why templates and standard practices reduce configuration drift"
        ]
      },
      {
        title: "Traffic control with ACLs",
        description:
          "ACLs are not just syntax questions. You need to understand what the list is trying to permit or deny and where it belongs.",
        bullets: [
          "Standard versus extended ACL awareness",
          "Placement logic near source or destination",
          "How rule order changes the outcome"
        ]
      },
      {
        title: "Operational security mindset",
        description:
          "The security domain rewards people who can explain why a control exists and what symptom appears when it is too loose or too restrictive.",
        bullets: [
          "Removing unused services and reducing attack surface",
          "Using verification after security changes",
          "Balancing protection with maintainable operations"
        ]
      }
    ],
    studyHeading: "How to practice security fundamentals for CCNA",
    studyIntro:
      "Security topics stick better when you configure them and then verify the result from both sides. Try the control, test access, observe what changed, and then explain the logic back in plain English.",
    studySteps: [
      {
        title: "Use original labs for SSH and ACL logic",
        description:
          "A guided lab makes it much easier to see how management settings and ACL placement affect actual traffic flow.",
        link: practiceLinks.labs
      },
      {
        title: "Keep services and routing in view",
        description:
          "ACL and management mistakes often look like general connectivity issues, so security study benefits from cross-domain review.",
        link: {
          route: APP_ROUTES.ccnaIpServices,
          title: "Review IP services",
          description: "Reconnect security policy to service delivery and user experience."
        }
      },
      {
        title: "Finish with mixed-domain review",
        description:
          "Timed practice helps you confirm whether you can still recognize the right control under exam pressure.",
        link: practiceLinks.practiceExams
      }
    ],
    ctaTitle: "Practice secure configuration with original CCNA study material",
    ctaDescription:
      "Start free to explore the platform, or compare plans to unlock the full labs, practice exams, and guided learning flow.",
    relatedHeading: "Related CCNA pages for security study",
    relatedIntro:
      "These links connect secure management and ACL logic with services, labs, and the full blueprint.",
    relatedLinks: [
      {
        route: APP_ROUTES.ccnaIpServices,
        title: "CCNA IP Services",
        description:
          "Connect filtering and management policy back to the service layer."
      },
      {
        route: APP_ROUTES.ccnaIpConnectivity,
        title: "CCNA IP Connectivity",
        description:
          "See how path selection and ACL placement can affect routed communication."
      },
      practiceLinks.labs,
      practiceLinks.practiceExams,
      practiceLinks.topicsHub
    ]
  },
  {
    route: APP_ROUTES.ccnaAutomationAndProgrammability,
    title: "CCNA Automation and Programmability",
    metaTitle: "CCNA Automation and Programmability Explained for 200-301 v1.1",
    metaDescription:
      "Understand the CCNA automation and programmability domain for 200-301 v1.1, including controllers, APIs, JSON, and network automation workflows.",
    primaryKeyword: "CCNA automation and programmability",
    secondaryKeywords: [
      "CCNA automation explained",
      "CCNA APIs and JSON",
      "CCNA controller based networking",
      "CCNA programmability domain"
    ],
    schemaType: "Article",
    heroEyebrow: "CCNA Domain Guide",
    heroTitle: "CCNA automation and programmability explained for 200-301 v1.1.",
    heroDescription:
      "This domain introduces the modern networking layer of controllers, APIs, JSON, and repeatable automation workflows without expecting advanced software engineering depth.",
    overviewHeading: "What automation and programmability covers in CCNA 200-301 v1.1",
    overviewIntro:
      "The automation domain is about understanding the direction of modern networks. You should know what controller-based networking is solving, why APIs matter, how JSON is used, and how repeatable workflows differ from manual per-device change habits.",
    focusAreas: [
      {
        title: "Controller-based networking concepts",
        description:
          "The exam expects conceptual fluency with policy-driven networking and central management models.",
        bullets: [
          "How controllers centralize configuration and telemetry",
          "Why source-of-truth discipline matters",
          "How intent differs from device-by-device changes"
        ]
      },
      {
        title: "APIs and structured data",
        description:
          "You do not need deep coding to score well here, but you do need to understand the purpose of structured exchanges.",
        bullets: [
          "Read-only versus configuration workflows",
          "JSON as a machine-readable data format",
          "Why APIs enable repeatable and consistent operations"
        ]
      },
      {
        title: "Automation workflow thinking",
        description:
          "This is where the domain becomes operational instead of theoretical.",
        bullets: [
          "Idempotent tasks and predictable outcomes",
          "Logging, validation, and rollback awareness",
          "How automation reduces repetitive manual work"
        ]
      }
    ],
    studyHeading: "How to study the automation domain without overcomplicating it",
    studyIntro:
      "Stay grounded in the CCNA scope. Focus on what controllers, APIs, and structured data are doing operationally, how they improve consistency, and how they fit beside the CLI skills you still need.",
    studySteps: [
      {
        title: "Start with concept-first explanations",
        description:
          "Make sure you can explain controller-based networking, APIs, and JSON in plain language before worrying about implementation detail.",
        link: practiceLinks.topicsHub
      },
      {
        title: "Use original practice to connect the ideas",
        description:
          "Original CertPrep Academy lessons and labs help you see where automation fits into real network workflows instead of treating it like a disconnected buzzword list.",
        link: practiceLinks.labs
      },
      {
        title: "Check readiness with mixed review",
        description:
          "Once the concepts feel clear, timed practice helps confirm you can distinguish controller, API, and workflow questions cleanly.",
        link: practiceLinks.practiceExams
      }
    ],
    ctaTitle: "Add modern networking context to your CCNA study plan",
    ctaDescription:
      "Create a free account to start with the original study path, or compare plans to unlock full practice, labs, and exam review.",
    relatedHeading: "Related CCNA pages for automation study",
    relatedIntro:
      "These links connect automation concepts with the larger blueprint, practical labs, and readiness checks.",
    relatedLinks: [
      {
        route: APP_ROUTES.ccnaNetworkFundamentals,
        title: "CCNA Network Fundamentals",
        description:
          "Reconnect modern automation ideas to the core networking concepts they still depend on."
      },
      {
        route: APP_ROUTES.ccnaIpServices,
        title: "CCNA IP Services",
        description:
          "See how structured workflows can support consistent service operations."
      },
      practiceLinks.labs,
      practiceLinks.practiceExams,
      practiceLinks.topicsHub
    ]
  }
];

export const ccnaAuthorityPageMap = Object.fromEntries(
  ccnaAuthorityPages.map((page) => [page.route, page])
) as Record<string, CcnaAuthorityPageContent>;

export const ccnaAuthorityPageLinks: AuthorityLink[] = ccnaAuthorityPages.map((page) => ({
  route: page.route,
  title: page.title,
  description: page.metaDescription
}));
