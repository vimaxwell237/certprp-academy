import type { AiTutorMessage } from "@/types/ai-tutor";
import { TutorFormattedResponse } from "./tutor-formatted-response";

export function TutorMessageBubble({
  compact = false,
  message
}: {
  message: AiTutorMessage;
  compact?: boolean;
}) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`${
          compact ? (isAssistant ? "max-w-full" : "max-w-[90%]") : "max-w-3xl"
        } ${compact ? "rounded-[1.5rem] px-4 py-3" : "rounded-3xl px-5 py-4"} shadow-soft ${
          isAssistant
            ? "border border-cyan/15 bg-white/95 text-ink"
            : "bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,145,178,0.88))] text-white"
        }`}
      >
        <p
          className={`text-xs font-semibold uppercase tracking-[0.16em] ${
            isAssistant ? "text-cyan" : "text-cyan-100"
          }`}
        >
          {isAssistant ? "AI Tutor" : "You"}
        </p>
        <div className={compact ? "mt-2.5" : "mt-3"}>
          {isAssistant ? (
            <TutorFormattedResponse compact={compact} content={message.content} />
          ) : (
            <div className={`whitespace-pre-wrap ${compact ? "text-[13px] leading-6" : "text-sm leading-7"}`}>
              {message.content}
            </div>
          )}
        </div>
        <p className={`${compact ? "mt-2 text-[11px]" : "mt-3 text-xs"} ${isAssistant ? "text-slate" : "text-slate-200"}`}>
          {new Date(message.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
