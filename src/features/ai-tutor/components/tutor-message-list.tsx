import type { AiTutorMessage } from "@/types/ai-tutor";

import { TutorMessageBubble } from "./tutor-message-bubble";

export function TutorMessageList({
  compact = false,
  messages
}: {
  messages: AiTutorMessage[];
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {messages.map((message) => (
        <TutorMessageBubble compact={compact} key={message.id} message={message} />
      ))}
    </div>
  );
}
