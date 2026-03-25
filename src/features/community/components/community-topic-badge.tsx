import { getCommunityTopicLabel } from "@/features/community/lib/community-display";
import type { CommunityTopic } from "@/types/community";

export function CommunityTopicBadge({ topic }: { topic: CommunityTopic }) {
  return (
    <span className="rounded-full bg-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
      {getCommunityTopicLabel(topic)}
    </span>
  );
}
