"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

export interface NavDropdownItem {
  badgeCount?: number;
  href: string;
  label: string;
}

interface NavDropdownProps {
  align?: "left" | "right";
  footer?: ReactNode;
  isActive?: boolean;
  items: NavDropdownItem[];
  label: string;
  panelLabel?: string;
}

export function NavDropdown({
  align = "left",
  footer,
  isActive = false,
  items,
  label,
  panelLabel
}: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelId = `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-menu`;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const hasBadge = items.some((item) => (item.badgeCount ?? 0) > 0);

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 transition ${
          isActive
            ? "bg-white text-ink shadow-sm"
            : "text-slate hover:bg-white hover:text-ink"
        }`}
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span>{label}</span>
        {hasBadge ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-cyan px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {items.reduce((count, item) => count + (item.badgeCount ?? 0), 0)}
          </span>
        ) : null}
        <svg
          aria-hidden="true"
          className={`h-3.5 w-3.5 transition duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 12 12"
        >
          <path
            d="M2.25 4.5 6 8.25 9.75 4.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </button>

      {isOpen ? (
        <div
          className={`absolute top-[calc(100%+0.75rem)] z-50 min-w-64 animate-[dropdown-enter_180ms_ease-out] rounded-3xl border border-white/70 bg-white/95 p-3 shadow-xl shadow-slate-900/10 backdrop-blur ${
            align === "right" ? "right-0" : "left-0"
          }`}
          id={panelId}
          role="menu"
        >
          {panelLabel ? (
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate/70">
              {panelLabel}
            </p>
          ) : null}
          <div className="space-y-1">
            {items.map((item) => (
              <Link
                className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium text-ink transition hover:bg-mist"
                href={item.href}
                key={`${label}-${item.href}`}
                onClick={() => setIsOpen(false)}
                role="menuitem"
              >
                <span>{item.label}</span>
                {(item.badgeCount ?? 0) > 0 ? (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-cyan px-2 py-0.5 text-xs font-semibold text-white">
                    {item.badgeCount}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
          {footer ? <div className="mt-3 border-t border-ink/5 pt-3">{footer}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
