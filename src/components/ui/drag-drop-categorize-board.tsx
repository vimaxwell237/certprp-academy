"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { getDragDropBucketLabel } from "@/lib/questions/drag-drop";
import type { DragDropBucket } from "@/types/questions";

export interface DragDropCategorizeBoardItem {
  id: string;
  label: string;
  selectedBucketId: string | null;
  correctBucketId?: string | null;
}

function getItemStatus(
  item: DragDropCategorizeBoardItem,
  readOnly: boolean
): "default" | "correct" | "wrong" | "unanswered" {
  if (!readOnly || !item.correctBucketId) {
    return "default";
  }

  if (item.selectedBucketId === null) {
    return "unanswered";
  }

  if (item.selectedBucketId === item.correctBucketId) {
    return "correct";
  }

  return "wrong";
}

function getItemToneClassName(status: ReturnType<typeof getItemStatus>, inBucket: boolean) {
  if (!inBucket) {
    return "border-ink/10 bg-white text-ink shadow-[0_20px_50px_-42px_rgba(15,23,42,0.85)]";
  }

  if (status === "correct") {
    return "border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.98),rgba(255,255,255,0.96))] text-emerald-950 shadow-[0_20px_50px_-42px_rgba(5,150,105,0.45)]";
  }

  if (status === "wrong") {
    return "border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,0.98),rgba(255,255,255,0.96))] text-rose-950 shadow-[0_20px_50px_-42px_rgba(225,29,72,0.4)]";
  }

  if (status === "unanswered") {
    return "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96))] text-amber-950 shadow-[0_20px_50px_-42px_rgba(217,119,6,0.38)]";
  }

  return "border-cyan/20 bg-[linear-gradient(180deg,rgba(236,254,255,0.94),rgba(255,255,255,0.98))] text-ink shadow-[0_20px_50px_-42px_rgba(8,145,178,0.35)]";
}

function getStatusBadgeClassName(status: ReturnType<typeof getItemStatus>) {
  if (status === "correct") {
    return "border border-emerald-200 bg-emerald-100/80 text-emerald-900";
  }

  if (status === "wrong") {
    return "border border-rose-200 bg-rose-100/80 text-rose-900";
  }

  if (status === "unanswered") {
    return "border border-amber-200 bg-amber-100/80 text-amber-900";
  }

  return "border border-ink/10 bg-pearl text-slate";
}

