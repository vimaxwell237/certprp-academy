import type { CommunityTopic } from "@/types/community";

export const COMMUNITY_TOPIC_OPTIONS: Array<{
  value: CommunityTopic;
  label: string;
  description: string;
}> = [
  {
    value: "general",
    label: "General",
    description: "Open-ended CCNA discussion and study questions."
  },
  {
    value: "lesson_help",
    label: "Lesson Help",
    description: "Clarify confusing lesson concepts and exam notes."
  },
  {
    value: "subnetting",
    label: "Subnetting",
    description: "Ask for help with masks, ranges, and binary thinking."
  },
  {
    value: "routing",
    label: "Routing",
    description: "Discuss routing tables, static routes, and OSPF."
  },
  {
    value: "switching",
    label: "Switching",
    description: "Talk through VLANs, STP, EtherChannel, and Layer 2 behavior."
  },
  {
    value: "wireless",
    label: "Wireless",
    description: "Discuss wireless design, AP modes, and WLAN security."
  },
  {
    value: "labs",
    label: "Labs",
    description: "Share lab blockers and troubleshooting approaches."
  }
];

export function getCommunityTopicLabel(topic: CommunityTopic) {
  return (
    COMMUNITY_TOPIC_OPTIONS.find((option) => option.value === topic)?.label ?? "General"
  );
}
