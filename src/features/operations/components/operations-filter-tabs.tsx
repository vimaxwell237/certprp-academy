import Link from "next/link";

import { cn } from "@/lib/utils";

export function OperationsFilterTabs({
  items,
  currentValue
}: {
  items: Array<{
    href: string;
    label: string;
    value: string;
  }>;
  currentValue: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => {
        const active = item.value === currentValue;

        return (
          <Link
            className={cn(
              "inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition",
              active
                ? "border-cyan/30 bg-cyan/10 text-cyan-900"
                : "border-ink/10 bg-white text-ink hover:border-cyan/30 hover:text-cyan"
            )}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