export function DragDropCategorizeBoard({
  buckets,
  items,
  readOnly = false,
  onMoveItem,
  onUndoLastMove,
  canUndo = false,
  variant = "default"
}: {
  buckets: DragDropBucket[];
  items: DragDropCategorizeBoardItem[];
  readOnly?: boolean;
  onMoveItem?: (itemId: string, bucketId: string | null) => void;
  onUndoLastMove?: () => void;
  canUndo?: boolean;
  variant?: "default" | "compact";
}) {
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [activeDropTarget, setActiveDropTarget] = useState<string | null>(null);
  const isCompact = variant === "compact";

  const sourceItems = useMemo(
    () => items.filter((item) => (item.selectedBucketId ?? null) === null),
    [items]
  );

  const bucketItems = useMemo(() => {
    return buckets.map((bucket) => ({
      bucket,
      items: items.filter((item) => item.selectedBucketId === bucket.id)
    }));
  }, [buckets, items]);

  const placeholderSlots = readOnly
    ? 0
    : isCompact
      ? 1
      : Math.max(2, Math.ceil(items.length / Math.max(buckets.length, 1)));
  const totalPlacedCount = items.length - sourceItems.length;
  const showSourcePanel = !isCompact || sourceItems.length > 0 || readOnly;
  const useCompactHeightLock = false;
  const showUndoAction = !readOnly && isCompact && typeof onUndoLastMove === "function";

  function clearDragState() {
    setDraggingItemId(null);
    setActiveDropTarget(null);
  }

  function handleDrop(bucketId: string | null, itemId: string | null) {
    if (readOnly || !itemId) {
      clearDragState();
      return;
    }

    onMoveItem?.(itemId, bucketId);
    clearDragState();
  }

  function renderItem(item: DragDropCategorizeBoardItem, inBucket: boolean) {
    const status = getItemStatus(item, readOnly);
    const correctBucketLabel = getDragDropBucketLabel({ buckets }, item.correctBucketId ?? null);
    const toneClassName = getItemToneClassName(status, inBucket);
    const statusBadgeClassName = getStatusBadgeClassName(status);
    const compactToneClassName = readOnly
      ? status === "correct"
        ? "border-emerald-200 bg-emerald-50 text-emerald-950"
        : status === "wrong"
          ? "border-rose-200 bg-rose-50 text-rose-950"
          : status === "unanswered"
            ? "border-amber-200 bg-amber-50 text-amber-950"
            : "border-slate-200 bg-white text-ink"
      : inBucket
        ? "border-[#2c6572]/25 bg-[#2c6572] text-white"
        : "border-[#2c6572]/45 bg-white text-ink";
    const itemClassName = isCompact ? compactToneClassName : toneClassName;

    return (
      <div
        className={`rounded-[26px] border transition duration-200 ${
          isCompact ? "space-y-1.5 rounded-[16px] px-3 py-2.5 shadow-none" : "space-y-4 px-4 py-4"
        } ${
          draggingItemId === item.id ? "scale-[0.985] opacity-75" : "translate-y-0"
        } ${itemClassName}`}
        draggable={!readOnly}
        key={item.id}
        onDragEnd={clearDragState}
        onDragStart={(event) => {
          if (readOnly) {
            return;
          }

          event.dataTransfer.setData("text/plain", item.id);
          event.dataTransfer.effectAllowed = "move";
          setDraggingItemId(item.id);
        }}
      >
        {isCompact ? (
          <div className="space-y-1.5">
            <p className={`text-[13px] leading-5 ${readOnly ? "font-medium" : "font-semibold"}`}>
              {item.label}
            </p>
            {readOnly && status !== "correct" && correctBucketLabel ? (
              <p className="text-[11px] font-medium leading-4 opacity-90">
                Correct bucket: {correctBucketLabel}
              </p>
            ) : null}
            {readOnly && status !== "default" ? (
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                  status === "correct"
                    ? "bg-white/80 text-emerald-900"
                    : status === "wrong"
                      ? "bg-white/80 text-rose-900"
                      : "bg-white/80 text-amber-900"
                }`}
              >
                {status === "correct"
                  ? "Correct"
                  : status === "wrong"
                    ? "Review"
                    : "Unplaced"}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold leading-6">{item.label}</p>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${readOnly ? statusBadgeClassName : "border border-ink/10 bg-white/80 text-slate"}`}
              >
                {readOnly
                  ? status === "correct"
                    ? "Correct"
                    : status === "wrong"
                      ? "Review"
                      : status === "unanswered"
                        ? "Unplaced"
                        : "Placed"
                  : inBucket
                    ? "Placed"
                    : "Ready"}
              </span>
            </div>

            {readOnly && item.correctBucketId ? (
              <div className="flex flex-wrap gap-2">
                {status === "correct" ? (
                  <span className="rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                    Correct Placement
                  </span>
                ) : status === "wrong" ? (
                  <>
                    <span className="rounded-full border border-rose-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                      Wrong Bucket
                    </span>
                    {correctBucketLabel ? (
                      <span className="rounded-full border border-rose-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                        Correct: {correctBucketLabel}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <>
                    <span className="rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                      Not Placed
                    </span>
                    {correctBucketLabel ? (
                      <span className="rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                        Correct: {correctBucketLabel}
                      </span>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}
          </div>
        )}

        {!readOnly && !isCompact ? (
          <label
            className={`block ${
              "space-y-2"
            }`}
          >
            <select
              className={`w-full text-sm outline-none transition focus:border-cyan ${
                "rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-ink"
              }`}
              onChange={(event) => handleDrop(event.target.value || null, item.id)}
              value={item.selectedBucketId ?? ""}
            >
              <option value="">Statements Bank</option>
              {buckets.map((bucket) => (
                <option key={bucket.id} value={bucket.id}>
                  {bucket.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    );
  }

  return (
    <div className={isCompact ? "space-y-3" : "space-y-5"}>
      {!readOnly ? (
        isCompact ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate">
              Drag items into matching categories. Use undo to reverse the last move if needed.
            </p>
            {showUndoAction ? (
              <Button
                className="self-start px-3 py-2 text-[10px] uppercase tracking-[0.16em] sm:self-auto"
                disabled={!canUndo}
                onClick={onUndoLastMove}
                variant="secondary"
              >
                Undo Last Move
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="rounded-[30px] border border-cyan/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(255,255,255,0.98)_52%,rgba(245,158,11,0.12))] px-5 py-4 shadow-[0_24px_70px_-52px_rgba(8,145,178,0.65)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">
                  Drag And Drop
                </p>
                <p className="text-sm text-slate">
                  Drag each statement into the best-fit category. The quick-place selector stays
                  available for fast review and mobile use.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                <span className="rounded-full border border-ink/10 bg-white/90 px-3 py-1 text-ink">
                  {items.length} Total Items
                </span>
                <span className="rounded-full border border-cyan/20 bg-white/90 px-3 py-1 text-cyan">
                  {totalPlacedCount} Placed
                </span>
              </div>
            </div>
          </div>
        )
      ) : null}

      <div
        className={`grid gap-5 ${
          useCompactHeightLock ? "items-stretch lg:h-[42vh] lg:overflow-hidden" : "items-start"
        } ${
          showSourcePanel
            ? isCompact
              ? "lg:grid-cols-[minmax(16rem,0.8fr)_minmax(18rem,1.1fr)]"
              : "lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.28fr)]"
            : ""
        }`}
      >
        {showSourcePanel ? (
          <section
            className={`${useCompactHeightLock ? "lg:h-full lg:min-h-0 lg:flex lg:flex-col" : "self-start"} ${
              isCompact
                ? "space-y-3 rounded-[18px] border border-slate-200 bg-white p-3 shadow-none"
                : "space-y-5 rounded-[30px] border border-ink/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 shadow-[0_28px_80px_-58px_rgba(15,23,42,0.85)]"
            } ${
              activeDropTarget === "source"
                ? "ring-2 ring-cyan/30 ring-offset-2 ring-offset-white"
                : ""
            }`}
            onDragOver={(event) => {
              if (readOnly) {
                return;
              }

              event.preventDefault();
              setActiveDropTarget("source");
            }}
            onDragLeave={() => {
              if (!readOnly && activeDropTarget === "source") {
                setActiveDropTarget(null);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              handleDrop(null, event.dataTransfer.getData("text/plain") || draggingItemId);
            }}
          >
            {isCompact ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">
                  {readOnly ? "Unplaced" : "Statements"}
                </p>
                <h3 className="text-base font-semibold text-ink">
                  {readOnly ? "Not placed" : "Available items"}
                </h3>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">
                    {readOnly ? "Unplaced Options" : "Options"}
                  </p>
                  <h3 className="text-xl font-semibold text-ink">
                    {readOnly ? "Items not placed into a category" : "Answer bank"}
                  </h3>
                </div>
                <span className="rounded-full border border-ink/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
                  {sourceItems.length} Remaining
                </span>
              </div>
            )}

            <div
              className={`space-y-2.5 ${useCompactHeightLock ? "min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1" : ""}`}
            >
              {sourceItems.length === 0 ? (
                <div
                  className={`text-center text-sm text-slate ${
                    isCompact
                      ? "rounded-[16px] border border-dashed border-slate-300 bg-slate-50 px-3 py-3"
                      : "rounded-[26px] border border-dashed border-ink/10 bg-white/90 px-4 py-5"
                  }`}
                >
                  {readOnly
                    ? "Every item was placed into a category."
                    : "All statements have been placed into answer categories. Drag any item here to remove it from a bucket."}
                </div>
              ) : (
                sourceItems.map((item) => renderItem(item, false))
              )}
            </div>
          </section>
        ) : null}

        <section
          className={`${useCompactHeightLock ? "lg:h-full lg:min-h-0 lg:flex lg:flex-col" : ""} ${
            isCompact
              ? "rounded-[18px] border border-slate-200 bg-[#f3f3f3] p-3 shadow-none"
              : "rounded-[30px] border border-ink/10 bg-[linear-gradient(180deg,rgba(247,250,252,0.98),rgba(238,244,247,0.94))] p-5 shadow-[0_28px_80px_-58px_rgba(15,23,42,0.75)]"
          }`}
        >
          {isCompact ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">
                Categories
              </p>
              <h3 className="text-base font-semibold text-ink">Match items to the correct box</h3>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">
                  Categories
                </p>
                <h3 className="text-xl font-semibold text-ink">Drop targets</h3>
              </div>
              <span className="rounded-full border border-cyan/15 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan">
                {buckets.length} Bucket{buckets.length === 1 ? "" : "s"}
              </span>
            </div>
          )}

          <div
            className={`mt-4 ${
              isCompact
                ? "grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]"
                : "grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]"
            } ${useCompactHeightLock ? "min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1" : ""}`}
          >
            {bucketItems.map(({ bucket, items: placedItems }) => {
              const emptySlots = Math.max(0, placeholderSlots - Math.min(placedItems.length, 1));

              return (
                <div
                  className={`${
                    isCompact
                      ? "space-y-2 rounded-[14px] border border-slate-300 bg-white px-3 py-2.5 shadow-none"
                      : "space-y-4 rounded-[28px] border border-ink/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,250,0.96))] px-4 py-4 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.72)]"
                  } ${
                    activeDropTarget === bucket.id
                      ? "ring-2 ring-cyan/35 ring-offset-2 ring-offset-[#eef4f7]"
                      : ""
                  }`}
                  key={bucket.id}
                  onDragOver={(event) => {
                    if (readOnly) {
                      return;
                    }

                    event.preventDefault();
                    setActiveDropTarget(bucket.id);
                  }}
                  onDragLeave={() => {
                    if (!readOnly && activeDropTarget === bucket.id) {
                      setActiveDropTarget(null);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleDrop(bucket.id, event.dataTransfer.getData("text/plain") || draggingItemId);
                  }}
                >
                  {isCompact ? (
                    <p className="text-lg font-medium text-ink">{bucket.label}</p>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-ink">{bucket.label}</p>
                        <p className="text-[11px] text-slate">
                          {readOnly
                            ? "Review the learner placement against the expected bucket."
                            : "Drop matching statements into this category."}
                        </p>
                      </div>
                      <span className="rounded-full border border-ink/10 bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate">
                        {placedItems.length} Placed
                      </span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {placedItems.map((item) => renderItem(item, true))}
                    {Array.from({ length: emptySlots }).map((_, index) => (
                      <div
                        className={`flex items-center px-4 text-sm ${
                          isCompact
                            ? "min-h-[28px] rounded-[10px] border border-[#2c6572]/20 bg-[#2c6572] text-white/85"
                            : "min-h-[76px] rounded-[22px] border border-dashed border-cyan/20 bg-white/65 py-4 text-slate"
                        }`}
                        key={`${bucket.id}-placeholder-${index + 1}`}
                      >
                        {readOnly ? "" : "Drop item here"}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
