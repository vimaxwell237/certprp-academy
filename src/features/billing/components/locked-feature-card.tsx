import Link from "next/link";

import { Card } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/auth/redirects";

export function LockedFeatureCard({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="space-y-4 border-amber-200 bg-amber-50">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
          Upgrade Required
        </p>
        <h2 className="font-display text-3xl font-semibold text-amber-900">{title}</h2>
        <p className="text-base text-amber-900">{description}</p>
      </div>
      <Link
        className="inline-flex rounded-full border border-amber-700 px-5 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
        href={APP_ROUTES.pricing}
      >
        View Plans
      </Link>
    </Card>
  );
}
