import { AdminAppShell } from "@/features/admin/components/admin-app-shell";
import { requireAdminUser } from "@/lib/auth/roles";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireAdminUser();

  return <AdminAppShell>{children}</AdminAppShell>;
}
