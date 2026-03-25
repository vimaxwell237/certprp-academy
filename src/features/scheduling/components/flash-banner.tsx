import { cn } from "@/lib/utils";

export function FlashBanner({
  message,
  tone
}: {
  message: string;
  tone: "success" | "error" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border px-5 py-4 text-sm",
        tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : tone === "warning"
            ? "border-amber-200 bg-amber-50 text-amber-900"
            : "border-rose-200 bg-rose-50 text-rose-900"
      )}
    >
      {message}
    </div>
  );
}
