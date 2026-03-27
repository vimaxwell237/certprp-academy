"use client";

import { useState } from "react";

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
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const formattedTimestamp = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`${
          compact ? (isAssistant ? "max-w-full" : "max-w-[90%]") : "max-w-4xl"
        } ${compact ? "rounded-[1.5rem] px-4 py-3" : "rounded-[2rem] px-5 py-4"} shadow-soft ${
          isAssistant
            ? "border border-cyan/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] text-ink"
            : "bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,145,178,0.88))] text-white"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.16em] ${
                isAssistant ? "text-cyan" : "text-cyan-100"
              }`}
            >
              {isAssistant ? "AI Tutor" : "You"}
            </p>
            {isAssistant ? (
              <p className={`${compact ? "mt-1 text-[11px]" : "mt-1 text-xs"} text-slate`}>
                Structured answer for faster review
              </p>
            ) : null}
          </div>

          {isAssistant ? (
            <button
              className={`inline-flex items-center rounded-full border border-ink/10 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate transition hover:border-cyan/30 hover:text-cyan ${
                compact ? "" : "shadow-sm"
              }`}
              onClick={handleCopy}
              type="button"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>
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
          {formattedTimestamp}
        </p>
      </div>
    </div>
  );
}
