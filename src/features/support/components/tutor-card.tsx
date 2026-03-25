import Link from "next/link";

import { Card } from "@/components/ui/card";
import { buildBookSessionHref } from "@/features/scheduling/lib/scheduling-link";
import type { TutorProfileSummary } from "@/types/support";

export function TutorCard({ tutor }: { tutor: TutorProfileSummary }) {
  return (
    <Card className="space-y-4 border-ink/5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Tutor
        </p>
        <h2 className="font-display text-2xl font-semibold text-ink">{tutor.displayName}</h2>
        <p className="text-base text-slate">{tutor.bio}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tutor.expertise.length > 0 ? (
          tutor.expertise.map((item) => (
            <span
              className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate"
              key={item}
            >
              {item}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            CCNA
          </span>
        )}
      </div>

      <Link
        className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
        href={buildBookSessionHref({
          tutorProfileId: tutor.id,
          subject: `Live help with ${tutor.displayName}`,
          category: "general"
        })}
      >
        Book Session
      </Link>
    </Card>
  );
}
