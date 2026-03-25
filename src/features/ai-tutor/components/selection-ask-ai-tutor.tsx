"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import {
  ASK_AI_TUTOR_EVENT,
  type AskAiTutorEventDetail
} from "@/features/ai-tutor/lib/tutor-events";

type SelectionState = {
  left: number;
  text: string;
  top: number;
} | null;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeSelectionText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function SelectionAskAiTutor() {
  const pathname = usePathname();
  const [selectionState, setSelectionState] = useState<SelectionState>(null);

  useEffect(() => {
    function clearSelectionState() {
      setSelectionState(null);
    }

    function updateSelectionState(event?: Event) {
      const target = event?.target;

      if (
        target instanceof Element &&
        target.closest(
          "input, textarea, button, a, [contenteditable='true'], [data-no-ai-selection='true']"
        )
      ) {
        clearSelectionState();
        return;
      }

      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        clearSelectionState();
        return;
      }

      const text = normalizeSelectionText(selection.toString());

      if (text.length < 8) {
        clearSelectionState();
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (!rect.width && !rect.height) {
        clearSelectionState();
        return;
      }

      const top = rect.top > 72 ? rect.top - 48 : rect.bottom + 12;

      setSelectionState({
        left: clamp(rect.left + rect.width / 2 - 72, 12, window.innerWidth - 156),
        text: text.length > 320 ? `${text.slice(0, 317)}...` : text,
        top: clamp(top, 72, window.innerHeight - 72)
      });
    }

    function handleMouseUp(event: MouseEvent) {
      window.setTimeout(() => updateSelectionState(event), 0);
    }

    function handleKeyUp(event: KeyboardEvent) {
      window.setTimeout(() => updateSelectionState(event), 0);
    }

    function handleSelectionChange() {
      const selection = window.getSelection();

      if (!selection || selection.isCollapsed) {
        clearSelectionState();
      }
    }

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("selectionchange", handleSelectionChange);
    window.addEventListener("scroll", clearSelectionState, true);
    window.addEventListener("resize", clearSelectionState);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("selectionchange", handleSelectionChange);
      window.removeEventListener("scroll", clearSelectionState, true);
      window.removeEventListener("resize", clearSelectionState);
    };
  }, []);

  if (!selectionState || pathname === "/ai-tutor") {
    return null;
  }

  return (
    <button
      className="fixed z-[60] rounded-full border border-cyan/20 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,145,178,0.92))] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 hover:shadow-2xl"
      onClick={() => {
        const detail: AskAiTutorEventDetail = {
          lessonContext: `Highlighted text from ${pathname}`,
          question: `Explain this highlighted text in simple CCNA terms:\n\n"${selectionState.text}"`,
          source: "selection"
        };

        window.dispatchEvent(new CustomEvent(ASK_AI_TUTOR_EVENT, { detail }));
        window.getSelection()?.removeAllRanges();
        setSelectionState(null);
      }}
      style={{
        left: `${selectionState.left}px`,
        top: `${selectionState.top}px`
      }}
      type="button"
    >
      Ask AI Tutor
    </button>
  );
}
