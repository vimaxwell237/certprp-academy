import Link from "next/link";

import { Card } from "@/components/ui/card";
import { AdminSectionHeader } from "@/features/admin/components/admin-section-header";
import { AdminStatsGrid } from "@/features/admin/components/admin-stats-grid";
import { fetchAdminDashboardStats } from "@/features/admin/data/admin-service";
import { APP_ROUTES } from "@/lib/auth/redirects";

const quickLinks = [
  {
    href: APP_ROUTES.adminOperations,
    title: "Operations",
    description: "Inspect queue health, replay failed work, and keep reminders flowing."
  },
  {
    href: APP_ROUTES.adminCertifications,
    title: "Certifications",
    description: "Control track visibility and prepare new certification families."
  },
  {
    href: APP_ROUTES.adminCourses,
    title: "Courses",
    description: "Manage course shells, level labels, and learner-ready publish state."
  },
  {
    href: APP_ROUTES.adminLessons,
    title: "Lessons",
    description: "Edit lesson summaries, full content, timings, and video references."
  },
  {
    href: APP_ROUTES.adminPlans,
    title: "Plans",
    description: "Keep pricing plans accurate without dropping back into SQL."
  }
];

export default async function AdminDashboardPage() {
  const dashboard = await fetchAdminDashboardStats();

  return (
    <div className="space-y-8">
      <AdminSectionHeader
        description="Phase 10 introduces the first internal operations surface for content, tutors, and plans. Use this workspace to stage drafts, publish learner-facing assets, and keep core platform records current."
        eyebrow="Operations"
        title="Admin Dashboard"
      />

      {dashboard.warning ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-950">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
              Metrics Warning
            </p>
            <p className="text-sm">
              Admin routes are available, but the dashboard counts could not be loaded from
              Supabase.
            </p>
            <p className="rounded-2xl bg-white/80 px-4 py-3 text-xs">{dashboard.warning}</p>
          </div>
        </Card>
      ) : null}

      <AdminStatsGrid stats={dashboard.stats} />

      <div className="grid gap-5 lg:grid-cols-2">
        {quickLinks.map((link) => (
          <Card className="border-ink/5" key={link.href}>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                Workspace
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">{link.title}</h2>
              <p className="text-sm leading-7 text-slate">{link.description}</p>
              <Link
                className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                href={link.href}
              >
                Open {link.title}
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
