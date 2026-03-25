import { Card } from "@/components/ui/card";
import type { AdminDashboardStats } from "@/types/admin";

const statCards: Array<{
  key: keyof AdminDashboardStats;
  label: string;
}> = [
  { key: "certifications", label: "Certifications" },
  { key: "courses", label: "Courses" },
  { key: "lessons", label: "Lessons" },
  { key: "quizzes", label: "Quizzes" },
  { key: "labs", label: "Labs" },
  { key: "cliChallenges", label: "CLI Challenges" },
  { key: "tutors", label: "Tutors" },
  { key: "plans", label: "Plans" }
];

export function AdminStatsGrid({ stats }: { stats: AdminDashboardStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card) => {
        const metric = stats[card.key];

        return (
          <Card className="border-ink/5" key={card.key}>
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate">
                {card.label}
              </p>
              <div>
                <p className="font-display text-4xl font-bold text-ink">{metric.total}</p>
                {"published" in metric ? (
                  <p className="mt-2 text-sm text-slate">
                    {metric.published} published, {metric.draft} draft
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate">
                    {metric.active} active, {metric.inactive} inactive
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
