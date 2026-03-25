import Link from "next/link";

import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: APP_ROUTES.admin, label: "Overview" },
  { href: APP_ROUTES.adminOperations, label: "Operations" },
  { href: APP_ROUTES.adminOperationsDeliveries, label: "Deliveries" },
  { href: APP_ROUTES.adminOperationsJobs, label: "Jobs" },
  { href: APP_ROUTES.adminCertifications, label: "Certifications" },
  { href: APP_ROUTES.adminCourses, label: "Courses" },
  { href: APP_ROUTES.adminModules, label: "Modules" },
  { href: APP_ROUTES.adminLessons, label: "Lessons" },
  { href: APP_ROUTES.adminQuizzes, label: "Quizzes" },
  { href: APP_ROUTES.adminLabs, label: "Labs" },
  { href: APP_ROUTES.adminCliChallenges, label: "CLI Challenges" },
  { href: APP_ROUTES.adminTutors, label: "Tutors" },
  { href: APP_ROUTES.adminPlans, label: "Plans" }
];

export function AdminSidebar({ currentPath }: { currentPath: string }) {
  return (
    <aside className="w-full max-w-xs rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-soft backdrop-blur">
      <div className="space-y-3 border-b border-ink/5 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan">
          Content Ops
        </p>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-ink">Admin</h2>
          <p className="text-sm text-slate">
            Manage platform content, learner-facing availability, and queue operations.
          </p>
        </div>
        <AdminStatusBadge status="active" />
      </div>

      <nav className="mt-5 grid gap-2">
        {adminLinks.map((link) => {
          const active =
            currentPath === link.href ||
            (link.href !== APP_ROUTES.admin && currentPath.startsWith(link.href));

          return (
            <Link
              className={cn(
                "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                active
                  ? "bg-ink text-white shadow-soft"
                  : "bg-pearl text-slate hover:bg-white hover:text-ink"
              )}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
